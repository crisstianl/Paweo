// Acceptable values are 1 to 50, default value is 5.
const DEFAULT_MAX_RESULTS = 30;

/* 
* The regionCode parameter specifies the country for which categories are being retrieved.
* Returns a list of categories that can be associated with YouTube videos. 
*/
function getVideoCategories(regionId, responseHandler) {
	console.log("YoutubeAPI: searching videos categories in region " + regionId);
	let params = {
		part : 'snippet',
		regionCode : regionId,
		maxResults : DEFAULT_MAX_RESULTS
	};

	const request = gapi.client.youtube.videoCategories.list(params);
	request.execute(function(response) {
		if ('error' in response) {
			handleErrors(response);
		} else if (response.result.items && response.result.items.length > 0) {
			responseHandler(response.result.items);
		}
	});
}

/* 
* Get video by id.
* Returns video details such as name, channel, thumbnail, views, likes, dislikes. 
*/
function getVideoDetails(videoId, responseHandler) {
	console.log("YoutubeAPI: fetching video \"" + videoId + "\" details");
	let params = {
		part : 'snippet, statistics',
		id : videoId,
		maxResults : 1
	};

	const request = gapi.client.youtube.videos.list(params);
	request.execute(function(response) {
		if ('error' in response) {
			handleErrors(response);
		} else if (response.result.pageInfo.totalResults > 0) {
			responseHandler(response.result.items[0]);
		}
	});
}

/* 
* Get multiple videos at once by specifing a list of IDs.
* Returns video details such as name, channel, thumbnail, views, likes, dislikes. 
*/
function getVideosDetails(videoIds, responseHandler) {
	let str = "";
	for (let i = 0; i < videoIds.length; i++) {
		str += videoIds[i] + ",";
	}
	
	console.log("YoutubeAPI: fetching video list \"" + str + "\" details");
	let params = {
		part : 'snippet, statistics',
		id : str,
		maxResults : videoIds.length
	};

	const request = gapi.client.youtube.videos.list(params);
	request.execute(function(response) {
		if ('error' in response) {			
			handleErrors(response);
		} else if (response.result.pageInfo.totalResults > 0) {
			responseHandler(response.result.items);
		}
	});
}

/* 
* Get multiple videos at once the belong to a specified category and region.
* Returns video details such as name, channel, thumbnail, views, likes, dislikes. 
*/
function getVideosDetailsByCategory(categoryId, regionId, maxResults, responseHandler) {
	console.log("YoutubeAPI: fetching videos details from category \"" + categoryId + "\"");
	let params = {
		part : 'snippet, statistics',
		chart : 'mostPopular',
		videoCategoryId : categoryId, 
		regionCode : regionId,
		maxResults : maxResults
	};

	const request = gapi.client.youtube.videos.list(params);
	request.execute(function(response) {
		if ('error' in response) {
			handleErrors(response);
		} else if (response.result.pageInfo.totalResults > 0) {
			responseHandler(categoryId, response.result.items);
		}
	});
}

/* 
* Search most popular videos in a specified category and region.
* Return a page of the resultset containing a list of video IDs. 
* Subsequent pages can be retrieved usint 'nextPageToken' response.
* Previous pages can be retrieved usint 'prevPageToken' response.
*/
function searchVideosByCategory(categoryId, regionId, pageId, maxResults, responseHandler) {
	console.log("YoutubeAPI: searching videos in category \"" + categoryId + "\" from region " + regionId);
	let params = {
		part : 'id',
		videoCategoryId : categoryId,
		regionCode : regionId,
		pageToken : pageId,
		type : 'video',
		order : 'relevance', // title, date, rating, viewCount, videoCount
		maxResults : maxResults
	};

	const request = gapi.client.youtube.search.list(params);
	request.execute(function(response) {
		if ('error' in response) {
			handleErrors(response);
		} else if (response.result.pageInfo.totalResults > 0) {
			responseHandler(response.result.items, response.result.nextPageToken);
		}
	});
}

/* 
* Search most popular videos in a specified category and region.
* Return a page of the resultset containing a list of video IDs. 
* Subsequent pages can be retrieved usint 'nextPageToken' response.
* Previous pages can be retrieved usint 'prevPageToken' response.
*/
function searchVideosByKeyword(query, regionId, pageId, maxResults, responseHandler) {
	console.log("YoutubeAPI: searching videos by keyword \"" + query + "\" in region " + regionId);
	let params = {
		part: 'id',
		q : query,
		regionCode : regionId,
		pageToken : pageId,
		type : 'video',
		order : 'relevance', // title, date, rating, viewCount, videoCount
		maxResults : maxResults
	};

	const request = gapi.client.youtube.search.list(params);
	request.execute(function(response) {
		if ('error' in response) {
			handleErrors(response);
		} else if (response.result.pageInfo.totalResults > 0) {
			responseHandler(response.result.items, response.result.nextPageToken);
		}
	});
}

/* Print error responses in console */
function handleErrors(response) {
	if ('error' in response) {
		console.log("ERROR: " + response.error.code);
		console.log("ERROR: " + response.error.message);
		if (response.errors && response.errors.length > 0) {
			for (let i = 0; i < response.errors.length; i++) {
				console.log("ERROR: " + response.errors[i].reason);
				console.log("ERROR: " + response.errors[i].message);
			}
		}
	}
}