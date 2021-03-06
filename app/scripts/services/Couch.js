'use strict';

function emit() {
    /* I am used on the couch server to emit information about a document to build search indexes. */
}

var CouchModule = angular.module('commissar.services.Couch', ['CornerCouch', 'ngCookies']);

CouchModule.factory('Couch', function ($rootScope, cornercouch, $q) {
    if (!$rootScope.cornercouch) {
        $rootScope.cornercouch = cornercouch('/couchdb', 'GET');
    }

    function isDefined(value) {
        return typeof value !== 'undefined';
    }

    var Couch = {
        _designDocs: {
            commissar_validation_global: {
                '_design/validation_global': {
                    _id: '_design/validation_global',
                    language: 'javascript',
                    validate_doc_update: function (newDoc, oldDoc, userCtx) {
                        if (userCtx.roles.indexOf('_admin') !== -1) {
                            return null;
                        }
                        if (!newDoc._deleted) {
                            if (!newDoc.type) {
                                throw ({
                                    forbidden: 'All documents must have a type'
                                });
                            }
                            if (userCtx.db !== 'commissar_user_' + userCtx.name && userCtx.roles.indexOf('+admin') === -1) {
                                throw ({
                                    forbidden: 'Cannot alter documents outside your own database'
                                });
                            }
                            if (newDoc.created) {
                                if (String(parseInt(newDoc.created, 10)) !== String(newDoc.created)) {
                                    throw ({
                                        forbidden: 'Created timestamp must be in unix format'
                                    });
                                }
                                if (oldDoc && typeof oldDoc.created !== 'undefined' && newDoc.created !== oldDoc.created) {
                                    throw ({
                                        forbidden: 'Cannot alter created timestamp once set'
                                    });
                                }
                            }
                            if (newDoc.updated && String(parseInt(newDoc.updated, 10)) !== String(newDoc.updated)) {
                                throw ({
                                    forbidden: 'Updated timestamp must be in unix format'
                                });
                            }
                        }
                    },
                    'filters': {
                        'should_copy_to_private': function () {
                            return true;
                        },
                        'should_copy_to_public': function (doc, req) {
                            return (
                                // Replication status is 'public'
                                typeof doc.replication !== 'undefined' &&
                                typeof doc.replication.status !== 'undefined' &&
                                doc.replication.status === 'public' &&
                                // DB is 'commissar_public'
                                typeof req.query !== 'undefined' &&
                                typeof req.query.x_target !== 'undefined' &&
                                req.query.x_target === 'commissar_public'
                            );
                        },
                        'should_copy_to_personal': function (doc, req) {
                            return (
                                (
                                    // Document has author
                                    typeof doc.author !== 'undefined' &&
                                    // Current database's username matches author
                                    typeof req.query !== 'undefined' &&
                                    typeof req.query.x_target !== 'undefined' &&
                                    'commissar_user_' + doc.author === req.query.x_target
                                ) ||
                                (
                                    // Target is a user db
                                    typeof req.query !== 'undefined' &&
                                    typeof req.query.x_target !== 'undefined' &&
                                    req.query.x_target.indexOf('commissar_user_') === 0 &&
                                    // Replication status is 'shared'
                                    typeof doc.replication !== 'undefined' &&
                                    typeof doc.replication.status !== 'undefined' &&
                                    doc.replication.status === 'shared' &&
                                    // Current database's username appears in 'involved'
                                    typeof doc.replication.involved.indexOf(req.query.x_target.substr(15)) !== -1
                                ) ||
                                (
                                    // Is a design document
                                    doc.id.indexOf('_design/') === 0
                                )
                            );
                        }
                    }
                }
            },
            commissar_validation_users: {
                '_design/validation_user': {
                    _id: '_design/validation_user',
                    language: 'javascript',
                    validate_doc_update: function (newDoc, oldDoc, userCtx) {

                        if (userCtx.roles.indexOf('_admin') !== -1) {
                            return null;
                        }

                        if (typeof newDoc._id === 'undefined') {
                            throw ({forbidden: 'ID is missing'});
                        }

                        if (!newDoc.author && oldDoc && !newDoc._deleted) {
                            throw ({forbidden: 'Cannot create a document without an author field'});
                        }
                        if (newDoc.author !== userCtx.name && userCtx.roles.indexOf('+admin') === -1 && oldDoc && !newDoc._deleted) {
                            throw ({forbidden: 'Cannot forge authorship as another user'});
                        }
                        if (newDoc._id.indexOf(newDoc.author) !== 0 && oldDoc && !newDoc._deleted) {
                            throw ({forbidden: 'IDs must start with your username'});
                        }
                        if (oldDoc && oldDoc.type && newDoc.type !== oldDoc.type && !newDoc._deleted) {
                            throw ({forbidden: 'Cannot change the type of a document'});
                        }
                        if (oldDoc && oldDoc.author && newDoc.author !== oldDoc.author && !newDoc._deleted) {
                            throw ({forbidden: 'Cannot change the author of a document'});
                        }
                        if (!newDoc.author && !oldDoc) {
                            throw ({forbidden: 'Cannot create a document without an author field'});
                        }
                        if (newDoc.author !== userCtx.name && userCtx.roles.indexOf('+admin') === -1 && !oldDoc) {
                            throw ({forbidden: 'Cannot forge authorship as another user'});
                        }
                        if (newDoc._id.indexOf(newDoc.author) !== 0 && !oldDoc) {
                            throw ({forbidden: 'IDs must start with your username'});
                        }
                        if (newDoc._deleted && oldDoc && oldDoc.author !== userCtx.name && userCtx.roles.indexOf('+admin') === -1) {
                            throw ({forbidden: 'Cannot delete as you are not the author'});
                        }
                    },
                    'filters': {
                        'isPublished': function () {

                        }
                    }
                },
                '_design/validation_user_media': {
                    _id: '_design/validation_user_media',
                    language: 'javascript',
                    validate_doc_update: function (newDoc, oldDoc, userCtx) {
                        if (userCtx.roles.indexOf('_admin') !== -1) {
                            return null;
                        }
                        if (newDoc.type === 'media') {
                            if (typeof newDoc.title === 'undefined') {
                                throw ({forbidden: 'Media must have a title'});
                            }
                            if (typeof newDoc.created === 'undefined') {
                                throw ({forbidden: 'Media must have a created timestamp'});
                            }
                            if (typeof newDoc.mediaType !== 'undefined' && newDoc.mediaType !== 'image') {
                                throw ({forbidden: 'Invalid media type' });
                            }
                        }
                    },
                    views: {
                        all: {
                            map: function (document) {
                                if (typeof document.type === 'string' && document.type === 'media') {
                                    emit(null, document);
                                }
                            }
                        },
                        byAuthor: {
                            map: function (document) {
                                if (typeof document.type === 'string' && document.type === 'media') {
                                    emit(document.author, document);
                                }
                            }
                        },
                        noThumbnails: {
                            map: function (document) {
                                if (document.type && document.type === 'media' && !document.thumbnails) {
                                    emit(null, document);
                                }
                            }
                        }
                    }
                }
            }
        },
        pushDesignDocs: function () {
            var deferred = $q.defer();

            Couch.getSession().then(function (session) {

                // Admins only plz.
                if (session.roles.indexOf('+admin') === -1) {
                    deferred.reject('Cannot push design documents as you are not an admin');
                    return false;
                }

                var remoteDocs = [];

                // Loop through all databases
                Object.getOwnPropertyNames(Couch._designDocs).forEach(function (databaseName) {

                    // Get a copy of the local database object
                    var localDatabase = Couch._designDocs[databaseName];

                    // Loop through all documents in the local database
                    Object.getOwnPropertyNames(localDatabase).forEach(function (id) {

                        // Apply changes to the document
                        remoteDocs.push(Couch.applyStaticChanges(databaseName, localDatabase[id]));

                    });
                });

                $q.all(remoteDocs).then(function (result) {
                    deferred.resolve(result);
                }, function (reject) {
                    deferred.reject(reject);
                });

            });

            return deferred.promise;
        },
        stringifyFunctions: function (obj) {
            for (var property in obj) {
                if (obj.hasOwnProperty(property)) {
                    if (typeof obj[property] === 'function') {
                        obj[property] = '' + obj[property];
                    } else if (typeof obj[property] === 'object') {
                        obj[property] = this.stringifyFunctions(obj[property]);
                    }
                }
            }

            return obj;
        },
        /**
         * Copies attributes from the given document to the real document
         * after retrieving it from the database. Will create the document
         * if necessary.
         *
         * Useful when you only have to make a tiny or very predictable
         * update, and don't wnat the hassle of loading the document
         * yourself.
         *
         * @param {string} databaseName to save the document details to
         * @param {Object} documentObject object to copy details from
         * @returns {undefined}
         */
        applyStaticChanges: function (databaseName, documentObject) {
            var deferred = $q.defer();

            var updateRemote = function (document, remoteDocument) {
                // Copy the local properties onto the remote document
                Object.getOwnPropertyNames(document).forEach(function (property) {
                    remoteDocument[property] = document[property];
                });
            };

            // Copy the document, so we don't modify the original
            var deepCopy = true;
            var document = jQuery.extend(deepCopy, {}, documentObject);

            // Convert all functions to strings
            Couch.stringifyFunctions(document);

            // Get the remote document
            Couch.getDoc(databaseName, document._id).then(function (remoteDocument) {

                // Update remote and save it out
                updateRemote(document, remoteDocument);
                remoteDocument.save().then(function (reply) {
                    document._rev = reply.data.rev;

                    deferred.resolve(true);
                }, deferred.reject);

            }, function () {

                // Create document, update, and save out
                Couch.newDoc(databaseName).then(function (remoteDocument) {
                    updateRemote(document, remoteDocument);
                    remoteDocument.save().then(function () {
                        deferred.resolve(true);
                    }, deferred.reject);
                }, deferred.reject);

            });

            return deferred.promise;
        },
        getDoc: function (database, id) {
            var deferred = $q.defer();

            Couch.databaseExists(database).then(function (databaseFound) {
                if (databaseFound) {
                    var db = $rootScope.cornercouch.getDB(database);
                    var doc = db.newDoc();
                    var loading = doc.load(id);

                    loading.success(function () { deferred.resolve(doc); }).error(deferred.reject);
                } else {
                    deferred.reject('Database not found: ' + database);
                }
            }, deferred.reject);

            return deferred.promise;
        },
        saveDoc: function (document, database) {
            var deferred = $q.defer();

            Couch.validateDoc(document, null, database).then(function () {
                Couch.databaseExists(database).then(function (exists) {
                    if (exists) {
                        document.save().then(deferred.resolve, deferred.reject);
                    } else {
                        deferred.reject('Database not found: ' + database);
                    }
                });
            }, function (message) {
                console.error(message);
                deferred.reject(message);
            });

            return deferred.promise;
        },
        newDoc: function (database) {
            var deferred = $q.defer();

            Couch.databaseExists(database).then(function (databaseFound) {
                if (databaseFound) {
                    var db = $rootScope.cornercouch.getDB(database);
                    var doc = db.newDoc();

                    deferred.resolve(doc);
                } else {
                    deferred.reject('Database not found: ' + database);
                }
            }, deferred.reject);

            return deferred.promise;
        },
        validateDoc: function (newDoc, oldDoc, database) {
            var deferred = $q.defer(),
                viewDocs = Couch._designDocs;

            Couch.getSession().then(function (session) {

                var userCtx,
                    docId,
                    doc;

                userCtx = jQuery.extend({}, session);
                userCtx.db = database;

                try
                {
                    if (database.indexOf('commissar_user') === 0) {
                        for (docId in viewDocs.commissar_validation_users) {
                            doc = viewDocs.commissar_validation_users[docId];
                            if (typeof doc.validate_doc_update === 'function') {
                                doc.validate_doc_update(newDoc, oldDoc, userCtx);
                            }
                        }
                    }
                    for (docId in viewDocs.commissar_validation_global) {
                        doc = viewDocs.commissar_validation_global[docId];
                        if (typeof doc.validate_doc_update === 'function') {
                            doc.validate_doc_update(newDoc, oldDoc, userCtx);
                        }
                    }

                }
                catch (error) {
                    if (typeof error.forbidden === 'undefined') {
                        throw error;
                    }
                    deferred.reject(error.forbidden);
                }

                deferred.resolve(true);

            }, function (reason) {
                deferred.reject(reason);
            });


            return deferred.promise;
        },
        databaseExists: function (databaseName) {
            var deferred = $q.defer();

            if (isDefined($rootScope.cornercouch.databases)) {
                deferred.resolve($rootScope.cornercouch.databases.indexOf(databaseName) > -1);
            } else {
                $rootScope.cornercouch.getDatabases().then(function () {
                    deferred.resolve($rootScope.cornercouch.databases.indexOf(databaseName) > -1);
                });
            }

            return deferred.promise;
        },
        getSession: function () {
            var deferred = $q.defer();
            if (typeof $rootScope.cornercouch.userCtx !== 'undefined') {
                deferred.resolve($rootScope.cornercouch.userCtx);
            } else {
                $rootScope.cornercouch.session().then(function () {
                    deferred.resolve($rootScope.cornercouch.userCtx);
                }, deferred.reject);
            }

            return deferred.promise;
        },
        login: function (username, password) {
            var deferred = $q.defer();

            $rootScope.cornercouch.login(username, password).then(function () {
                deferred.resolve(true);
            }, function () {
                deferred.resolve(false);
            });

            return deferred.promise;
        },
        logout: function () {
            return $rootScope.cornercouch.logout();
        },
        loggedIn: function () {
            var deferred = $q.defer();

            Couch.getSession().then(function (userCtx) {
                deferred.resolve(!!(userCtx && userCtx.name));
            }, deferred.reject);

            return deferred.promise;
        },
        hasRole: function (role) {
            var deferred = $q.defer();

            Couch.loggedIn().then(function (loggedIn) {
                if (loggedIn) {
                    Couch.getSession().then(function (session) {
                        deferred.resolve(session.roles.indexOf(role) > -1);
                    });
                } else {
                    deferred.resolve(false);
                }
            }, deferred.reject);

            return deferred.promise;
        }
    };

    return Couch;
});
