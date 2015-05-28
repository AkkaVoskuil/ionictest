// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('songhop', ['ionic', 'songhop.controllers', 'ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
    

  });
})


.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router, which uses the concept of states.
  // Learn more here: https://github.com/angular-ui/ui-router.
  // Set up the various states in which the app can be.
  // Each state's controller can be found in controllers.js.
  $stateProvider

  .state('app', {
    url: "/app", 
    abstract: true, 
    templateUrl: "templates/menu.html", 
    controller: "AppCtrl"
  })

  //splash page
  .state('app.splash', {
    url: '/home', 
    views: {
      'menuContent': {
        templateUrl: 'templates/splash.html', 
        controller: 'SplashCtrl', 
        onEnter: function($state, User) { 
          User.checkSession().then(function(hasSession) {
            if (hasSession) $state.go('tab.discover');
          });
        }
      }
    }
  })

  // Set up an abstract state for the tabs directive:
  .state('app.tab', {
    url: '/tab',
    abstract: true,
    views: {
      'menuContent': {
        templateUrl: 'templates/tabs.html',
        controller: 'TabsCtrl', 
        //sont load the state until we've populated our User, if necessary. 
        resolve: {
          populateSession: function(User) {
            return User.checkSession(); 
          }
        }, 
        onEnter: function($state, User) {
          User.checkSession().then(function(hasSession) {
            if (!hasSession) $state.go('splash');
          });
        }
      }
    }
  })

  // Each tab has its own nav history stack:

  .state('app.tab.discover', {
    url: '/discover',
    views: {
      'tab-discover': {
        templateUrl: 'templates/discover.html',
        controller: 'DiscoverCtrl'
      }
    }
  })

  .state('app.tab.favorites', {
      url: '/favorites',
      views: {
        'tab-favorites': {
          templateUrl: 'templates/favorites.html',
          controller: 'FavoritesCtrl'
        }
      }
    })
  // If none of the above states are matched, use this as the fallback:
  $urlRouterProvider.otherwise('/app/home');

})


.constant('SERVER', {
  // Local server
  //url: 'http://localhost:3000'

  // Public Heroku server
  url: 'https://ionic-songhop.herokuapp.com'
});
