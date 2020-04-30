// EU, US, UK, DE, RO
var userRegion = 'RO';

// onload
document.addEventListener("DOMContentLoaded", function() {
	getUserLocation();
	addRegion();
}, false);

function getUserLocation() {
	geolocation(function(response) {
		response.id = "1";
		userRegion = response.countryCode;
		dbHelper.insertUser(response);
	});
}

function addRegion() {
	let nav = document.getElementById('navMenu');
	for (let i = 0; i < nav.children.length; i++) {
		let link = nav.children[i].children[0];
		link.href += "?region=" + userRegion;
	}
}