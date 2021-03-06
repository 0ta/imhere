var imhere = (function() {
    return {
        initImhere: function() {
			var def = new $.Deferred;

			// 各画面の初期化
			imhere.LogonPage.initModule();
			imhere.MainPage.initModule();
	        imhere.GoogleMapPage.initModule();

			// IndexedDBよりAccess Tokenの取得
			var dbapi = new imhere.IndexedDbAPI();
			dbapi.openDB().then(
				function() {
					dbapi.searchToken("twitter").then(
						function(token) {
							var undefined;

							// for test
							var token = {at:"106013416-IgLnOn9SKXs5H9ND5zmRA6ama3WZbeXXzzsUdRtj", ats:"jSQAIpevjz7IxbLpFpNpMeh4s8Mc8UTA09ygySrCwDdVM"};

							if (token === undefined) {
								// Tokenがない場合はLogon画面へ
								var twitterapi = new imhere.TwitterAPI();
							} else {
								// Tokenがあった場合はTwitterAPIを呼び出し、そのままMain画面へ
				            	var twitterapi = new imhere.TwitterAPI(token.at, token.ats);
							}
							def.resolve({twitterAPI:twitterapi});
						}
					);
				}
			);
			return def.promise();
        }
    }
})();

// Global定数
var IMHERE_HASHTAG = "#imheretest";

//for test
function printProperties(obj) {
    var properties = '';
    for (var prop in obj){
        properties += prop + "=" + obj[prop] + "\n";
    }
    alert(properties);
};