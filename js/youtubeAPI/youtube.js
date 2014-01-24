var DEFAULT_RESULTS_NUMBER = 5;
var DEFAULT_REGION = 'RO';

function getMostPopularVideos(categoryId, rowNr, responseHandler) {
	console.log("request popular from category=" + categoryId);
	searchVideosByCategory(categoryId, 'viewCount', rowNr, responseHandler);
}

function getMostRecentVideos(categoryId, rowNr, responseHandler) {
	console.log("request latest from category=" + categoryId);
	searchVideosByCategory(categoryId, 'date', rowNr, responseHandler);
}

function searchVideosByCategory(categoryId, order, rowNr, responseHandler) {
	var request = gapi.client.youtube.search.list({
		part : 'snippet',
		order : order,
		regionCode : DEFAULT_REGION,
		type : 'video',
		videoCategoryId : categoryId,
		maxResults : DEFAULT_RESULTS_NUMBER
	});

	request.execute(function(response) {
		if ('error' in response) {
			console.log(response.error.message);
		} else if (response.result.pageInfo.totalResults > 0) {
			responseHandler(response.result, rowNr);
		}
	});
}

// Search for a specified string.
function searchVideo(query, part, responseHandler) {
	var request = gapi.client.youtube.search.list({
		q : query,
		part : part,
		maxResults : DEFAULT_RESULTS_NUMBER * 10
	});

	request.execute(function(response) {
		if ('error' in response) {
			console.log(response.error.message);
		} else if (response.result.pageInfo.totalResults > 0) {
			responseHandler(response.result.items);
		}
	});
}

function getVideoGuideCategories(regionCode, responseHandler) {
	var request = gapi.client.youtube.guideCategories.list({
		part : 'snippet',
		regionCode : (typeof regionCode !== 'undefined' && regionCode !== null) ? regionCode
				: DEFAULT_REGION
	});

	request.execute(function(response) {
		if ('error' in response) {
			console.log(response.error.message);
		} else {
			responseHandler(response.result);
		}
	});
}

function getVideoCategories(regionCode, responseHandler) {
	var request = gapi.client.youtube.videoCategories.list({
		part : 'snippet',
		regionCode : (typeof regionCode !== 'undefined' && regionCode !== null) ? regionCode
				: DEFAULT_REGION
	});

	request.execute(function(response) {
		if ('error' in response) {
			console.log(response.error.message);
		} else {
			responseHandler(response.result);
		}
	});
}

function getVideoById(videoId, responseHandler) {
	var request = gapi.client.youtube.videos.list({
		part : 'snippet, statistics',
		id : videoId,
		maxResults : 1
	});

	request.execute(function(response) {
		if ('error' in response) {
			console.log(response.error.message);
		} else if (response.result.pageInfo.totalResults > 0) {
			responseHandler(response.result.items[0]);
		}
	});
}

function getVideosById(videoIds, responseHandler) {
	var str = "";
	for (var i = 0; i < videoIds.length; i++) {
		str += videoIds[i] + ", ";
	}
	
	var request = gapi.client.youtube.videos.list({
		part : 'snippet, statistics',
		id : str,
		maxResults : Math.min(DEFAULT_RESULTS_NUMBER, videoIds.length)
	});

	request.execute(function(response) {
		if ('error' in response) {			
			console.log(response.error.message);
		} else if (response.result.pageInfo.totalResults > 0) {
			responseHandler(response.result.items);
		}
	});
}