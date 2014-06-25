'use strict';

/**
 * @ngdoc function
 * @name cheesesApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the cheesesApp
 */
angular.module('cheesesApp')
    .directive('attachment', function () {
        return {
            restrict: 'E',
            templateUrl: 'views/directives/attachment.html',
            scope: {
                attachment: '='
            },
            replace: true
        };
    });