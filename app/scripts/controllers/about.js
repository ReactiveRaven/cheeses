'use strict';

/**
 * @ngdoc function
 * @name cheesesApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the cheesesApp
 */
angular.module('cheesesApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
