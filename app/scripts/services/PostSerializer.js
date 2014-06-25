'use strict';

var PostSerializerModule = angular.module('commissar.services.PostSerializer', []);

PostSerializerModule.factory('PostSerializer', function () {

    var PostSerializer = {
        'serialize': function (input) {
            return jQuery.param(input);
        }
    };

    return PostSerializer;
});