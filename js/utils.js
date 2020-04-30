function getParameter(name) {
	var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
	return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

/* Get user geolocation using his IP */
function geolocation(responseHandler) {
	let xhttp = createHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4) {
			console.log("ip-api.com " + this.status);
			if (200 === this.status) {
				responseHandler(JSON.parse(this.response));
			} else {
				console.log("ERROR: " + this.responseText);
			}
		}
	};
	xhttp.open("GET", "http://ip-api.com/json/", true);
	xhttp.send();
}

String.prototype.format = function() {
	var formatted = this;
	for ( var arg in arguments) {
		formatted = formatted.replace("{" + arg + "}", arguments[arg]);
	}
	return formatted;
};

String.prototype.contains = function(segment) {
	return this.match(segment) !== null;
};

String.prototype.compare = function(arg) {
	if (this.localeCompare) {
		return this.localeCompare(arg);
	} else if (this < arg) {
		return -1;
	} else if (this > arg) {
		return 1;
	} else {
		return 0;
	}
};

Date.prototype.compare = function(arg) {
	return this < arg ? -1 : this > arg ? 1 : 0;
};

function getFileExtension(filename) {
	var a = filename.split(".");
	if (a.length === 1 || (a[0] === "" && a.length === 2)) {
		return "";
	}
	return a.pop();
}

function createHttpRequest() {
	if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
		return new XMLHttpRequest();
	} else { // code for IE6, IE5
		return new ActiveXObject("Microsoft.XMLHTTP");
	}
}

function isEmptyOrBlank(text) {
	return (text === null || typeof text === 'undefined' || text == "");
}
