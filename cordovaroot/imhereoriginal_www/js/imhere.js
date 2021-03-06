;
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
							//var token = {at:'106013416-Ov4AqrHs4PFsz9DNrUwMcuUezWWfEV07D7E7oC9G', ats:'Ahpt5QJNSzr0WiCeJ8VIOTAMXnoZd3GLULDh9QrR5DVfd'};

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
var IMHERE_HASHTAG = "#imhereintyo";

//for test

function printProperties(obj) {
    var properties = '';
    for (var prop in obj){
        properties += prop + "=" + obj[prop] + "\n";
    }
    alert(properties);
};
