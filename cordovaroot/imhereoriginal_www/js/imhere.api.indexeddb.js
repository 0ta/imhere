;
// Pre action for webkit browser.
window.indexedDB = window.indexedDB || window.webkitIndexedDB ||
    window.mozIndexedDB;

if ('webkitIndexedDB' in window) {
    window.IDBTransaction = window.webkitIDBTransaction;
    window.IDBKeyRange = window.webkitIDBKeyRange;
}

// imhere.indexedDbAPI宣言
imhere.IndexedDbAPI = function() {
	// 明示的に初期化
	this.iDB = {};
};

imhere.IndexedDbAPI.prototype.openDB = function() {
	var def = new $.Deferred;
	var me = this;
	// Data Storeは初回だけ作成
    var request = indexedDB.open("imhereDB", 1);
	request.onsuccess = function (evt) {
		me.iDB = request.result;
		def.resolve();
	};
 
	request.onerror = function (evt) {
		console.log("IndexedDB error: " + evt.target.errorCode);
		def.reject("IndexedDB error: " + evt.target.errorCode);
	};

	request.onupgradeneeded = function(evt) {
		me.iDB = request.result;
	    // オブジェクトストア初期化
        if (me.iDB.objectStoreNames.contains("atokenStore")) {
	    	request.result.deleteObjectStore("atokenStore");
		}
	    // オブジェクトストア作成
	    var store = evt.target.result.createObjectStore(
	        "atokenStore", {
	            keyPath: "rservice"
	        }
	    );
	    console.log('objectStore defined.');
	};
	return def.promise();
};

imhere.IndexedDbAPI.prototype.searchToken = function(servicename) {
	var def = new $.Deferred;
    var db = this.iDB;
    var trans = db.transaction(["atokenStore"], "readwrite");
    var store = trans.objectStore("atokenStore");
	var request = store.get(servicename);
	request.onsuccess = function(evt) {
	    var ret = evt.target.result;
		def.resolve(ret);
	};
    request.onerror = function(evt) {
        console.log("IndexedDB error: " + evt.target.errorCode);
		def.reject("IndexedDB error: " + evt.target.errorCode);
    };
	return def.promise();
};

imhere.IndexedDbAPI.prototype.addToken = function(servicename, token) {
	var def = new $.Deferred;
    var db = this.iDB;
    var trans = db.transaction(["atokenStore"], "readwrite");
    var store = trans.objectStore("atokenStore");
    var data = {
        "rservice": servicename,
        "at": token.at,
		"ats": token.ats
    };
    var request = store.put(data);
    request.onsuccess = function(evt) {
		console.log("Success Adding: ", evt);
		def.resolve();
    };
    request.onerror = function(evt) {
        console.log("IndexedDB error: " + evt.target.errorCode);
		def.reject("IndexedDB error: " + evt.target.errorCode);
    };
	return def.promise();
};

imhere.IndexedDbAPI.prototype.deleteToken = function(servicename) {
	var def = new $.Deferred;
    var db = this.iDB;
    var trans = db.transaction(["atokenStore"], "readwrite");
    var store = trans.objectStore("atokenStore");
    var request = store.delete(servicename);
    request.onsuccess = function(evt) {
		console.log("Success Adding: ", evt);
		def.resolve();
    };
    request.onerror = function(evt) {
        console.log("IndexedDB error: " + evt.target.errorCode);
		def.reject("IndexedDB error: " + evt.target.errorCode);
    };
	return def.promise();
};