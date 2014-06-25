/* globals inject:false, JSON:false, Object:false */

if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1), 
        fToBind = this, 
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis
                 ? this
                 : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

var world = (function () {

    function getDeferred() {
        var $q,
            deferred;
        inject(function (_$q_) {
            $q = _$q_;
        });

        deferred = $q.defer();

        return deferred;
    }
    
    return {
        'flush': function () {
            inject(['$httpBackend', function ($httpBackend) {
                $httpBackend.flush();
            }]);
        },
        'resolved': function (value) {
            var deferred;

            deferred = getDeferred();
            deferred.resolve(value);

            return deferred.promise;
        },
        'rejected': function (value) {
            var deferred;

            deferred = getDeferred();
            deferred.reject(value);

            return deferred.promise;
        },
        'digest': function () {
            inject(function ($rootScope) {
                $rootScope.$digest();
            });
        },
        'shouldBeAFunction': function (object, functionName) {
            expect(object).toBeDefined();
            expect(object[functionName]).toBeDefined();
            expect(typeof object[functionName]).toBe('function');
        },
        'spyOnAllFunctions': function (object) {
            for (var key in object) {
                if (object.hasOwnProperty(key) && typeof object[key] === 'function') {
                    spyOn(object, key);
                }
            }
        },
        'sortJSON': function (object) {
            // rehydrate if already JSON string
            if (typeof object === "string") {
                object = JSON.parse(object);
            }

            // Create a sorted object to house the values
            var sorted = {};

            // Loop through all keys on object in order, copy to sorted object
            var keys = Object.keys(object).sort();
            for (var index in keys) {
                if (object.hasOwnProperty(keys[index])) {
                    sorted[keys[index]] = object[keys[index]];
                }
            }

            // Pass back JSONified
            return JSON.stringify(sorted);
        },
        'stringifyMethods': function (object) {
            // Loop through all keys on object, copy to sorted object, stringifying
            var keys = Object.keys(object);
            var sorted = {};
            for (var index in keys) {
                if (object.hasOwnProperty(keys[index])) {
                    sorted[keys[index]] = "" + object[keys[index]];
                }
            }

            return sorted;
        }
    };
})();