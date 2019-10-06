### Paweo 
is a javascript client for Youtube services that include loading the new and most watched videos in the region from the platform, video search by artist, title, description and other, and playlist management.     
Videos are displayed with the Popcorn javascript library which offers extensive support for non-media formats like Youtube, Vimeo, SoundCloud.    
Playlists are persisted on the client machine inside a high performance, asynchronous, object oriented database provided by your browser IndexDB.

### Instalation:
- copy the source files to your preferred Http server (Apache Http, Nginx, Caddy, Cherokee, etc).
- go to http://localhost:80/Paweo.

### Usage:  
On the index page click the category you want to visit, afterwhich the application will load the selected videos from the plaform.  
Now you can click on the video thumbnail to watch it, or on the bookmark to playlist it.  
If the videos supplied by the plaform are not of interest, then go to the search bar in the top and type your preferences in any language and format.
On the right side you have the playlist controls and selections, you can there click to watch them now, enqueue for later, or eliminate them from the list.

### Libraries:
- youtube.js
- popcorn-complete.min.js
- jquery-1.10.2.js
- bootstrap.js
- globalize.js
- indexdb
