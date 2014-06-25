'use strict';

/**
 * @ngdoc function
 * @name cheesesApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the cheesesApp
 */
angular.module('cheesesApp')
    .directive('message', function () {
        return {
            restrict: 'E',
            templateUrl: 'views/directives/message.html',
            scope: {
                message: '='
            },
            replace: true
        };
    });