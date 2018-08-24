;
imhere.MainPage = (function() {
	// Event Method
	var onImHereClick = (function(event) {
		//alert("横幅 = " + window.parent.screen.width + " / 高さ = " + window.parent.screen.height);
		// Private Method
		var startImhereAnimation = (function () {
			// 画面Animation start
			//var audio = document.getElementById("main-main-imhere-music");
			//audio.play();
			imhere.utils.playAudio("main-main-imhere-music");
			$('#main-main-imhere').addClass('animated rubberBand');
			//reAttachToDom('main-main-imhere', 'rubberBand');
			$('#main-main-imhere').bind('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){reAttachToDom("main-main-imhere", "rubberBand")});
		});
		var startTweet = (function (tweettext) {
			// Tweet内容画面表示
			$('#main-main-tweet-text').text(tweettext);
			// 画面Animation start
			$('#main-main-tweet-text').addClass('animated fadeOut');
			// Textは同期でDomTreeをリセットする
			var elm = document.getElementById('main-main-tweet-text');
			var newone = elm.cloneNode(true);
			elm.parentNode.replaceChild(newone, elm);
			// Tweet
			imhereglobalcontext.twitterAPI.updateStatus(tweettext, "", "").then(
				function(d, dt){
					// 成功時は何もしない
				},
				function(e){
					var undefined;
					if(e.responseText!==undefined){
						var errorObj = JSON.parse(e.responseText);
						try {
							if(errorObj.errors[0].code==187){
								alertify.error("直近のTweetが同一位置データを参照しているため、このTweetは無効です");
							} else {
								alertify.error("予期せぬエラーのためTweetに失敗しました");
							}
						} catch(e) {
							alertify.error("予期せぬエラーのためTweetに失敗しました");
						}
					} else {
						alertify.error("オフラインのためTweetに失敗しました");
					}
				}
			);
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
										},
										function(e){
											alertify.error("オフラインのため処理に失敗しました");
										}
									);
								},
								function(e){
									alertify.error("オフラインのため処理に失敗しました");
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
													},
													function(e){
														alertify.error("オフラインのため処理に失敗しました");
													}
												);
											},
											function(e){
												alertify.error("オフラインのため処理に失敗しました");
											}
										);
									// 近くに駅もレールもない場合
									} else {
										metroapi.getNearStation(position).then(
											function(nearstation) {
												// 1.5KM以内にメトロの駅が存在する場合
												if(nearstation!=='undefined'){
													startTweet('近くにMetroの駅はありません。最寄の駅は' + nearstation.title + 'になります。' + imhere.utils.geoDirection(position.latitude, position.longitude, nearstation.lat, nearstation.long) + '方向に' + imhere.utils.geoDistance(position.latitude, position.longitude, nearstation.lat, nearstation.long) + 'm進んでください。誤差は最大' + imhere.utils.getAccuracyText(position.accuracy) + 'です。<Lat:' + position.latitude + "/Long:" + position.longitude + "> " + IMHERE_HASHTAG + " ");
													// Train statusを確認し、問題がある場合はWarningを出す
													metroapi.getRelatedTrainInformation(nearstation).then(
														function(relatedtraininformations) {
															for (var i=0; i<relatedtraininformations.length; i++) {
																alertify.warning = alertify.extend("warning");
																alertify.warning(relatedtraininformations[i]);
															}
														},
														function(e){
															alertify.error("オフラインのため処理に失敗しました");
														}
													);
												// まったく存在しない場合
												} else {
													startTweet('Metro圏内にいません。∩(´･ω･`)つ―**:｡.:*ﾟ･* 誤差は最大' + imhere.utils.getAccuracyText(position.accuracy) + 'です。<Lat:' + position.latitude + "/Long:" + position.longitude + "> " + IMHERE_HASHTAG + " ");
												}
											},
											function(e){
												alertify.error("オフラインのため処理に失敗しました");
											}
										);
									}
								},
								function(e){
									alertify.error("オフラインのため処理に失敗しました");
								}
							);
						}
					},
					function(e){
						alertify.error("オフラインのため処理に失敗しました");
					}
				);
			},
			function(e){
				alertify.error("位置情報が拾えませんでした");
			}
		);
	});
	var onLogOffClick = (function(event) {
		// Confirm Message表示
		alertify.set({ labels: {
		    ok     : "Yes",
		    cancel : "No"
		} });
		alertify.set({ buttonFocus: "ok" });
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
								$.mobile.changePage("#logon_page", {transition: 'none'});
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
		$.mobile.changePage("#googlemap_page", {transition: 'none'});
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