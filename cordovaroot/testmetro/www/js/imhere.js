var imhere = (function() {
    return {
        initImhere: function() {
			var def = new $.Deferred;

			// Še‰æ–Ê‚Ì‰Šú‰»
			imhere.LogonPage.initModule();
			imhere.MainPage.initModule();
	        imhere.GoogleMapPage.initModule();

			// IndexedDB‚æ‚èAccess Token‚Ìæ“¾
			var dbapi = new imhere.IndexedDbAPI();
			dbapi.openDB().then(
				function() {
					dbapi.searchToken("twitter").then(
						function(token) {
							var undefined;

							// for test
							var token = {at:"106013416-IgLnOn9SKXs5H9ND5zmRA6ama3WZbeXXzzsUdRtj", ats:"jSQAIpevjz7IxbLpFpNpMeh4s8Mc8UTA09ygySrCwDdVM"};

							if (token === undefined) {
								// Token‚ª‚È‚¢ê‡‚ÍLogon‰æ–Ê‚Ö
								var twitterapi = new imhere.TwitterAPI();
							} else {
								// Token‚ª‚ ‚Á‚½ê‡‚ÍTwitterAPI‚ğŒÄ‚Ño‚µA‚»‚Ì‚Ü‚ÜMain‰æ–Ê‚Ö
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

// Global’è”
var IMHERE_HASHTAG = "#imheretest";

//for test
function printProperties(obj) {
    var properties = '';
    for (var prop in obj){
        properties += prop + "=" + obj[prop] + "\n";
    }
    alert(properties);
};