'use strict';

/**
 * @ngdoc function
 * @name cheesesApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the cheesesApp
 */
angular.module('cheesesApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
