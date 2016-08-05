angular.module('app.controllers')

.controller('LoginPageCtrl', function($rootScope, $scope, $state, $ionicPopup,
  EntryService, MidataService, MimotiMessages) {

    $scope.settings = EntryService.settings();

    $scope.inputPasswordType = 'password';
    $scope.toggleRevealPassword = function() {
      $scope.inputPasswordType = $scope.inputPasswordType == 'password' ? 'text' : 'password';
    };

    // attempt login
    $scope.submitLogin = function(formdata) {
      return $scope.processLogin(formdata);
    };

    $scope.processLogin = function(formdata) {
      EntryService.reset();
      EntryService.saveSettings($scope.settings);
      if (!$scope.settings.midata.usermail || !$scope.settings.midata.password) {
        $scope.showLoginForm = true;
        return;
      }
      console.info('Attempting login');
      $scope.showLoginForm = false;
      MidataService.login().then(function(result) {
        if (!MidataService.connected()) {
          $scope.showLoginForm = true;
          if (result !== null) {
            $ionicPopup.alert({
              title: MimotiMessages.Connection.LOGIN_ERROR,
              template: MimotiMessages.Connection.LOGIN_TRY +
                '<br><br>(' + result + ')'
            });
          }
        } else {
          console.info('Logged in');
          $rootScope.$broadcast('handle.reload');
          $state.go('tabsController.statisticsPage');
        }
      }, function(error) {
        $scope.showLoginForm = true;
        if (error !== null) {
          $ionicPopup.alert({
            title: MimotiMessages.Connection.ERROR,
            template: error
          });
        }
      });
    };

    $scope.cancelLogin = function() {
      EntryService.logout();
      $scope.showLoginForm = true;
    };

    $scope.showLoginForm = (
      typeof $scope.settings.midata.usermail === 'undefined' ||
      $scope.settings.midata.usermail === ''
    );
    if (!$scope.showLoginForm && !MidataService.connected()) {
      $scope.processLogin();
    }

});
