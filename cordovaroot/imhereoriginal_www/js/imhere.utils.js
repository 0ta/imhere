;
imhere.utils = function() {};
imhere.utils.getUrlVarsFromLocationHref = function() {
    return imhere.utils.getUrlVars(window.location.href);
}

imhere.utils.getUrlVars = function(url) {
    var vars = [],
        hash;
    var hashes = url.slice(url.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

imhere.utils.getPositionFromTweet = function(tweettext) {
	var ret = {};
	var undefined;
	if (tweettext.search(/Lat:(\d+.\d+)\//) != -1) {
		ret.latitude = RegExp.$1;
	} else {
		return undefined;
	}
	if (tweettext.search(/\/Long:(\d+.\d+)/) != -1) {
		ret.longitude = RegExp.$1;
	} else {
		return undefined;
	}
    return ret;
}

imhere.utils.getAccuracyText = function(accuracy) {
	if (!isFinite(accuracy)) {
		return 'NaN';
	}
	if (accuracy < 1000) {
		return accuracy + 'm';
	} else if (accuracy >= 1000) {
		return accuracy / 1000 + 'km orz..';
	}
}

// Target format "Thu Oct 16 05:06:03 +0000 2014"
imhere.utils.getCreatedTimeText = function(createdtime) {
	try {
		var timeinfo = createdtime.slice(4);
		var now = moment(timeinfo, "MMM DD HH:mm:ss Z YYYY");
		return now.format("MMM DD HH:mm:ss") + '(JST)';
	} catch(e) {
		return 'Invalid date'
	}
}

imhere.utils.deleteCookie = function(cookiename) {
    cName = cookiename + "=";
    dTime = new Date();
    dTime.setYear(dTime.getYear() - 1);
    document.cookie = cName + ";expires=" + dTime.toGMTString();
}

imhere.utils.playAudio = function(id) {
	// iOS等の場合は変更
    //var audioElement = document.getElementById(id);
	var url = "/android_asset/www/sound/imhere.mp3";
    var mymedia = new Media(url,
            // success callback
             function () { console.log("playAudio():Audio Success");},
            // error callback
             function (err) { console.log("playAudio():Audio Error: " + err);}
    );
    // Play audio
    mymedia.play();
}

imhere.utils.geoDistance = function(lat1, lng1, lat2, lng2, precision) {
	var undefined;
	if (precision === undefined) {
		precision = 0;
	}
    var distance = 0;
    if ((Math.abs(lat1 - lat2) < 0.00001) && (Math.abs(lng1 - lng2) < 0.00001)) {
        distance = 0;
    } else {
        lat1 = lat1 * Math.PI / 180;
        lng1 = lng1 * Math.PI / 180;
        lat2 = lat2 * Math.PI / 180;
        lng2 = lng2 * Math.PI / 180;
        var A = 6378140;
        var B = 6356755;
        var F = (A - B) / A;
        var P1 = Math.atan((B / A) * Math.tan(lat1));
        var P2 = Math.atan((B / A) * Math.tan(lat2));
        var X = Math.acos(Math.sin(P1) * Math.sin(P2) + Math.cos(P1) * Math.cos(P2) * Math.cos(lng1 - lng2));
        var L = (F / 8) * ((Math.sin(X) - X) * Math.pow((Math.sin(P1) + Math.sin(P2)), 2) / Math.pow(Math.cos(X / 2), 2) - (Math.sin(X) - X) * Math.pow(Math.sin(P1) - Math.sin(P2), 2) / Math.pow(Math.sin(X), 2));
        distance = A * (X + L);
        var decimal_no = Math.pow(10, precision);
        distance = Math.round(decimal_no * distance / 1) / decimal_no;
    }
    return distance;
}

imhere.utils.geoDirection = function(lat1, lng1, lat2, lng2) {
    var Y = Math.cos(lng2 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180 - lat1 * Math.PI / 180);
    var X = Math.cos(lng1 * Math.PI / 180) * Math.sin(lng2 * Math.PI / 180) - Math.sin(lng1 * Math.PI / 180) * Math.cos(lng2 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180 - lat1 * Math.PI / 180);
    var dirE0 = 180 * Math.atan2(Y, X) / Math.PI;
    if (dirE0 < 0) {
        dirE0 = dirE0 + 360;
    }
    var dirN0 = (dirE0 + 90) % 360;
	if (dirN0 > 22.5 && dirN0 <= 67.5) {
		return '北東';
	} else if(dirN0 > 67.5 && dirN0 <= 112.5) {
		return '東';
	} else if(dirN0 > 112.5 && dirN0 <= 157.5) {
		return '南東';
	} else if(dirN0 > 157.5 && dirN0 <= 202.5) {
		return '南';
	} else if(dirN0 > 202.5 && dirN0 <= 247.5) {
		return '南西';
	} else if(dirN0 > 247.5 && dirN0 <= 272.5) {
		return '西';
	} else if(dirN0 > 272.5 && dirN0 <= 337.5) {
		return '北西';
	} else {
		return '北';
	}
}