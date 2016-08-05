angular.module('app.routes', [
  'app.controllers'
])

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('loginPage', {
      url: '/login',
      templateUrl: 'templates/loginPage.html',
      controller: 'LoginPageCtrl'
    })

    .state('tabsController.statisticsPage', {
      url: '/page-stats',
      views: {
        'tab1': {
          templateUrl: 'templates/statisticsPage.html',
          controller: 'StatisticsPageCtrl'
        }
      }
    })

    .state('tabsController.entriesPage', {
      url: '/page-entries',
      views: {
        'tab2': {
          templateUrl: 'templates/entriesPage.html',
          controller: 'EntriesPageCtrl'
        }
      }
    })

    .state('tabsController.settingsPage', {
      url: '/page-setup',
      views: {
        'tab3': {
          templateUrl: 'templates/settingsPage.html',
          controller: 'SettingsPageCtrl'
        }
      }
    })

    .state('tabsController', {
      url: '/page1',
      templateUrl: 'templates/tabsController.html',
      controller: 'TabsCtrl',
      abstract:true
    });

    $urlRouterProvider.otherwise('/login');

});
