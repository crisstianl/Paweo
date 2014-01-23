//Use this type of login to access public data ,like get videos ,channels ,but here you
//cannot upload ,rate ,or comment videos.In order to do this actions use qauth2.js type

// Key for browser applications ,you can make this more server specific ,or this
// key can be used from every server
var API_KEY = 'AIzaSyBa_bxFDHU2WcWjh0P6VuePxbf-Oaedth8';

// Initialize google api client with a public key
window.googleApiClientReady = function() {
	gapi.client.setApiKey(API_KEY);
	loadYoutubeAPI();
};

function loadYoutubeAPI(){
	gapi.client.load('youtube', 'v3' ,function(){		
		console.log("auth.js::client login done");
		onYoutubeApiLoaded();
	});	
}