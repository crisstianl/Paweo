var VIDEOS = "videos";

DatabaseHelper = function() {
	this.name = "paweo";
	this.version = '2';
	this.db = null;
};

DatabaseHelper.prototype = {
	initHelper : function() {
		var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB
				|| window.msIndexedDB;

		var request = indexedDB.open(this.name);
		request.onerror = function(event) {
			console.log("Failed to create indexed db with error " + event.target.errorCode);
		};
		request.onsuccess = function(event) {
			console.log("The indexed db \"" + dbHelper.name + "\" was created succesfully");
			dbHelper.db = event.target.result;

			// We can only create objects store in a setVersion transaction
			if (dbHelper.version != dbHelper.db.version) {
				if (dbHelper.db.setVersion) {
					var versionRequest = dbHelper.db.setVersion(dbHelper.version);
					// onsuccess is the only place where the objects can be
					// created
					versionRequest.onsuccess = function(event) {
						console.log("Successfuly changed version to " + dbHelper.version);
						dbHelper.createObjects();
					};
				} else {
					dbHelper.db.version = dbHelper.version;
					dbHelper.db.onversionchange = function(event) {
						console.log("Successfuly changed version to " + dbHelper.version);
						dbHelper.createObjects();
					};
				}
			}
		};
	},

	createObjects : function() {
		console.log("xxxxx");
		// keyPath is more like a primary key in sql
		this.db.createObjectStore(VIDEOS, {
			keyPath : "id"
		});
	},

	insertVideo : function(video) {
		var transaction = this.db.transaction([ VIDEOS ], IDBTransaction.READ_WRITE);
		var store = transaction.objectStore(VIDEOS);
		var request = store.put(video);
		request.onsuccess = function(event) {
			console.log("Video with id" + event.target.result + " has been added");
		};
		request.onerror = function(event) {
			console.log(event.target.errorCode);
		};
	},

	queryAllVideos : function() {
		var retList = []; // empty array
		var transaction = this.db.transaction([ VIDEOS ], IDBTransaction.READ_WRITE);
		var store = transaction.objectStore(VIDEOS);

		var request = store.openCursor();
		request.onsuccess = function(e) {
			var cursor = e.target.result;
			if (cursor) {
				retList.push(cursor.value);
				// cursor.continue();
			}			
		};

		return retList;
	}
};

// Create singleton
dbHelper = new DatabaseHelper();
