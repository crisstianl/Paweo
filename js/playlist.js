// List sort types
var NO_ORDER = -1;
var TITLE_ORDER = 0;
var DATE_ORDER = 1;
var VIEWS_ORDER = 2;
var LIKES_ORDER = 3;

// List filter types
var TITLE_FILTER = 0;
var DESCRIPTION_FILTER = 1;
var DATE_FILTER = 2;

var MAX_ITEMS_IN_PLAYLIST = 50;

// Keep all items from playlist
var playlistItems = new Array();
var currentPlaying = -1;

var sortOrder = NO_ORDER;
var sortAsceding = false;

var filterType = TITLE_FILTER;
var playlistName = "My Playlist";
var filterText = "";


function initPlaylist() {
	// load playlist items
	loadStoredVideos();
}

function bookmarkVideo(videoId) {
	// Check for a duplicate in list
	if (!checkInList(videoId)) {
		getVideoDetails(videoId, function(result) {
			// update our list of videos
			playlistItems.push(result);
			// update local database
			dbHelper.insertVideo(result);
			// refresh ui data
			refreshData();
		});
	}
}

function bookmarkVideos(videoIds) {
	// Remove duplicate videos
	var pendingVideos = checkPlaylistItems(videoIds);
	if (pendingVideos.length > 0) {
		getVideosDetails(pendingVideos, function(results) {
			//update list
			for (var i = 0; i < results.length; i++) {
				playlistItems.push(results[i]);
			}
			//update db
			dbHelper.insertVideos(results);
			//refresh ui elements
			refreshData();
		});
	}
}

function loadStoredVideos() {
	dbHelper.queryAllVideos(function(results) {
		for (var i = 0; i < results.length; i++) {
			playlistItems.push(results[i]);
		}
		// update ui table
		refreshData();
	});
}

function populatePlaylistTable() {
	var playlist = document.getElementById('video-playlist');

	for (var i = 0; i < playlistItems.length; i++) {
		const video = playlistItems[i];
		if (!checkFilter(video)) { // filter video
			continue;
		}

		var row = playlist.insertRow(playlist.rows.length);
		row.onclick = function (ev) {
			onPlaylistItemClick(ev, video.id);
		};
		var cell1 = row.insertCell(0);
		var cell2 = row.insertCell(1);

		// Cell 1 content - video thumbnail
		let thumbnail = document.createElement('IMG');
		thumbnail.className = 'videoThumbnail';
		thumbnail.src = video.snippet.thumbnails.medium.url;
		cell1.appendChild(thumbnail);

		// Cell 2 content - video title, views, count and so on
		let infoContainer = document.createElement('DIV');
		infoContainer.className = 'infoContainer';
		cell2.appendChild(infoContainer);

		let title = document.createElement('P');
		title.className = 'videoTitle';
		title.innerHTML = video.snippet.title;
		infoContainer.appendChild(title);

		let infoVideo = document.createElement('P');
		infoVideo.className = 'videoInfo';
		infoContainer.appendChild(infoVideo);

		let channelEl = document.createTextNode(video.snippet.channelTitle);
		infoVideo.appendChild(channelEl);
		infoVideo.appendChild(document.createElement('BR'));

		let viewsEl = document.createTextNode(Globalize.format(parseInt(video.statistics.viewCount), 'n0') + " views");
		infoVideo.appendChild(viewsEl);
		infoVideo.appendChild(document.createElement('BR'));

		let removeBtn = document.createElement('SPAN');
		removeBtn.className = 'removeBtn';
		removeBtn.onclick = function (ev) {
			removePlaylistRow(ev, video.id);
		};
		let removeIcon = document.createElement('SPAN');
		removeIcon.className = 'glyphicon glyphicon-trash';
		removeBtn.appendChild(removeIcon);
		infoContainer.appendChild(removeBtn);
	}
}

function clearPlaylist() {
	// Clear array
	playlistItems.length = 0;
	// Clear database
	dbHelper.clearVideos();
	// Clear table
	$('#video-playlist').empty();
}

function removePlaylistRow(ev, videoId) {
	console.log("Removing video " + videoId + " from playlist");
	ev.stopPropagation();

	// remove it from list
	for (var i = 0; i < playlistItems.length; i++) {
		if (playlistItems[i].id === videoId) {
			playlistItems.splice(i, 1);
			break;
		}
	}

	// removed also from db
	dbHelper.deleteVideoById(videoId);

	refreshData();
}

function refreshData() {
	// Clear table
	$('#video-playlist').empty();
	// Reorder list
	if (sortOrder != NO_ORDER) {
		playlistItems.sort(compare);
	}
	// create ui table
	populatePlaylistTable();
}

function compare(v1, v2) {
	var retValue = 0;
	switch (sortOrder) {
	case TITLE_ORDER:
		var s1 = v1.snippet.title;
		var s2 = v2.snippet.title
		retValue = s1.compare(s2);
		break;
	case DATE_ORDER:
		var d1 = new Date(v1.snippet.publishedAt);
		var d2 = new Date(v2.snippet.publishedAt);
		retValue = d1.compare(d2);
		break;
	case VIEWS_ORDER:
		var n1 = parseInt(v1.statistics.viewCount);
		var n2 = parseInt(v2.statistics.viewCount);
		retValue = n1 < n2 ? -1 : n1 > n2 ? 1 : 0;
		break;
	case LIKES_ORDER:
		var n1 = parseInt(v1.statistics.likeCount);
		var n2 = parseInt(v2.statistics.likeCount);
		retValue = n1 < n2 ? -1 : n1 > n2 ? 1 : 0;
		break;
	}

	if (sortAsceding) {
		return retValue;
	} else {
		return retValue * -1; // For descending order just inverse the sign;
	}
};

function checkInList(videoId) {
	for (var i = 0; i < playlistItems.length; i++) {
		if (playlistItems[i].id === videoId) {
			return true;
		}
	}
	return false;
}

function checkPlaylistItems(videoIds) {
	var retList = new Array();
	for (var i = 0; i < videoIds.length; i++) {
		if (!checkInList(videoIds[i])) {
			retList.push(videoIds[i]);
		}
	}

	return retList;
}

function checkFilter(row) {
	if (filterText.length <= 2) {
		return true;
	}

	switch (filterType) {
	case TITLE_FILTER:
		if (row.snippet.title.contains(filterText)) {
			return true;
		}
		break;
	case DESCRIPTION_FILTER:
		if (row.snippet.description.contains(filterText)) {
			return true;
		}
		break;
	case DATE_FILTER:
		if (row.snippet.publishedAt.contains(filterText)) {
			return true;
		}
		break;
	}

	return false;
}

function onPlaylistItemClick(ev, videoId) {
	console.log("Opening video " + videoId);
	if (ev) {
		ev.stopPropagation();
	}

	// get video index from the playlist
	for (let i = 0; i < playlistItems.length; i++) {
		if (videoId === playlistItems[i].id) {
			currentPlaying = i;
			break;
		}
	}
	
	// highlight the current playing row
	const playlist = document.getElementById('video-playlist');
	for (let i = 0; i < playlist.rows.length; i++) {
		if (i === currentPlaying) {
			playlist.rows[i].classList.add("active");
		} else {
			playlist.rows[i].classList.remove('active');
		}
	}

	playYoutubeVideo(videoId, playNextVideo);
}

function playYoutubeVideo(videoId, onVideoFinished) {
	document.getElementById('videoPlayer').innerHTML = "";
	// Create a popcorn instance by calling the Youtube player plugin
	var player = Popcorn.youtube('#videoPlayer', "http://www.youtube.com/watch?v=" + videoId);
	
	// play the video right away
	player.play();

	player.on("ended", onVideoFinished);
}

function playNextVideo() {
	currentPlaying++;
	if (currentPlaying < 0 || currentPlaying >= playlistItems.length) {
		currentPlaying = 0;
	}
	onPlaylistItemClick(null, playlistItems[currentPlaying].id);
}

function onNewBtnClick(ev) {
	console.log("Playlist action create new");
	ev.stopPropagation();
	if (playlistItems.length > 0) {
		// ask to save playlist before destruction
		if (window.confirm("Save current list")) {
			onSaveBtnClick();
		}
		clearPlaylist();
	}
}

function onLoadBtnClick(ev) {
	console.log("Playlist action load from file");
	ev.stopPropagation();
	var input = document.createElement('input');
	input.type = 'file';
	input.accept = '.JSON';
	input.addEventListener("change", handleFileLoad, false);
	input.click();
}

function handleFileLoad() {
	if (!this.files || this.files.length === 0) {
		window.alert("No file selected");
	} else if (getFileExtension(this.files[0].name) !== "json") {
		window.alert("Invalid file extension, only JSON accepted");
	} else {
		var reader = new FileReader();
		reader.onload = function(ev) {
			var videoList = JSON.parse(ev.target.result);
			var videoIds = new Array();
			for (var i = 0; i < videoList.length; i++) {
				videoIds.push(videoList[i].videoId);
			}

			bookmarkVideos(videoIds);
		};
		reader.readAsText(this.files[0]);
	}
}

function onSaveBtnClick(ev) {
	console.log("Playlist action save to file");
	ev.stopPropagation();

	const list = new Array();
	for (var i = 0; i < playlistItems.length; i++) {
		list.push({
			videoId : playlistItems[i].id,
			videoTitle : playlistItems[i].snippet.title
		});
	}

	let filename = playlistName + ".json";
	let file = new Blob([JSON.stringify(list)], {type: "application/json"});

    if (window.navigator.msSaveOrOpenBlob) { // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
	} else { // Others
		let url = URL.createObjectURL(file);
		let link = document.createElement('A');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        setTimeout(function() {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

function onSortOrderChanged(newSortOrder) {
	if (sortOrder === newSortOrder) { // same field
		sortAsceding = true; // change direction
	} else {
		sortOrder = newSortOrder;
		sortAsceding = false;
	}
	setDropdownSortTypes();
	refreshData();
}

function onPlaylistSearchTextChanged(ev, htmlInput) {
	ev.preventDefault();
    if (ev.keyCode === 13) { // enter
		var text = htmlInput.value;
		if (text && text.length > 1) {
			console.log("Playlist search items by \"" + text + "\"");
			filterText = text;
			refreshData();
		}
	}
}

function onSearchPlaylistClick(ev, htmlButton) {
	ev.stopPropagation();

	// Loop through posible filters
	filterType++;
	switch (filterType) {
	case DESCRIPTION_FILTER:
		htmlButton.innerHTML = " Description";
		break;
	case DATE_FILTER:
		htmlButton.innerHTML = " Date";
		break;
	default:
		filterType = TITLE_FILTER;
		htmlButton.innerHTML = " Title";
	}

	var text = document.getElementById('playlistSearch-text').value;
	if (text && text.length > 1) {
		console.log("Playlist search items by \"" + text + "\"");
		filterText = text;
		refreshData();
	}
}

function changePlaylistName(ev) {
	ev.stopPropagation();
	var input = window.prompt("Enter playlist name", playlistName);
	if (!isEmptyOrBlank(input)) {
		playlistName = input;
		$('#playlist_title').text(playlistName);
	}
}

function setDropdownSortTypes() {
	var field = null;
	switch (sortOrder) {
	case TITLE_ORDER:
		field = "Title";
		break;
	case DATE_ORDER:
		field = "Date";
		break;
	case VIEWS_ORDER:
		field = "Views";
		break;
	case LIKES_ORDER:
		field = "Likes";
		break;
	}

	$('.dropdown-toggle').text(field);
	$('.dropdown-toggle').append(" <span class='caret'></span>");
	console.log("Playlist sorting videos by " + field + (sortAsceding ? " ascending" : " descending"));
}