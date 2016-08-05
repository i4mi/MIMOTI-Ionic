angular.module('app.controllers')

.controller('TabsCtrl', function($rootScope, $scope, $state,
  $ionicModal, $ionicPopup, $ionicPlatform, $ionicLoading,
  $cordovaLocalNotification, $cordovaNetwork, datetime,
  EntryService, MidataService, MidataFormats, MimotiMessages) {

  if (!MidataService.connected()) {
    $state.go('loginPage');
  }

  $rootScope.$on('handle.setreminders', function() {
    if (!ionic.Platform.isWebView()) return; // device only

    DAYS_PRESET = 7;

    var atTime = EntryService.settings().notify.time.split(":");
    var atHours = parseInt(atTime[0]);
    var atMinutes = parseInt(atTime[1]);
    var isDisabled = !(EntryService.settings().notify.active);

    addDays = function(days) {
      var at = new Date();
      at.setDate(at.getDate() + days);
      at.setHours(atHours);
      at.setMinutes(atMinutes);
      if (new Date() - at > 0) return null;
      return at;
    };

    // Reset existing notifications for the next days
    $cordovaLocalNotification.cancelAll();
    for (var i = 0; i < DAYS_PRESET; i++) {
      when = addDays(i);
      if (isDisabled || !when) continue;

      console.info('Scheduling notification at ' + when);
      $cordovaLocalNotification.schedule({
        id: i,
        at: when,
        title: MimotiMessages.Notification.title,
        text: MimotiMessages.Notification.text,
      }).then(function (result) {
        // console.log('Notification set', result);
      }); // jshint ignore:line
    }
  }, false);

  // Open dialog on app load via tap
  $rootScope.$on('handle.notify', function() {
    if (typeof $scope.entryModal !== 'undefined')
      $scope.entryModal.show();
  }, false);

  // Actions when app is paused
  // $rootScope.$on('handle.pause', function() {
  //   EntryService.reset(); // clear data
  //   $state.go('loginPage');
  // }, false);

  $ionicPlatform.ready(function () {
    // Reset reminders at every app start
    $rootScope.$broadcast('handle.setreminders');
  });

  // Handle device connectivity
  document.addEventListener("deviceready", function () {
    var offlineAlert = null;
    $rootScope.$on('$cordovaNetwork:offline', function(event, networkState) {
      offlineAlert = $ionicPopup.show({
        title: MimotiMessages.Connection.NO_CONN,
        template: MimotiMessages.Connection.NO_CONN_TEXT,
        buttons: []
      });
      offlineStatus = function() {
        if ($cordovaNetwork.isOffline()) {
          console.info('Still offline ...');
          $timeout(offlineStatus, 1000); // Check again after 1 sec
        } else {
          console.info('Online now!');
          if (offlineAlert !== null) offlineAlert.close();
        }
      };
      offlineAlert();
      offlineStatus();
    });
    $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
      if (offlineAlert !== null) offlineAlert.close();
      $state.go('tabsController.statisticsPage');
    });
  });

  $scope.entries = EntryService.allValid();

  $scope.resetEntry = function() {
    $scope.entry = EntryService.blank();
  };

  $scope.timePickerObject = {
    inputEpochTime: ((new Date()).getHours() * 60 * 60),
    step: 10,
    format: 24,
    titleLabel: ' ',
    setLabel: 'OK',
    closeLabel: 'Abbruch',
    setButtonType: 'button-positive',
    closeButtonType: 'button-stable',
    callback: function (val) {
      if (typeof (val) !== 'undefined') {
        var d = new Date(val * 1000);
        d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
        $scope.entry.date.setHours(d.getHours());
        $scope.entry.date.setMinutes(d.getMinutes());
        $scope.entry.date.setSeconds(0);
        $scope.entry.date.setMilliseconds(0);
        var zeromins = ('0' + d.getMinutes()).slice(-2);
        $scope.entry.time = [d.getHours(), zeromins].join(':');
      }
    }
  };

  // Don't focus on date/timepicker inputs (to avoid keyboard popup)
  $scope.blurInput = function($event){
    $event.target.blur();
  };

  // Create and load the Modal
  $ionicModal.fromTemplateUrl('templates/entryForm.html', {
    scope: $scope
  //   animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.entryModal = modal;
    $scope.resetEntry();
  });

  // Called when the form is submitted
  $scope.createEntry = function(entry) {
    valid = EntryService.validateAndSave(entry);
    if (valid === true) {
      $ionicLoading.show({ template: MimotiMessages.Entries.UPLOADING });
      MidataService.upload(entry).then(function(response) {
        $ionicLoading.hide();
        if (response !== true) {
          $ionicPopup.alert({ title: response });
          return;
        }
        $scope.entryModal.hide();
        $scope.resetEntry();
        // Navigate to statistics page after new entry
        $state.go('tabsController.statisticsPage');
        $rootScope.$broadcast('handle.redraw');
      });
    } else {
      $ionicPopup.alert(valid);
    }
  };
  // Open our new task modal
  $scope.newEntry = function() {
    $scope.resetEntry();
    $scope.entryModal.show();
  };
  // Close the new task modal
  $scope.closeNewEntry = function() {
    $scope.entryModal.hide();
    $scope.resetEntry();
  };
  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.entryModal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });

  function refreshData(andRedraw) {
    if (!MidataService.connected()) return;
    $ionicLoading.show({ template: MimotiMessages.Entries.DOWNLOADING });
    // No local cache: clear each time
    EntryService.reset();
    since = null;
    // Find out what the latest record is
    // since = EntryService.getRecordSinceOrNull();
    console.info("Loading activities data since", since);
    // Download each data type
    loadOtherData = function() {
      console.info("Loading weight data");
      MidataService.download(MidataFormats.Weight, since).then(function(r) {
        if (!r) console.warn('Could not fetch weight');
        console.info("Loading condition data");
        MidataService.download(MidataFormats.Condition, since).then(function(r) {
          if (!r) console.warn('Could not fetch condition');
          console.info("Loading narrative data");
          MidataService.download(MidataFormats.Narrative, since).then(function(r) {
            if (!r) console.warn('Could not fetch narrative');
            console.info("Data loading complete, redrawing");
            $ionicLoading.hide();
            // Refresh the graphs
            if (andRedraw) {
              $state.go('tabsController.statisticsPage');
              $rootScope.$broadcast('handle.redraw');
            } else {
              $rootScope.$broadcast('handle.refresh');
            }
          });
        });
      });
    };
    // Download data only shown in statistics page
    if (andRedraw) {
      MidataService.download(MidataFormats._Steps).then(function(r) {
        if (!r) console.warn('Could not fetch steps');
        loadOtherData();
      });
    } else {
      loadOtherData();
    }
  }

  $scope.navigateStats = function() { refreshData(true); };
  $scope.navigateEntries = function() { refreshData(false); };
  $rootScope.$on('handle.reload', function() { refreshData(true); });

});
