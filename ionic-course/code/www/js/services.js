angular.module('songhop.services', ['ionic.utils'])

.factory('User', function($http, $q, $localstorage, SERVER) {

	var o = {
		username: false, 
		session_id: false,
		favorites: [], 
		newFavorites: 0
	}

	o.auth = function(username, signingUp) {
		var authRoute; 

		if(signingUp) {
			authRoute = 'signup'; 
		} else {
			authRoute = 'login'
		}

		return $http.post(SERVER.url + '/' + authRoute, {username: username})
			.success(function(data){
				o.setSession(data.username, data.session_id, data.favorites);
			});
	}

	o.setSession = function(username, session_id, favorites) {
		if (username) o.username = username; 
		if (session_id) o.session_id = session_id; 
		if (favorites) o.favorites = favorites;

		//set data in localstorage object
		$localstorage.setObject('user', { username: username, session_id: session_id });
	}

	// check if there's a user session present
	o.checkSession = function() {
		var defer = $q.defer(); 

		if (o.session_id) {
			// if this session is already initialized in the service
			defer.resolve(true);
		} else {
			// detect if there's a session in localstorage from previous use.
      		// if it is, pull into our service
			var user = $localstorage.getObject('user');

			if (user.username) {
				// if there's a user, lets grab their favorites from the server
				o.setSession(user.username, user.session_id); 
				o.populateFavorites().then(function() {
					defer.resolve(true);
				});
			} else {
				// no user info in localstorage, reject
				defer.resolve(false);
			}
		}

		return defer.promise;
	}

	o.destroySession = function() {
		$localstorage.setObject('user', {}); 
		o.username = false; 
		o.session_id = false; 
		o.favorites = []; 
		o.newFavorites = 0;
	}

	o.favoritesCount = function() {
		return o.newFavorites;
	}

	o.populateFavorites = function() {
		return $http({
			method: 'GET', 
			url: SERVER.url + '/favorites', 
			params: {session_id: o.session_id }
		}).success(function(data) {
			//merge data into the queue
			o.favorites = data;
		});
	}

	o.addSongToFavorites = function(song) {
		//make sure there's a song to add
		if (!song) return false;

		//add to favorites array
		o.favorites.unshift(song);
		o.newFavorites++;

		//persist this to the server
		return $http.post(SERVER.url + '/favorites', {session_id: o.session_id, song_id: song.song_id});
	}

	o.removeSongFromFavorites = function(song, index) {
		//make sure there's a song to delete
		if(!song) return false;

		//remove from favorites array
		o.favorites.splice(index, 1);

		//persist this to the server
		return $http({
			method: 'DELETE', 
			url: SERVER.url + '/favorites', 
			params: {session_id: o.session_id, song_id: song.song_id }
		});
	}

	return o;
})

.factory('Recommendations', function($http, SERVER, $q) {
	var media;

	var o = {
		queue: []
	}; 

	o.init = function(){
		if (o.queue.length === 0) {
			//if theres nothing in the queue, fill it
			//this also means that this is the first call of init
			return o.getNextSongs();
		} else {
			//otherwise play the current song
			return o.playCurrentSong();
		}
	}

	o.getNextSongs = function() {
		return $http({
			method: 'GET', 
			url: SERVER.url + '/recommendations'
		}).success(function(data) {
			o.queue = o.queue.concat(data);
		});
	}

	o.nextSong = function() {
		//pop the index 0 off
		o.queue.shift();

		//end song
		o.haltAudio();

		//low on the queue? lets fill it up
		if (o.queue.length <= 3) {
			o.getNextSongs();
		}
	}

	o.playCurrentSong = function() {
		var defer = $q.defer();

		//play the current song's preview
		media = new Audio(o.queue[0].preview_url);

		//when song is loaded, resolve the promise to let controller know. 
		media.addEventListener("loadeddata", function() {
			defer.resolve();
		});

		media.play(); 
		//console.log('Playing Media');
		return defer.promise;
	}

	//used when switching to favorites tab
	o.haltAudio = function() {
		if (media) media.pause(); 
		//if (media) console.log('Pausing media'); 
	}

	return o;
})