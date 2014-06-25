'use strict';

/**
 * @ngdoc function
 * @name cheesesApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the cheesesApp
 */
angular.module('cheesesApp')
    .directive('timestamp', function (nowTime) {
        return {
            restrict: 'A',
            link: function (scope, elem, attrs) {
                var fromTime;
                
                attrs.$observe('timestamp', function (value) {
                    fromTime = new Date(parseInt(value));
                });
                
                /* from http://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript */
                function pad(n, width, z) {
                    z = z || '0';
                    n = n + '';
                    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
                }
                
                /* from http://stackoverflow.com/questions/13627308/add-st-nd-rd-and-th-ordinal-suffix-to-a-number */
                function ordinal_suffix_of(i) {
                    var j = i % 10;
                    if (j === 1 && i !== 11) {
                        return i + 'st';
                    }
                    if (j === 2 && i !== 12) {
                        return i + 'nd';
                    }
                    if (j === 3 && i !== 13) {
                        return i + 'rd';
                    }
                    return i + 'th';
                }
                
                function formatTimestamp(timestamp) {
                    var diff = Date.now() - timestamp.getTime();
                    
                    if (diff > 24*60*60*1000) {
                        var months = ['jan', 'feb', 'mar', 'apr', 'may', 'june', 'july', 'aug', 'sept', 'oct', 'nov', 'dec'];
                        // return a date + time
                        return (new Date().getFullYear() !== timestamp.getFullYear() ? timestamp.getFullYear() + ' ' : '') + months[timestamp.getMonth()] + ' ' + ordinal_suffix_of(timestamp.getDate()) + ', ' + (timestamp.getHours() % 12) + ':' + pad(timestamp.getMinutes(), 2, 0) + ' ' + (timestamp.getHours() >= 12 ? 'PM' : 'AM');
                    } else if (diff > 60*60*1000) {
                        // return 'X ago, at Y'
                        var hours = Math.floor(diff / 60 / 60 / 1000);
                        return hours + ' hour' + (hours > 1 ? 's' : '') + ' ago at ' + pad(timestamp.getHours(), 2, '0') + ':' + pad(timestamp.getMinutes(), 2, '0');
                    } else {
                        // return 'x mins ago'
                        var mins = Math.floor((diff / 1000 / 60));
                        if (mins < 1) {
                            return 'seconds ago';
                        } else if (mins < 2) {
                            return 'about a minute ago';
                        } else {
                            return Math.round(mins) + ' minutes ago';
                        }
                    }
                    
                    return diff + 'lol';
                }
                
                scope.$watch(function () {
                    return nowTime() - fromTime;
                }, function () {
                    jQuery(elem).text(formatTimestamp(fromTime));
                });
            }
        };
    })
    .factory('nowTime', function ($timeout) {
        var nowTime = Date.now();
        var updateTime = function() {
            $timeout(function() {
                nowTime = Date.now();
                updateTime();
            }, 1000);
        };
        updateTime();
        return function() {
            return nowTime;
        };
    });