angular.module('app.controllers')

.controller('SettingsPageCtrl', function($rootScope, $scope, $ionicPopup,
  EntryService, MidataService, MimotiMessages) {

    $scope.contact = MimotiMessages.Contact;

    $scope.settings = EntryService.settings();
    $scope.resetUserLogin = function(form) {
      if (window.confirm(MimotiMessages.Settings.CONFIRM_LOGOUT)) {
        EntryService.logout();
        location.reload(); // quick way to clear entries & stats
      }
    };

    $scope.resetUserData = function(form) {
      EntryService.reset();
      location.reload(); // quick way to clear entries & stats
    };

    $scope.updateNotifications = function() {
      $rootScope.$broadcast('handle.setreminders');
      $ionicPopup.alert({
        title: MimotiMessages.Settings.SAVE_CONFIRM,
        template: MimotiMessages.Settings.SAVE_NOTIFY,
      });
    };

    getEpochTime = function() {
      epochTime = $scope.settings.notify.time.split(":");
      epochTime = (parseInt(epochTime[0]) * 60 * 60) + (parseInt(epochTime[1]) * 60);
      return epochTime;
    };

    $scope.timePickerObject = {
      inputEpochTime: getEpochTime(),
      step: 15,
      format: 24,
      titleLabel: ' ',
      setLabel: 'OK',
      closeLabel: 'Abbruch',
      setButtonType: 'button-positive',
      closeButtonType: 'button-stable',
      callback: function (val) {
        if (typeof (val) !== 'undefined') {
          var d = new Date(val * 1000);
          // Convert from local to UTC time
          d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
          var zeromins = ('0' + d.getMinutes()).slice(-2);
          $scope.settings.notify.time = [d.getHours(), zeromins].join(':');
          $scope.updateNotifications();
        }
      }
    };

    // Don't focus on date/timepicker inputs (to avoid keyboard popup)
    $scope.blurInput = function($event){
      $event.target.blur();
    };
});
