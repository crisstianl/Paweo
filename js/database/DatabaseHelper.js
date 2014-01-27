var VIDEOS = "videos";

DatabaseHelper = function() {
	this.name = "paweo";
	this.version = 2;
	this.db = null;
};

DatabaseHelper.prototype = {
	initHelper : function(callback) {
		window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB
				|| window.msIndexedDB;

		var request = window.indexedDB.open(this.name, 2);
		request.onerror = function(event) {
			console.log("Failed to create indexed db with error " + event.target.errorCode);
		};
		request.onsuccess = function(event) {
			console.log("The indexed db \"" + dbHelper.name + "\" was created succesfully");
			dbHelper.db = event.target.result;

			callback();
		};
		request.onupgradeneeded = function(event) {
			dbHelper.createObjects(event.target.result);
		};
	},

	createObjects : function(db) {
		console.log("Creating database objects");
		// keyPath is more like a primary key in sql
		var store = db.createObjectStore(VIDEOS, {
			keyPath : "id"
		});
		store.createIndex("id", "id", {
			unique : true
		});
	},

	insertVideo : function(video) {
		var transaction = this.db.transaction([ VIDEOS ], "readwrite");
		var store = transaction.objectStore(VIDEOS);
		var request = store.put(video);
		request.onsuccess = function(event) {
			console.log("Video with id" + event.target.result + " has been added");
		};
		request.onerror = function(event) {
			console.log(event.target.errorCode);
		};
	},

	insertVideos : function(videoArray) {
		var transaction = this.db.transaction([ VIDEOS ], "readwrite");
		var store = transaction.objectStore(VIDEOS);

		for ( var i in videoArray) {			
			var request = store.add(videoArray[i]);
			request.onsuccess = function(event) {
				console.log("Video with id" + event.target.result + " has been added");
			};
			request.onerror = function(event) {
				console.log(event.target.errorCode);
			};
		}
	},

	getVideoById : function(videoId, resultHandler) {
		var transaction = this.db.transaction([ VIDEOS ], "readonly");
		var store = transaction.objectStore(VIDEOS);
		var request = store.get(videoId);
		request.onsuccess = function(event) {
			resultHandler(event.target.result);
		};
		request.onerror = function(event) {
			console.log(event.target.errorCode);
		};
	},

	deleteVideoById : function(videoId) {
		var transaction = this.db.transaction([ VIDEOS ], "readwrite");
		var store = transaction.objectStore(VIDEOS);
		var request = store.delete(videoId);
		request.onsuccess = function(event) {
			console.log("Video with id " + videoId + " has been deleleted");
		};
		request.onerror = function(event) {
			console.log(event.target.errorCode);
		};
	},

	queryAllVideos : function(resultHandler) {
		var retList = []; // empty array
		var transaction = this.db.transaction([ VIDEOS ], "readonly");
		var store = transaction.objectStore(VIDEOS);

		var request = store.openCursor();
		request.onsuccess = function(e) {
			var cursor = e.target.result;
			if (cursor) {
				retList.push(cursor.value);
				cursor.continue();
			} else {
				resultHandler(retList);
			}
		};
	},

	clearVideos : function() {
		var transaction = this.db.transaction([ VIDEOS ], "readwrite");
		var store = transaction.objectStore(VIDEOS);
		var request = store.clear();
		request.onsuccess = function(event) {
			console.log("Table videos has been cleared");
		};
		request.onerror = function(event) {
			console.log(event.target.errorCode);
		};
	}
};

// Create singleton
dbHelper = new DatabaseHelper();
