imhere.MainPage = (function() {
	// Event Method
	var onImHereClick = (function(event) {
		// Private Method
		var startImhereAnimation = (function () {
			// 画面Animation start
			var audio = document.getElementById("main-main-imhere-music");
			audio.play();
			$('#main-main-imhere').addClass('animated rubberBand');
			//reAttachToDom('main-main-imhere', 'rubberBand');
			$('#main-main-imhere').bind('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){reAttachToDom("main-main-imhere", "rubberBand")});
		});
		var startTweet = (function (tweettext) {
			// Tweet内容画面表示
			$('#main-main-tweet-text').text(tweettext);
			// Tweet
			imhereglobalcontext.twitterAPI.updateStatus(tweettext, "", "");
			// 画面Animation start
			$('#main-main-tweet-text').addClass('animated fadeOut');
			//reAttachToDom('main-main-tweet-text', 'fadeOut');
			$('#main-main-tweet-text').bind('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){reAttachToDom4TwitterText("main-main-tweet-text", "fadeOut")});
		});
		var reAttachToDom4TwitterText = (function (textid, cls) {
			var tweettextid = '#' + textid;
			$(tweettextid).text("");
			reAttachToDom(textid, cls);
		});
		var reAttachToDom = (function (textid, cls) {
			var elm = document.getElementById(textid);
			elm.classList.remove('animated');
			elm.classList.remove(cls);
			var newone = elm.cloneNode(true);
			elm.parentNode.replaceChild(newone, elm);
		});
		//
		// Start Logic!
		// Animation start
		//
		startImhereAnimation();
		// Metro API 呼び出し
		var metroapi = new imhere.MetroAPI();
		metroapi.getCurrentPosition().then(
			function(position){
				metroapi.getNearestStation(position).then(
					function(neareststation){
						// 駅にいる場合
						if(neareststation!=='undefined'){
							metroapi.getNearestExit(position).then(
								function(nearestexit){
									// 出口の側にいる場合
									if(nearestexit!=='undefined'){
										startTweet(neareststation.title + "駅の" + nearestexit.title + "で待っています。誤差は最大" + imhere.utils.getAccuracyText(position.accuracy) + "です。<Lat:" + position.latitude + "/Long:" + position.longitude + "> " + IMHERE_HASHTAG + " ");
									// 出口が側に無い場合
									}else{
										startTweet(neareststation.title + "駅に到着しました。誤差は最大" + imhere.utils.getAccuracyText(position.accuracy) + "です。<Lat:" + position.latitude + "/Long:" + position.longitude + "> " + IMHERE_HASHTAG + " ");
									}
									// Train statusを確認し、問題がある場合はWarningを出す
									metroapi.getRelatedTrainInformation(neareststation).then(
										function(relatedtraininformations) {
											for (var i=0; i<relatedtraininformations.length; i++) {
												alertify.warning = alertify.extend("warning");
												alertify.warning(relatedtraininformations[i]);
											}
										}
									);
								}
							);
						// 駅にいない場合
						} else {
							metroapi.getNearestRailway(position).then(
								function(nearestrailway){
									// 電車にのっている場合
									if(nearestrailway!=='undefined'){
										metroapi.getLocationBetweenStations(position, nearestrailway).then(
											function(trainpositions) {
												metroapi.getTrainInformation(nearestrailway).then(
													function(traininformation) {
														startTweet(nearestrailway.title + '線で' + trainpositions[0].title + '-' + trainpositions[1].title + '間を移動中です。' + nearestrailway.title + '線は、' + traininformation.trainInformationText + "誤差は最大" + imhere.utils.getAccuracyText(position.accuracy) + "です。<Lat:" + position.latitude + "/Long:" + position.longitude + "> " + IMHERE_HASHTAG + " ");
													}
												);
											}
										);
									// メトロ圏内にいない場合
									} else {
										startTweet('メトロ圏内にいません。∩(´･ω･`)つ―*’“*:..｡.:*･゜ﾟ･* 誤差は最大' + imhere.utils.getAccuracyText(position.accuracy) + 'です。<Lat:' + position.latitude + "/Long:" + position.longitude + "> " + IMHERE_HASHTAG + " ");
									}
								}
							);
						}
					}
				);
			}
		);
	});
	var onLogOffClick = (function(event) {
		// Confirm Message表示
		alertify.confirm("Do you want to log out？", function (e) {
			if (e) {
				// DBの削除
				var dbapi = new imhere.IndexedDbAPI();
				dbapi.openDB().then(
					function() {
						dbapi.deleteToken("twitter").then(
							function() {
								// TwitterAPIを初期化してログオン画面を呼び出す
								imhereglobalcontext.twitterAPI.initAPI();
								// Cookieの削除
								//imhere.utils.deleteCookie("auth_token");
								//imhere.utils.deleteCookie("_twitter_sess");
								window.location.href="#logon_page";
							}
						);
					}
				);
			} else {
				// Nothing to do
			}
		});
	});
	var toGoogleMapPage = (function() {
		$.mobile.changePage("#googlemap_page", {transition: 'slide'});
	});
    return {
        initModule: function() {
			// 画面作成


			// Event attach
			$('#main-main-imhere-a').click(onImHereClick);
			$('#main-header-logoff').click(onLogOffClick);
			$('#main-main-whereyourfriends-button').click(toGoogleMapPage);
			return true;
        }
    }
})();