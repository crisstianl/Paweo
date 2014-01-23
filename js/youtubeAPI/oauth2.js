//Use this login type to manage private data ,like uploading videos ,playlists and so on.
//This is identical with the sign in action from the youtube site

var OAUTH2_CLIENT_ID = '504929960515-ae2v0fqkafhaf3j5l16884suhra7cs2h.apps.googleusercontent.com';
var OAUTH2_SCOPES = [ 'https://www.googleapis.com/auth/youtube' ];

// Upon loading, the Google APIs JS client automatically invokes this callback.
window.googleApiClientReady = function() {
	gapi.auth.init(function() {
		window.setTimeout(checkAuth(true), 1);
	});
};

function checkAuth(immediate) {
	gapi.auth.authorize({
		client_id : OAUTH2_CLIENT_ID,
		scope : OAUTH2_SCOPES,
		imediate : immediate
	}, handleAuthResult);
};

function handleAuthResult(authResult) {
	if (authResult) {
		loadYoutubeAPI();
	} else {
		window.setTimeout(checkAuth(false), 1);
	}
}

function loadYoutubeAPI() {
	gapi.client.load('youtube', 'v3', function() {
		getUserVideos();
	});
}

//Test function ,load most popular videos
function getUserVideos() {
	var request = gapi.client.youtube.videos.list({
		part : 'id, snippet',
		chart : 'mostPopular'
	});

	request.execute(function(response) {
		if ('error' in response) {
			displayMessage(response.error.message);
		} else {
			var ids = null;
			for (var i = 0; i < response.items.length; i++) {
				ids += response.items[i].id;
				ids += "\n";
			}
			alert(ids);
		}
	});
}
