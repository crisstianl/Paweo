// database properties
const DB_NAME = "paweo.db";
const DB_VERSION = 1;

// database tables
const TABLE_USERS = "T_USERS";
const TABLE_VIDEOS = "T_VIDEOS";

// constructor
function DatabaseHelper() {
	// private variables
	var dbConnection = null;

	console.log("IndexDB: connecting to database \"" + DB_NAME + "\"");
	window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
	var dbRequest = window.indexedDB.open(DB_NAME, DB_VERSION);
	dbRequest.onsuccess = function(event) {
		console.log("IndexDB: connection to database \"" + DB_NAME + "\" succeed");
		dbConnection = event.target.result;
	};
	dbRequest.onerror = function(event) {
		console.log("IndexDB: connection to database failed with errors " + event.target.errorCode);
	};
	dbRequest.onupgradeneeded = function(event) {
		createObjects(event.target.result);
	};

	// private functions
	function createObjects(dbConnection) {
		// keyPath is more like a primary key in sql
		console.log("IndexDB: creating database table \"" + TABLE_USERS + "\"");
		var user = dbConnection.createObjectStore(TABLE_USERS, { keyPath : "id" });
		user.createIndex("id", "id_idx", { unique : true });

		console.log("IndexDB: creating database table \"" + TABLE_VIDEOS + "\"");
		var videos = dbConnection.createObjectStore(TABLE_VIDEOS, { keyPath : "id" });
		videos.createIndex("id", "id_idx", { unique : true });
	}

	// public functions
	this.beginTransaction = function(table, write, callback) {
		if (dbConnection) { // connected
			let access = write ? 'readwrite' : 'readonly';
			let transaction = dbConnection.transaction([ table ], access);
			let store = transaction.objectStore(table);
			callback(store);

		} else if (dbRequest) {
			// wait for the connection to open
			dbRequest.addEventListener("success", function() { 
				dbHelper.beginTransaction(table, write, callback);
			}, false);
		}
	};
}

/* Public Methods */
DatabaseHelper.prototype = {
	deleteData : function(table) {
		this.beginTransaction(table, true, function(store) {
			var request = store.clear();
			request.onsuccess = function(event) {
				console.log("IndexDB: delete from table \""+ table + "\" succeed");
			};
			request.onerror = function(event) {
				console.log("IndexDB: delete from table \""+ table + "\" failed with errors " + event.target.errorCode);
			};
		});
	},

	insertUser : function(userObj) {
		this.beginTransaction(TABLE_USERS, true, function(store) {
			var request = store.put(userObj);
			request.onsuccess = function(event) {
				console.log("IndexDB: insert user with id \"" + event.target.result + "\" succeed");
			};
			request.onerror = function(event) {
				console.log("IndexDB: insert user failed with errors " + event.target.errorCode);
			};
		});
	},

	getUser : function(name, resultHandler) {
		this.beginTransaction(TABLE_USERS, false, function(store) {
			var request = store.get(name);
			request.onsuccess = function(event) {
				resultHandler(event.target.result);
			};
			request.onerror = function(event) {
				console.log("IndexDB: select user failed with errors " + event.target.errorCode);
			};
		});
	},

	insertVideo : function(videoObj) {
		this.beginTransaction(TABLE_VIDEOS, true, function(store) {
			var request = store.put(videoObj);
			request.onsuccess = function(event) {
				console.log("IndexDB: insert video with id \"" + event.target.result + "\" succeed");
			};
			request.onerror = function(event) {
				console.log("IndexDB: insert video failed with errors " + event.target.errorCode);
			};
		});
	},

	insertVideos : function(videoArray) {
		this.beginTransaction(TABLE_VIDEOS, true, function(store) {
			for (let i = 0; i < videoArray.length; i++) {			
				var request = store.add(videoArray[i]);
				request.onsuccess = function(event) {
					console.log("IndexDB: insert video with id \"" + event.target.result + "\" succeed");
				};
				request.onerror = function(event) {
					console.log("IndexDB: insert video failed with errors " + event.target.errorCode);
				};
			}
		});
	},

	getVideoById : function(videoId, resultHandler) {
		this.beginTransaction(TABLE_VIDEOS, false, function(store) {
			var request = store.get(videoId);
			request.onsuccess = function(event) {
				resultHandler(event.target.result);
			};
			request.onerror = function(event) {
				console.log("IndexDB: select video failed with errors " + event.target.errorCode);
			};
		});
	},

	deleteVideoById : function(videoId) {
		this.beginTransaction(TABLE_VIDEOS, true, function(store) {
			var request = store.delete(videoId);
			request.onsuccess = function(event) {
				console.log("IndexDB: delete video with id \"" + videoId + "\" succeed");
			};
			request.onerror = function(event) {
				console.log("IndexDB: delete video failed with errors " + event.target.errorCode);
			};
		});
	},

	queryAllVideos : function(resultHandler) {
		this.beginTransaction(TABLE_VIDEOS, false, function(store) {
			var retList = new Array();
			var request = store.openCursor();
			request.onsuccess = function(ev) {
				var cursor = ev.target.result;
				if (cursor) { // next ?
					retList.push(cursor.value);
					cursor.continue();
				} else {
					resultHandler(retList);
				}
			};
			request.onerror = function(ev) {
				console.log("IndexDB: select all videos failed with errors " + ev.target.errorCode);
			};
		});
	},

	clearUsers : function() {
		this.deleteData(TABLE_USERS);
	},

	clearVideos : function() {
		this.deleteData(TABLE_VIDEOS);
	}
};

// Create singleton
dbHelper = new DatabaseHelper();
