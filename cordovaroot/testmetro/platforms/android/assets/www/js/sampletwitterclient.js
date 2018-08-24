/*
 * twigadge.js - provide core API and settings
 */

var Twigadge = function() {
//-----------------------------------------------------------------------------
// Private variables
//-----------------------------------------------------------------------------
  var friends_tl_timer = null; // timer for friend_timeline
  var friends_tl_queue = null;
  var mentions_tl_queue = null;
  var system_msg_queue = null;
  var since_id = 1;
  var system_message_id = 0;
  var LOG_LEVEL = { ERROR: 0, WARNING: 1, NOTE: 2, INFO: 3};
 
// ---- Settings ----
  var Settings = function () {
    // connection tab
    this.atoken = '';
    this.atoken_secret = '';
    this.screen_name = '';
    this.interval = 3;
   
    // view tab
    this.skinName = 'default';
    this.width = 130;
    this.height = 200;
    this.autoScroll = true;
    this.fixedBlock = false;
   
    // etc tab
    this.buzztter = {};
    this.buzztter.enable = true;
    this.buzztter.interval = 15;
    this.queueSize = 100;
   
    // version tab
    this.checkVersion = true;
  };
 
 
  /**
   * Write access token to storage
   * @param[in] (string)atoken - access token
   * @param[in] (string)atoken_secret - access token secret
   * @param[in] (string)screen_name - screen name of the login user
   */
  Settings.prototype.writeAccessToken = function(atoken, atoken_secret, screen_name) {
    this.atoken = atoken;
    this.atoken_secret = atoken_secret;
    this.screen_name = screen_name;
    System.Gadget.Settings.write('atoken', atoken);
    System.Gadget.Settings.write('atoken_secret', atoken_secret);
    System.Gadget.Settings.write('screen_name', screen_name);
  }
 
  /**
   * write integer value with checking range
   * @param[in] (string)key - key of the settings
   * @param[in] (int)value - value to be set
   * @param[in] (int)default_value - it's used if input value is NaN
   * @param[in] (int)min - minimum limit of input
   * @param[in] (int)max - maximum limit of input
   */
  Settings.prototype.writeInt = function(key, value, default_value, min, max) {
    var v = parseInt(value);
    if(isNaN(v)) v = default_value;
    if(v < min) v = min;
    if(v > max) v = max;
    System.Gadget.Settings.write(key, v);
  };
  // setting variable
  var settings = new Settings();
 
  // ---- twitter API ----
  /**
   * Create new twitter API object
   * @param[in] (string)at - access token
   * @param[in] (string)ats - access token secret
   */
  var TwitterAPI = function (at, ats) {
    this.requestQueue = new Array();
    this.busy = false;
    this.consumer = {
      consumerKey   : 'hzA8A0zs2DzO4SH2sjY5UxJsG',
      consumerSecret: 'd9PjSJdCFhbUgrrwQIQfIKtCfhmIBZbvyOFleV8VqokobDwpdx'
    };
    this.token = '';
    this.token_secret = '';
    this.atoken = at;
    this.atoken_secret = ats;
  };
 
  /**
   * read next request from queue and send ajax request
   */
  TwitterAPI.prototype.nextRequest = function() {
    if(this.requestQueue.length == 0) return;
    if(this.busy) return;
    this.busy = true;
    $.ajax(this.requestQueue.shift());
  };
 
  /**
   * Post API
   */
  TwitterAPI.prototype.post = function(api, content, callback) {
    var accessor = {
      consumerSecret: this.consumer.consumerSecret,
      tokenSecret: this.atoken_secret
    };
   
    var message = {
      method: "POST",
      action: api,
      parameters: {
        oauth_signature_method: "HMAC-SHA1",
        oauth_consumer_key: this.consumer.consumerKey,
        oauth_token: this.atoken
      }
    };
    for ( var key in content ) {
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
        ViewManager.showProgress(Twigadge.CONNECT.POST_TL, true);
        callback(d, dt);
        Twigadge.nextRequest();
      },
      error: Twigadge.connectionError,
      timeout: 1000 * 50,
      beforeSend: function(xhr) {
        ViewManager.showProgress(Twigadge.CONNECT.POST_TL, false);
      }
    };
    this.requestQueue.push(options);
    this.nextRequest();
  }
 
  /**
   * Get API
   */
  TwitterAPI.prototype.get = function(api, callback) {
    var accessor = {
      consumerSecret: this.consumer.consumerSecret,
      tokenSecret: this.atoken_secret
    };
   
    var message = {
      method: "GET",
      action: api,
      parameters: {
        oauth_signature_method: "HMAC-SHA1",
        oauth_consumer_key: this.consumer.consumerKey,
        oauth_token: this.atoken
      }
    };
    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);
    var target = OAuth.addToURL(message.action, message.parameters);
    var options = {
      type: message.method,
      url: target,
      dataType: 'json',
      success: function(d, dt) {
        ViewManager.showProgress(Twigadge.CONNECT.FRIEND_TL, true);
        callback(d, dt);
        Twigadge.nextRequest();
      },
      error: Twigadge.connectionError,
      timeout: 1000 * 50,
      beforeSend: function(xhr) {
        ViewManager.showProgress(Twigadge.CONNECT.FRIEND_TL, false);
      }
    };
    this.requestQueue.push(options);
    this.nextRequest();
  };
 
  /**
   * get request token from twitter
   * @param[in] (string)errorMsg - error message if the request is retry.
   */
  TwitterAPI.prototype.getRequestToken = function(errorMsg) {
    var accessor = {
      consumerSecret: this.consumer.consumerSecret,
      tokenSecret: ''
    };
   
    var message = {
      method: "GET",
      action: "http://twitter.com/oauth/request_token",
      parameters: {
        oauth_signature_method: "HMAC-SHA1",
        oauth_consumer_key: this.consumer.consumerKey
      }
    };
    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);
    var target = OAuth.addToURL(message.action, message.parameters);
    var options = {
      type: message.method,
      url: target,
      success: function(d, dt) {
        ViewManager.showProgress(Twigadge.CONNECT.AUTH, true);
        d.search(/oauth_token=([\w-]+)\&/);
        twitterapi.token = RegExp.$1;
        d.search(/oauth_token_secret=([\w-]+)\&/);
        twitterapi.token_secret = RegExp.$1;
        ViewManager.showOAuthAuthorization(twitterapi.token, errorMsg);
        Twigadge.nextRequest();
      },
      error: Twigadge.connectionError,
      timeout: 1000 * 50
    };
    this.requestQueue.push(options);
    this.nextRequest();
  };
 
  TwitterAPI.prototype.getAccessToken = function(pin) {
    var accessor = {
      consumerSecret: this.consumer.consumerSecret,
      tokenSecret: this.token_secret
    };
   
    var message = {
      method: "GET",
      action: "http://twitter.com/oauth/access_token",
      parameters: {
        oauth_signature_method: "HMAC-SHA1",
        oauth_consumer_key: this.consumer.consumerKey,
        oauth_token: this.token,
        oauth_verifier: pin
      }
    };
    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);
    var target = OAuth.addToURL(message.action, message.parameters);
    var options = {
      type: message.method,
      url: target,
      success: function(d, dt) {
        ViewManager.showProgress(Twigadge.CONNECT.AUTH, true);
        d.search(/oauth_token=([\w-]+)\&/);
        twitterapi.atoken = RegExp.$1;
        d.search(/oauth_token_secret=([\w-]+)\&/);
        twitterapi.atoken_secret = RegExp.$1;
        d.search(/screen_name=([\w-]+)/);
        Twigadge.userSettings.writeAccessToken(twitterapi.atoken, twitterapi.atoken_secret, RegExp.$1);
        Twigadge.getFriendTL();
        Twigadge.nextRequest();
      },
      error: function() {
        twitterapi.getRequestToken(Local.wrongPIN);
        Twigadge.nextRequest();
      },
      timeout: 1000 * 50
    };
    this.requestQueue.push(options);
    this.nextRequest();
  };
 
  var twitterapi = null;
 
//-----------------------------------------------------------------------------
// Private methods
//-----------------------------------------------------------------------------
  // merge queue from JSON
  var mergeQueue = function(base, delta) {
    if(base[0] == null) {
      return delta;
    }
   
    for(var i = delta.length - 1; i >= 0; i--) {
      if(delta[i].id == base[0].id) {
        delta = delta.splice(0, i);
        break;
      }
    }
    base = delta.concat(base);
    base = base.splice(0, settings.queueSize);
    return base;
  };
 
  // controll timer
  var refreshFriendTL = function() {
    if(friends_tl_timer) {
      clearTimeout(friends_tl_timer);
    }
   
    var updateQueue = function(data, datatype) {
      if(friends_tl_queue) {
        friends_tl_queue = mergeQueue(friends_tl_queue, data);
      } else {
        friends_tl_queue = data;
      }
     
      ViewManager.updateFriendsTimeline(friends_tl_queue);
    };
    twitterapi.get('http://api.twitter.com/1/statuses/home_timeline.json?since_id=' + since_id, updateQueue);
   
    friends_tl_timer = setTimeout(function() { refreshFriendTL(); }, 1000 * 60 * settings.interval);
  };
 
  return {
//-----------------------------------------------------------------------------
// Public variables
//-----------------------------------------------------------------------------

    userSettings: settings,
    LOG_LV: LOG_LEVEL,
    CONNECT: { AUTH: 0, FRIEND_TL: 1, POST_TL: 2, ERROR: 3},
    FAVORITE: { TRUE: 0, FALSE: 1, CHANGING: 2},
    RETWEET: { TRUE: 0, FALSE: 1, CHANGING: 2},
//-----------------------------------------------------------------------------
// Public methods
//-----------------------------------------------------------------------------
    // ---- Twitter API call ----
    /**
     * Initialize twitterapi
     */
    init: function() {
      var settings = Twigadge.userSettings;
      ViewManager.loadSkin(settings.skinName);
      if(settings.atoken == '' || settings.atoken_secret == '') {
        twitterapi = new TwitterAPI('', '');
        Twigadge.getRequestToken();
        return false;
      } else {
        twitterapi = new TwitterAPI(settings.atoken, settings.atoken_secret);
        return true;
      }
    },
   
    /**
     * Call when the task of twitter API is finished
     */
    nextRequest: function() {
      twitterapi.busy = false;
      twitterapi.nextRequest();
    },
   
    /**
     * get friend timeline
     * if access token is not stored, start authorization.
     */
    getFriendTL: function() {
      if(Twigadge.init()) {
        refreshFriendTL();
      }
    },
   
    /**
     * get mentions
     * if access token is not stored, start authorization.
     */
    getMentions: function() {
      var update = function(data, datatype) {
        mentions_tl_queue = data;
        ViewManager.updateFriendsTimeline(mentions_tl_queue);
      };
      if(friends_tl_timer) {
        clearTimeout(friends_tl_timer);
      }
      if(Twigadge.init()) {
        twitterapi.get('http://api.twitter.com/1/statuses/mentions.json', update);
      }
    },
   
    /**
     * get DM
     * if access token is not stored, start authorization.
     */
    getDM: function() {
      var update = function(data, datatype) {
        ViewManager.updateDM(data);
      };
      if(friends_tl_timer) {
        clearTimeout(friends_tl_timer);
      }
      if(Twigadge.init()) {
        twitterapi.get('http://api.twitter.com/1/direct_messages.json', update);
      }
    },
   
    /**
     * return the twit of the ID
     * @param[in] (int)id
     * @return (twit)
     *         null if the twit of the ID is not found
     */
    getTwit: function(id) {
      if(friends_tl_queue != null) {
        for(var i = 0; i < friends_tl_queue.length; i++) {
          if(friends_tl_queue[i].id == id) {
            return friends_tl_queue[i];
          }
        }
      }
      if(mentions_tl_queue != null) {
        for(var i = 0; i < mentions_tl_queue.length; i++) {
          if(mentions_tl_queue[i].id == id) {
            return mentions_tl_queue[i];
          }
        }
      }
      return null;
    },
   
    /**
     * get request token from twitter
     */
    getRequestToken: function() {
      if(friends_tl_timer) {
        clearTimeout(friends_tl_timer);
      }
      twitterapi.getRequestToken();
    },
   
    /**
     * get access token from twitter
     * @param[in] (string)pin
     */
    authorize: function(pin) {
      if(friends_tl_timer) {
        clearTimeout(friends_tl_timer);
      }
      twitterapi.getAccessToken(pin);
    },
   
    /**
     * update the status of user
     * @param[in] uptext - user status to update
     * @param[in] reply_to - target status id for reply
     */
    updateStatus: function(uptext, reply_to) {
      var content = {status: uptext, source: 'twigadge'};
      if(reply_to != '') {
        content.in_reply_to_status_id = reply_to;
      }
      twitterapi.post('http://twitter.com/statuses/update.json', content, Twigadge.dummy);
      System.Gadget.Flyout.show = false;
    },
   
    /**
     * favorite the tweet
     * @param[in] id - favorite tweet id
     */
    favorite: function(id) {
      var callback = function(data, datatype) {
        twit = Twigadge.getTwit(id);
        if(twit != null) {
          twit.favorited = true;
        }
        ViewManager.updateFavStatusInTwitFlyout(Twigadge.FAVORITE.TRUE);
      };
      var content = {id: id};
      twitterapi.post('http://api.twitter.com/1/favorites/create/' + id + '.json', content, callback);
    },
   
    /**
     * unfavorite the tweet
     * @param[in] id - unfavorite tweet id
     */
    unfavorite: function(id) {
      var callback = function(data, datatype) {
        twit = Twigadge.getTwit(id);
        if(twit != null) {
          twit.favorited = false;
        }
        ViewManager.updateFavStatusInTwitFlyout(Twigadge.FAVORITE.FALSE);
      };
      var content = {id: id};
      twitterapi.post('http://api.twitter.com/1/favorites/destroy/' + id + '.json', content, callback);
    },
   
    /**
     * retweet the tweet
     * @param[in] id - tweet id
     */
    retweet: function(id) {
      var callback = function(data, datatype) {
        ViewManager.updateRetweetStatusInTwitFlyout(Twigadge.RETWEET.TRUE);
      };
      var content = {};
      twitterapi.post('http://api.twitter.com/1/statuses/retweet/' + id + '.json', content, callback);
    },
   
    // ---- UI update ----
    refresh: function() {
      if(Twigadge.init()) {
        ViewManager.updateFriendsTimeline(friends_tl_queue);
      }
    },
   
    notifyInformation: function(msg) {
      if(system_msg_queue == null) {
        system_msg_queue = new Array();
      }
      var message_unit = {
        level: Twigadge.LOG_LV.INFO,
        message: msg,
        time: new Date().getTime(),
        id: ++system_message_id
      };
      system_msg_queue.unshift(message_unit);
      system_msg_queue = system_msg_queue.splice(0, settings.queueSize);
      ViewManager.updateSystemMessage(system_msg_queue);
    },
   
    connectionError: function(xhr, textStatus, errorThrown) {
      ViewManager.showProgress(Twigadge.CONNECT.ERROR, true);
      if(xhr.status == '304') {
        Twigadge.notifyInformation(Local.error304);
      } else if(xhr.status == '400') {
        Twigadge.notifyInformation(Local.error40);
      } else if(xhr.status == '401') {
        Twigadge.notifyInformation(Local.error401);
      } else if(xhr.status == '403') {
        Twigadge.notifyInformation(Local.error403);
      } else if(xhr.status == '404') {
        Twigadge.notifyInformation(Local.error404);
      } else if(xhr.status == '500') {
        Twigadge.notifyInformation(Local.error500);
      } else if(xhr.status == '502') {
        Twigadge.notifyInformation(Local.error502);
      } else if(xhr.status == '503') {
        Twigadge.notifyInformation(Local.error503);
      } else {
        Twigadge.notifyInformation(Local.errorUnknown);
      }
      Twigadge.nextRequest();
    },
   
    dummy: function() {}
  };
}(); // Namespace twigadge

