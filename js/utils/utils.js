function getParameter(name) {
	var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
	return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

// Asynchronous function
function clientGeolocation(responseHandler) {
	jQuery.getJSON('http://freegeoip.net/json/', function(location) {
		var obj = {
			city : location.city,
			regionCode : location.region_code,
			regionName : location.region_name,
			areaCode : location.areacode,
			ip : location.ip,
			zipCode : location.zipcode,
			longitude : location.longitude,
			latitude : location.latitude,
			contryName : location.country_name,
			countryCode : location.country_code
		};
		responseHandler(obj);
	});
}

String.prototype.format = function() {
	var formatted = this;
	for ( var arg in arguments) {
		formatted = formatted.replace("{" + arg + "}", arguments[arg]);
	}
	return formatted;
};

function getFileExtension(filename) {
	var a = filename.split(".");
	if (a.length === 1 || (a[0] === "" && a.length === 2)) {
		return "";
	}
	return a.pop();
}

function createHttpRequest() {
	var xmlhttp;
	if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp = new XMLHttpRequest();
	} else {// code for IE6, IE5
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	return xmlhttp;
}

function isEmptyOrBlank(text) {
	if (text === null || typeof text === 'undefined' || text == "") {
		return true;
	}
	return false;
}

String.prototype.contains = function(segment) {
	return this.match(segment) !== null;
};
