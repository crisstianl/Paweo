### Paweo 
Javascript client application for searching and watching Youtube content:
1. videos in trending in your country, listed by different topics (e.g. music, games, animation, autos);
2. videos most watched from a specified topic;
3. videos containing a specific keyword in the title, channel or description;
The application offers the posibility to watch videos directly in the page through the Popcorn.js plugin, otherwise videos can be
queued in a playlist to be watched later sequentially.
Playlist videos are queued by their entry time, but you can re-arrange them by views, likes, upload.
The playlist can be accessed across multiple tabs and is available until you close the browser, but if you want to rewatch it another time
then you can export it to your local file system and reimport it next time.

### Instalation:
- copy the source files to your preferred Http server (Apache Http, Nginx, Caddy, Cherokee, etc).
- go to http://localhost:80/Paweo.

### Usage: 
The application is free to use and does not require an account or registration. 
Open the application and select the "Youtube" platform on the top right menu, then you will be redirected to a page containing
videos in trending on Youtube in your country.
Click on the video to watch it, on the heart icon to add it to the playlist, or on the "More" button to load more videos.
If you want more videos from a topic (e.g. cars, music, travel) then click on the topic name from the trending, or left menu.
If you are interested in particular content, then input your preferences in the search bar above the player window.
In the playlist click on a video to start watching, then the application will loop through the remaining videos automatically.
Click on the playlist title "My Playlist" to rename it.
Click on the new button the drop your playlist and start fresh.
Click on the load button to import a previously created playlist from your computer.
Click on the save button to export the playlist to your computer.
Click on the sort button to re-arrange the videos in the list by views, likes, title, upload.
Click on the search field to filter videos by title or description.

### External APIs
Youtube API v3, restful endpoints to Youtube resources for registered applications only, but free for non-commercial use.
IndexedDB API, client-side storage services based on JavaScript object-oriented database.
ip-api.com, geolocation services based on the user IP address, free for non-commercial use.

### Libraries:
- youtube-3.js
- popcorn-complete-1.3.min.js
- jquery-1.10.2.js
- bootstrap-3.0.js
- globalize-0.1.3.js
