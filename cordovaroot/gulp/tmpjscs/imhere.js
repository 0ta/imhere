function printProperties(e){var r="";for(var i in e)r+=i+"="+e[i]+"\n";alert(r)}var imhere=function(){return{initImhere:function(){var e=new $.Deferred;imhere.LogonPage.initModule(),imhere.MainPage.initModule(),imhere.GoogleMapPage.initModule();var r=new imhere.IndexedDbAPI;return r.openDB().then(function(){r.searchToken("twitter").then(function(r){var i;if(r===i)var n=new imhere.TwitterAPI;else var n=new imhere.TwitterAPI(r.at,r.ats);e.resolve({twitterAPI:n})})}),e.promise()}}}(),IMHERE_HASHTAG="#imhereintyo";