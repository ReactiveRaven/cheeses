'use strict';

/**
 * @ngdoc function
 * @name cheesesApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the cheesesApp
 */
angular.module('cheesesApp')
    .filter('bytes', function () {
        return function (input) {
            var int = parseInt(input, 10);
            var units = ['B', 'KB', 'MB', 'GB', 'TB'];
            var divisor = 1024;
            var unit = 0;
            
            while (int > divisor) {
                int /= divisor;
                unit++;
            }
            
            return Math.round(int * 10 ) / 10 + units[unit];
        };
    });