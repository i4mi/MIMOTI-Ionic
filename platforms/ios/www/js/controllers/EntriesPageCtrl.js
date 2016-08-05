angular.module('app.controllers')

.controller('EntriesPageCtrl', function(
  $rootScope, $scope, $state, $ionicPopup,
  EntryService, MidataService, MimotiMessages) {

    $scope.listCanSwipe = true;

    function refresh() {
      $scope.entries = EntryService.allValid();
    }

    $scope.invalidateEntry = function(entry) {
      if (!entry.records) {
        console.info('No records in entry, reloading');
        $rootScope.$broadcast('handle.reload');
        return;
      }
      // $ionicPopup
      //   .confirm({
      //     title: MimotiMessages.Entries.CONFIRM_DELETE,
      //     template: entry.date
      //   })
      //   .then(function(result) {
          // if (!result) return;
          MidataService.invalidate(entry.records);
          var index = $scope.entries.indexOf(entry);
          $scope.entries.splice(index, 1);
        // });
    };

    $scope.fullComment = function(entry) {
      if (!entry.comment) return;
      $ionicPopup.alert({
        title: entry.date,
        template: entry.comment
      });
    };

    refresh();
    $rootScope.$on('handle.refresh', refresh, false);
});
