angular.module('app.controllers')

.controller('StatisticsPageCtrl', function(
  $rootScope, $scope, $ionicModal,
  EntryService, StatService,
  MidataService, MidataFormats, MimotiMessages
  ) {

    function defaults() {
      $scope.dataWeig = [{
        key: "Gewicht",
        area: true,
        color: "#4f93c1",
        values: []
      }];
      $scope.dataCond = [{
        key: "Wohlbefinden",
        area: true,
        color: "#b0cb4d",
        values: []
      }];
      $scope.dataStep = [{
        key: "Schritte",
        area: true,
        color: "#f3b881",
        values: []
      }];
    }

    function draw() {
      entries = EntryService.allValid();
      stats = EntryService.dailystats();
      alldata = StatService.getData(entries, stats);

      defaults();
      $scope.dataWeig[0].values = alldata.Weight;
      $scope.dataCond[0].values = alldata.Condition;
      $scope.dataStep[0].values = alldata.Steps;
      // console.log(alldata);

      if (alldata.Steps.length > 0) {
        $scope.totalStep = alldata.Steps
          .map(function(a){ return a.y; })
          .reduce(function(a,b){ return a+b; });
      }
      $scope.dataStep[0].key = 'Schritte (' + $scope.totalStep + ' seit Beginn)';
    }

    defaults();
    $rootScope.$on('handle.redraw', draw, false);

});
