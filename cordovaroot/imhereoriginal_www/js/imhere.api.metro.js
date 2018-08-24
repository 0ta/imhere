;
imhere.MetroAPI = function() {
    this.consumer = {
        consumerKey: '8e0dce63eacba7c35b6ae80c0aa5213385a3d03e04729c3f5926cb9ad8e060cf',
		datapointsUrl: 'https://api.tokyometroapp.jp/api/v2/datapoints?',
		placeUrl: 'https://api.tokyometroapp.jp/api/v2/places?'
    };
	this.trainName = {
		"odpt.Railway:TokyoMetro.Chiyoda": "千代田線",
		"odpt.Railway:TokyoMetro.Fukutoshin": "副都心線",
		"odpt.Railway:TokyoMetro.Ginza": "銀座線",
		"odpt.Railway:TokyoMetro.Hibiya": "日比谷線",
		"odpt.Railway:TokyoMetro.Marunouchi": "丸ノ内線",
		"odpt.Railway:TokyoMetro.Namboku": "南北線",
		"odpt.Railway:TokyoMetro.Tozai": "東西線",
		"odpt.Railway:TokyoMetro.Yurakucho": "有楽町線",
		"odpt.Railway:TokyoMetro.Hanzomon": "半蔵門線"
	}
};

imhere.MetroAPI.prototype.getCurrentPosition = function() {
/**
	var def = new $.Deferred;
	setTimeout(function(){
		var lat = $('#imhere_lat_text').val();
		if (lat == '') {
			lat = '35.684577';
		}
		var long = $('#imhere_long_text').val();
		if (long == '') {
			long = '139.741820';
		}
    	def.resolve({latitude:lat, longitude:long, accuracy:'20'});
	}, 200);
	return def.promise();
**/

	// for test
	//var lat = $('#imhere_lat_text').val();
	//var long = $('#imhere_long_text').val();


	var def = new $.Deferred;
	navigator.geolocation.getCurrentPosition(
		// Success
		function(position){



			// for test
			//if (lat !== "" || long !== "") {
			//	def.resolve({latitude:lat, longitude:long, accuracy:position.coords.accuracy});
			//} else {
			//	def.resolve({latitude:position.coords.latitude, longitude:position.coords.longitude, accuracy:position.coords.accuracy});
			//}

			def.resolve({latitude:position.coords.latitude, longitude:position.coords.longitude, accuracy:position.coords.accuracy});

		},
		// Failure
		function(e){
		    //alert('code: '    + error.code    + '\n' +
	        //	'message: ' + error.message + '\n');
			def.reject(e);
		},
		{
			enableHighAccuracy: true,
			timeout: 10000,
			maximumAge: 0
		}
	);
	return def.promise();
/**
	navigator.geolocation.getCurrentPosition(
		// Success
		function(position){
			//alert(position.coords.latitude);
			//alert(position.coords.longitude);
			//alert(position.coords.altitude);
			//alert(position.coords.accuracy);
			//alert(position.coords.altitudeAccuracy);
			//alert(position.coords.heading);
			//alert(position.coords.speed);
			//return {latitude:position.coords.latitude, longitude:position.coords.longitude, accuracy:position.coords.accuracy};
		},
		// Failure
		function(error){
			//to do
			alert("Failure");
		    alert('code: '    + error.code    + '\n' +
	        	'message: ' + error.message + '\n');
		},
		{
			enableHighAccuracy: true,
			timeout: 20000,
			maximumAge: 18000000
		}
	);
**/
};

imhere.MetroAPI.prototype.getNearStation = function(position) {
	var def = new $.Deferred;
	return this.getNearestStation(position, '1500', def);
};

imhere.MetroAPI.prototype.getNearestStation = function(position, nearradius, neardef) {
	var def;
	var undefined;
	if (nearradius !== undefined) {
		position.radius=nearradius;
		def = neardef;
	} else {
		position.radius='200';
		def = new $.Deferred;
	}
	position.type='odpt:Station';
	var target=imhere.MetroAPI.getPlaceUrl(this, position);
	var options = {
        type: "GET",
        url: target,
        success: function(d, dt) {
			var ret = 'undefined';
			if (d.length > 0) {
		    	ret = {title:d[0]['dc:title'], lat:d[0]['geo:lat'], long:d[0]['geo:long'], railway:d[0]['odpt:railway'], connectingrailway:d[0]['odpt:connectingRailway'], sameas:d[0]['owl:sameAs']};
			}
			def.resolve(ret);
        },
		error: function(e) {
			def.reject(e);
		}
    };
    $.ajax(options);
	return def.promise();
};

imhere.MetroAPI.prototype.getLocationBetweenStations = function(position, nearestrailway) {
	var def = new $.Deferred;
	position.radius='2000';
	position.type='odpt:Station';
	var target=imhere.MetroAPI.getPlaceUrl(this, position);
	var options = {
        type: "GET",
        url: target,
        success: function(d, dt) {
			var ret = [];
			for (var i=0; i<d.length; i++) {
				if (d[i]['odpt:railway'] === nearestrailway.sameas) {
					ret.push({title:d[i]['dc:title'], lat:d[i]['geo:lat'], long:d[i]['geo:long']});
				}
			}
			if (ret.length < 2) {
				ret = 'undefined';
			}
			def.resolve(ret);
        },
		error: function(e) {
			def.reject(e);
		}
    };
    $.ajax(options);
	return def.promise();
};

imhere.MetroAPI.prototype.getNearestExit = function(position) {
	var def = new $.Deferred;
	position.radius='30';
	position.type='ug:Poi';
	var target=imhere.MetroAPI.getPlaceUrl(this, position);
	var options = {
        type: "GET",
        url: target,
        success: function(d, dt) {
			var ret = 'undefined';
			if (d.length > 0) {
				ret = {title:d[0]['dc:title'], lat:d[0]['geo:lat'], long:d[0]['geo:long']};
			}
			def.resolve(ret);
        },
		error: function(e) {
			def.reject(e);
		}
    };
    $.ajax(options);
	return def.promise();
};

imhere.MetroAPI.prototype.getNearestRailway = function(position) {
	var def = new $.Deferred;
	position.radius='150';
	position.type='odpt:Railway';
	var target=imhere.MetroAPI.getPlaceUrl(this, position);
	var options = {
        type: "GET",
        url: target,
        success: function(d, dt) {
			var ret = 'undefined';
			if (d.length > 0) {
				ret = {title:d[0]['dc:title'], lat:d[0]['geo:lat'], long:d[0]['geo:long'], sameas:d[0]['owl:sameAs']};
			}
			def.resolve(ret);
        },
		error: function(e) {
			def.reject(e);
		}
    };
    $.ajax(options);
	return def.promise();
};

imhere.MetroAPI.prototype.getTrainInformation = function(nearestrailway) {
	var def = new $.Deferred;
	var undefined;
	var query = {}
	query.type='odpt:TrainInformation';

	// Branch路線対応
	// API使用変更後は更新予定
	var sameasrailway = nearestrailway.sameas.replace("Branch", "");

	query.condition={prop:'odpt:railway', value:sameasrailway};
	var target=imhere.MetroAPI.getDataPointsUrl(this, query);
	var options = {
        type: "GET",
        url: target,
        success: function(d, dt) {
			var ret = 'undefined';
			if (d.length > 0) {
				ret = {trainInformationText:d[0]['odpt:trainInformationStatus']};
				if (ret.trainInformationText === undefined) {
					ret = {trainInformationText:d[0]['odpt:trainInformationText']};
				} else {
					ret = {trainInformationText:d[0]['odpt:trainInformationStatus'] + "しています。"};
				}
			}
			def.resolve(ret);
        },
		error: function(e) {
			def.reject(e);
		}
    };
    $.ajax(options);
	return def.promise();
};

imhere.MetroAPI.prototype.getRelatedTrainInformation = function(neareststation) {
	var def = new $.Deferred;
	var undefined;
	var me = this;
	var query = {};
	query.type='odpt:TrainInformation';
	var target=imhere.MetroAPI.getDataPointsUrl(this, query);
	var options = {
        type: "GET",
        url: target,
        success: function(d, dt) {
			var ret = [];
			if (d.length > 0) {
				var connectingrailways = neareststation.connectingrailway;
				connectingrailways.push(neareststation.railway);
				for (var i=0; i<d.length; i++) {
					var traininfo = {railway:d[i]['odpt:railway'], trainInformationText:d[i]['odpt:trainInformationText'], trainInformationStatus:d[i]['odpt:trainInformationStatus']};



					// for test
					//if (traininfo.railway ==="odpt.Railway:TokyoMetro.Tozai") {
					//	traininfo.trainInformationStatus="折り返し運転";
					//}



					
					for (var j=0; j<connectingrailways.length; j++) {
						var connectingrailway = connectingrailways[j];

						// Branch路線対応
						// API使用変更後は更新予定
						connectingrailway = connectingrailway.replace("Branch", "");

						if (traininfo.railway === connectingrailway) {
							if (traininfo.trainInformationStatus !== undefined) {
								ret.push(me.trainName[traininfo.railway] + "は、" + traininfo.trainInformationStatus + "しています。");
							}
						}
					}
				}
			}
			def.resolve(ret);
        },
		error: function(e) {
			def.reject(e);
		}
    };
    $.ajax(options);
	return def.promise();
};

imhere.MetroAPI.getPlaceUrl = function(obj, query) {
	return obj.consumer.placeUrl+'rdf:type='+query.type+'&lon='+query.longitude+'&lat='+query.latitude+'&radius='+query.radius+'&acl:consumerKey='+obj.consumer.consumerKey
};

imhere.MetroAPI.getDataPointsUrl = function(obj, query) {
	var undefined;
	var ret =  obj.consumer.datapointsUrl+'rdf:type='+query.type;
	if (query.condition !== undefined){
		ret = ret + '&' + query.condition.prop + '=' + query.condition.value;
	}
	ret = ret + '&acl:consumerKey='+obj.consumer.consumerKey;
	return ret;
};