;
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
							//var token = {at:'106013416-Ov4AqrHs4PFsz9DNrUwMcuUezWWfEV07D7E7oC9G', ats:'Ahpt5QJNSzr0WiCeJ8VIOTAMXnoZd3GLULDh9QrR5DVfd'};

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
var IMHERE_HASHTAG = "#imhereintyo";

//for test

function printProperties(obj) {
    var properties = '';
    for (var prop in obj){
        properties += prop + "=" + obj[prop] + "\n";
    }
    alert(properties);
};
