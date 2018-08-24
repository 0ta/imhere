imhere.GoogleMapPage = (function() {
	// Event Method
	var onRefreshClick =(function(event) {
		alert("refresh!!");
		imhere.GoogleMapPage.reloadModule();
	});
	// Private Method
	var reloadingGooglelMap = (function (followerspositions){
		var metroapi = new imhere.MetroAPI();
		metroapi.getCurrentPosition().then(
			function(position){
				//マーカークリックイベント追加用内部Function
				var attachMessage = (function(marker, followersposition) {
					// InfoWindow表示用DOM作成
					var content = document.createElement('div');
					content.innerHTML = '<span style="color: blue">' + followersposition.name + 'さん was here at ' + followersposition.time + '!!!</span></br>' + followersposition.tweet + '</br>';
					var replylink = content.appendChild(document.createElement('a'));
					replylink.href="#";
					replylink.appendChild(document.createTextNode("返信はこちら"));
					google.maps.event.addDomListener(replylink, 'click', function(){
						replyTwitter(followersposition);
					});
					
					google.maps.event.addListener(marker, 'click', function(event) {
					    new google.maps.InfoWindow({
					        content: content
					    }).open(marker.getMap(), marker);
					});
				});
			    var latlng = new google.maps.LatLng(position.latitude, position.longitude);
			    var opts = {
			        zoom: 15,
			        center: latlng,
			        mapTypeId: google.maps.MapTypeId.ROADMAP
			    };
			    var mapObj = new google.maps.Map(document.getElementById("map_canvas"), opts);
				for (var i=0; i < followerspositions.length; i++) {
			        // MARKERイメージを作成
			        var markerImg = new google.maps.MarkerImage(
			            followerspositions[i].img,    // アイコン画像のパス
			            new google.maps.Size(35, 40),     // アイコン画像の表示させたい範囲（サイズ）
			            new google.maps.Point(0, 0),      // アイコン画像の表示させたい範囲の基準点（左上）
			            new google.maps.Point(35, 40),    // アイコン画像内のアンカー点の位置
			            new google.maps.Size(35, 40)      // アイコン画像の実際の表示サイズ
			        );
			        // MARKERオブジェクトを作成
			        var markerObj = new google.maps.Marker({
			            position: new google.maps.LatLng(followerspositions[i].latitude, followerspositions[i].longitude), // アイコンのアンカー点の緯度・経度
			            map: mapObj,                                           // 上で作成したMAPオブジェクトを指定
			            icon: markerImg                                        // 上で作成したMARKERイメージを指定
			        });
					attachMessage(markerObj, followerspositions[i]);
				}
			}
		);
	});
	var backMainPage = (function() {
		$.mobile.changePage("#main_page", {transition: 'slide', reverse: 'true'});
	});
	var replyTwitter = (function(follower) {
		// prompt dialog
		var toReply = "@" + follower.screen_name + " ";
		alertify.prompt("Reply", function (e, str) {
		    // str is the input text
		    if (e) {
		        // user clicked "ok"
				alert(follower.id);
				imhereglobalcontext.twitterAPI.updateStatus(str, "", follower.id);
				alertify.success("Tweet has successfully been sent....");
		    } else {
		        // user clicked "cancel"
		    }
		}, toReply);

	});
    return {
        initModule: function() {
			// 画面作成


			// Event attach
			$('#googlemap-header-back').click(backMainPage);
			$('#googlemap-header-reflesh').click(onRefreshClick);


			return true;
        },
		reloadModule: function() {
			alertify.log("Now loading map.........");
			imhereglobalcontext.twitterAPI.searchAllTweets().then(
				// TwitterでFollowerの位置情報確認
				function(d){
					var tweets = d["statuses"];
					var temp_followerspositions = {};
					var undefined;
					for (var i=0; i < tweets.length; i++) {
						var j = tweets.length - 1 - i;
						var tweet = tweets[j];
						var followersinformation = {};
						// id
						followersinformation["id"] = tweet.id_str;
						// Tweet
						followersinformation["tweet"] = tweet.text;
						// Screen name
						followersinformation["screen_name"] = tweet.user.screen_name;
						// Name
						followersinformation["name"] = tweet.user.name;
						// Photo
						followersinformation["img"] = tweet.user.profile_image_url;
						// Time
						followersinformation["time"] = imhere.utils.getCreatedTimeText(tweet.created_at);
						// Position
						var position = imhere.utils.getPositionFromTweet(tweet.text);
						if (position !== undefined) {
							followersinformation["latitude"] = position.latitude;
							followersinformation["longitude"] = position.longitude;
							// 連想配列に格納
							temp_followerspositions[tweet.user.id_str] = followersinformation;
						}
					}
					// 最後に配列に戻して終了
					var followerspositions = [];
				    for (var key in temp_followerspositions) {
				        followerspositions.push(temp_followerspositions[key]);
				    }
					alert(JSON.stringify(followerspositions));
					reloadingGooglelMap(followerspositions);
				}
			);
			return true;
		}
    }
})();