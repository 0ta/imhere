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