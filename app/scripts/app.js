'use strict';

/**
 * @ngdoc overview
 * @name cheesesApp
 * @description
 * # cheesesApp
 *
 * Main module of the application.
 */
angular
  .module('cheesesApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .when('/messages', {
        templateUrl: 'views/messages.html',
        controller: 'MessageCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
