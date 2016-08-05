angular.module('app', [
  'ionic',
  'ionic-material',
  'ngCordova',
  'app.controllers',
  'app.routes',
  'app.services',
  'app.directives'
])

.config(['$ionicConfigProvider', function($ionicConfigProvider) {
    $ionicConfigProvider.tabs.position('bottom'); // other values: top
}])

.run(function($ionicPlatform, $rootScope) {
    $ionicPlatform.ready(function() {
        if(window.cordova && window.cordova.plugins.Keyboard) {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard for form inputs)
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if(window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    		$rootScope.$on('$cordovaLocalNotification:trigger', function (event, notification, state) {
          $rootScope.$broadcast('handle.notify', notification);
  			});
    });
    $ionicPlatform.on('pause', function() {
      // Clear cache on application wait
      $rootScope.$broadcast('handle.pause');
    });
});
