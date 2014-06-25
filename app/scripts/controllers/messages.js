'use strict';

/**
 * @ngdoc function
 * @name cheesesApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the cheesesApp
 */
angular.module('cheesesApp')
  .controller('MessageCtrl', function ($scope) {
    $scope.username = 'fish';
    
    $scope.conversationId = 12345;
    
    $scope.conversationTitle = 'Hi there';
    
    $scope.messages = [
        {
            timestamp: 1402787932426,
            author: 'cat',
            body: 'Hello, how are you today?',
            attachments: [
                {
                    name: 'ref.jpg',
                    size: 301000
                }
            ]
        },
        {
            timestamp: 1402787941690,
            author: 'fish',
            body: '<< super, thank you :) >>'
        }
    ];
    
    $scope.attachments = [];
    
    $scope.$watch('messages', function (newval) {
        $scope.attachments = [];
        angular.forEach(newval, function (message) {
            if (message.attachments) {
                angular.forEach(message.attachments, function (val2) {
                    $scope.attachments.push(val2);
                });
            }
        });
    });
  });
