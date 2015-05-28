angular.module('songhop.controllers', ['ionic', 'songhop.services'])



/*
Controller for shared fucntionality and menu
*/
.controller('AppCtrl', function($scope, $window, User) {

	$scope.logout = function() {
		User.destroySession(); 

		//instead of using $state.go we're going to redirect
		//reason: we need to ensure views aren't cached. 
		$window.location.href = 'index.html';
	}

})

/*
Controller for the discover page
*/
.controller('DiscoverCtrl', function($scope, $ionicLoading, $timeout, User, Recommendations) {
	//helper functions for loading
	var showLoading = function() {
		$ionicLoading.show({
			template: '<i class="ion-loading-c"></i>',
			noBackdrop: true
		});
	}

	var hideLoading = function() {
		$ionicLoading.hide();
	}

	//set loading to true first time while we retrieve songs from server. 
	showLoading();

	//get our first songs
	Recommendations.init()
		.then(function() {

			$scope.currentSong = Recommendations.queue[0];
			
			return Recommendations.playCurrentSong();
		})
		.then(function() {
			//turn loading off
			hideLoading();
			$scope.currentSong.loaded = true;
		});

	 $scope.sendFeedback = function(bool) {
	 	//first, add to favorites IF they favorited
	 	if (bool) User.addSongToFavorites($scope.currentSong);

	 	//set variable for the correct animation response
	 	$scope.currentSong.rated = bool;
	 	$scope.currentSong.hide = true;

	 	Recommendations.nextSong();

	 	$timeout(function() {
	 		$scope.currentSong = Recommendations.queue[0];
	 		$scope.currentSong.loaded = false;
	 	}, 250); 

	 	Recommendations.playCurrentSong().then(function() {
	 		$scope.currentSong.loaded = true;
	 	});
	}

	$scope.nextAlbumImg = function() {
		if (Recommendations.queue.length > 1) {
			return Recommendations.queue[1].image_large;
		}

		return '';
	}
})


/*
Controller for the favorites page
*/
.controller('FavoritesCtrl', function($scope, $window, User) {

	 //get the list of favorites from the user service
	 $scope.username = User.username;
	 $scope.favorites = User.favorites;

	 $scope.openSong = function(song) {
	 	$window.open(song.open_url, "_system");
	 }

	 $scope.removeSong = function(song, index) {
	 	User.removeSongFromFavorites(song, index);
	 }
})


/*
Controller for our tab bar
*/
.controller('TabsCtrl', function($scope, $window, $ionicSideMenuDelegate, Recommendations, User) {
	//expose the number of new favorites to the scope
	$scope.favCount = User.favoriteCount;

	//stop audio when going to favorites page
	$scope.enteringFavorites = function() {
		//set new favorites to 0
		User.newFavorites = 0;
		Recommendations.haltAudio();
	}

	//start audio when returning to discovery
	$scope.leavingFavorites = function() {
		Recommendations.init();
	}

	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	}
})

/*
Controller for our splash screen
*/
.controller('SplashCtrl', function($scope, $state, $window, User) {

	//attempt to signup/login via User.auth
	$scope.submitForm = function(username, signingUp) {
		User.auth(username, signingUp).then(function() {
			//session is now set, so lets redirect to discover page
			$state.go('app.tab.discover');
		}, function() {
			//error handling here
			alert('Hmm... try another username.');
		});
	}

});