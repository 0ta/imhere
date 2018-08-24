;
imhere.TwitterAPI = function(at, ats) {
    //this.requestQueue = new Array();
    //this.busy = false;
    this.consumer = {
        consumerKey: 'QS31zTayk8JraIqyEMpqYNKpM',
        consumerSecret: 'vTWbyyXbIFgQnOH65TPlGzdmXzVvHodewttw5HH00xqCVEDShQ'
    };
    this.token = '';
    this.token_secret = '';
    this.atoken = at;
    this.atoken_secret = ats;
};

imhere.TwitterAPI.prototype.isAvailable = function() {
	var undefined;
	if (this.atoken !== undefined) {
		return true;
	}
	return false;
};

imhere.TwitterAPI.prototype.getRequestToken = function() {
	var def = new $.Deferred;
    var accessor = {
        consumerSecret: this.consumer.consumerSecret,
        tokenSecret: ''
    };
    var message = {
        method: "GET",
        action: "https://twitter.com/oauth/request_token",
        parameters: {
            oauth_callback: "http://127.0.0.1/imhere/index.html",
            oauth_consumer_key: this.consumer.consumerKey,
            oauth_signature_method: "HMAC-SHA1"
        }
    };
    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);
    var target = OAuth.addToURL(message.action, message.parameters);
    var me = this;
    var options = {
        type: message.method,
        url: target,
        success: function(d, dt) {
            /* 値取得後Redirect Methodを実行 */
            d.search(/oauth_token=([\w-]+)\&/);
            me.token = RegExp.$1;
            d.search(/oauth_token_secret=([\w-]+)\&/);
            me.token_secret = RegExp.$1;
			def.resolve();
        },
		error: function(e) {
			def.reject(e);
		}
    };
    $.ajax(options); // 送信
	return def.promise();
};

imhere.TwitterAPI.prototype.userAuthentication = function() {
	var def = new $.Deferred;
    var accessor = {
        consumerSecret: this.consumer.consumerSecret,
        tokenSecret: this.token_secret // Request Token Secret
    };
    var message = {
        method: "GET",
//        action: "https://twitter.com/oauth/authenticate",
        action: "https://twitter.com/oauth/authorize",
        parameters: {
            oauth_signature_method: "HMAC-SHA1",
            oauth_consumer_key: this.consumer.consumerKey,
            oauth_token: this.token, // Request Token,
			force_login: "false"
        }
    };
    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);
    var target = OAuth.addToURL(message.action, message.parameters);
    var options = {
        type: message.method,
        url: target,
        success: function(d, dt) {
            //ここでは使用しない。
        },
    };
    // for pure web application.
    //window.location = options.url;
    //$('#mainform').attr('method',options.type).attr('action','http://www.google.co.jp/test).submit();
	// for cordova + Android
    var loginWindow;
    var undefined;
    var me = this;
    // Inappbrowser load start handler: Used when running in Cordova only
    function getAccessToken(event) {
        var url = event.url;
        var oauthtoken = (imhere.utils.getUrlVars(event.url))['oauth_token'];
        var verifier = (imhere.utils.getUrlVars(event.url))['oauth_verifier'];
        if (verifier !== undefined) {
			// Token取得成功
	        loginWindow.close();
			def.resolve(oauthtoken, verifier);
        } else if (url.indexOf("http://127.0.0.1/imhere/index.html")!=-1) {
			// 127.0.0.1Callbackアプリケーション呼び出しの場合も同様に処理を戻す
			loginWindow.close();
			def.resolve(oauthtoken, verifier);
		} else if (url.indexOf("cancel")!=-1) {
			// cancelの場合も同様に処理を戻す
			loginWindow.close();
			def.resolve(oauthtoken, verifier);
		}
	}
	loginWindow = window.open(options.url, '_blank', 'location=no');
    loginWindow.addEventListener('loadstart', getAccessToken);
	return def.promise();
};

imhere.TwitterAPI.prototype.getAccessToken = function(oauthtoken, verifier) {
	var def = new $.Deferred;
    var accessor = {
        consumerSecret: this.consumer.consumerSecret,
        tokenSecret: this.token_secret // Request Token Secret
    };

    var message = {
        method: "GET",
        action: "https://twitter.com/oauth/access_token",
        parameters: {
            oauth_signature_method: "HMAC-SHA1",
            oauth_consumer_key: this.consumer.consumerKey,
            oauth_token: oauthtoken, // Request Token
            oauth_verifier: verifier
        }
    };
    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);
    var target = OAuth.addToURL(message.action, message.parameters);
    var me = this;
    var options = {
        type: message.method,
        url: target,
        success: function(d, dt) {
            /* 返り値からAccess Token/Access Token Secretを取り出す */
            d.search(/oauth_token=([\w-]+)\&/);
            me.atoken = RegExp.$1;
            d.search(/oauth_token_secret=([\w-]+)\&/);
            me.atoken_secret = RegExp.$1;
			def.resolve(me.atoken, me.atoken_secret);
        },
		error: function(e) {
			def.reject(e);
		}
    };
    $.ajax(options); // 送信
	return def.promise();
};

imhere.TwitterAPI.prototype.post = function(api, content, def) {
    var accessor = {
        consumerSecret: this.consumer.consumerSecret,
        tokenSecret: this.atoken_secret // Access Token Secret
    };

    var message = {
        method: "POST",
        action: api,
        parameters: {
            oauth_signature_method: "HMAC-SHA1",
            oauth_consumer_key: this.consumer.consumerKey,
            oauth_token: this.atoken // Access Token
        }
    };
    // 送信するデータをパラメータに追加する
    for (var key in content) {
        message.parameters[key] = content[key];
    }
    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);
    var target = OAuth.addToURL(message.action, message.parameters);
    var options = {
        type: message.method,
        url: target,
        dataType: 'json',
        success: function(d, dt) {
			def.resolve(d, dt);
        },
		error: function(e) {
			def.reject(e);
		}
    };
    $.ajax(options); // 送信
	return def;
};

/**
 * update the status of user
 * @param[in] uptext - user status to update
 * @param[in] reply_to - target status id for reply
 */
imhere.TwitterAPI.prototype.updateStatus = function(uptext, position, reply_to) {
	var def = new $.Deferred;
    var content = {
        status: uptext,
        source: 'metoro',
		lat:position.latitude,
		long:position.longitude	
    };
    if (reply_to !== '') {
        content.in_reply_to_status_id = reply_to;
    }
    this.post('https://api.twitter.com/1.1/statuses/update.json', content, def);
	return def.promise();
};

imhere.TwitterAPI.prototype.search = function(api, content, def) {
    var accessor = {
        consumerSecret: this.consumer.consumerSecret,
        tokenSecret: this.atoken_secret // Access Token Secret
    };

    var message = {
        method: "GET",
        action: "https://api.twitter.com/1.1/search/tweets.json",
        parameters: {
            oauth_signature_method: "HMAC-SHA1",
            oauth_consumer_key: this.consumer.consumerKey,
            oauth_token: this.atoken // Access Token
        }
    };
    // 送信するデータをパラメータに追加する
    for (var key in content) {
        message.parameters[key] = content[key];
    }
    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);
    var target = OAuth.addToURL(message.action, message.parameters);
    var options = {
        type: message.method,
        url: target,
        dataType: 'json',
        success: function(d, dt) {
        	def.resolve(d);
        },
		error: function(e) {
			def.reject(e);
		}
    };
    $.ajax(options); // 送信
	return def;
};

/**
 * search for all tweets with #imhere!!!
 */
imhere.TwitterAPI.prototype.searchAllTweets = function() {
	var def = new $.Deferred;
	// test
	query = '%23imhereintyo';
    var content = {
		q:query,
		count:100,
		result_type:"recent"
    };
    this.search('https://api.twitter.com/1.1/search/tweets.json', content, def);
	return def.promise();
};

imhere.TwitterAPI.prototype.initAPI = function() {
	var undefined;
    this.token = '';
    this.token_secret = '';
	this.atoken = undefined;
	this.atoken_secret = undefined;
};