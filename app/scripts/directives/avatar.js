'use strict';

/**
 * @ngdoc function
 * @name cheesesApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the cheesesApp
 */
angular.module('cheesesApp')
    .directive('avatar', function () {
        return {
            restrict: 'E',
            templateUrl: 'views/directives/avatar.html',
            scope: {
                username: '='
            },
            replace: true
        };
    });