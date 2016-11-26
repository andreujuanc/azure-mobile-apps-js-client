// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

/**
 * @file IndexDb implementation of the local store.
 * Using https://github.com/yathit/ydn-db for  now
 * @private
 */

var     Platform = require('.'),
        Validate = require('../../Utilities/Validate'),
        _ = require('../../Utilities/Extensions'),
        taskRunner = require('../../Utilities/taskRunner'),

        ydn = require('ydn.db'),

        idPropertyName = "id", // TODO: Add support for case insensitive ID and custom ID column
        defaultDbName = 'mobileapps.db';


var MobileServiceIndexDb = function (dbName) {

    // Guard against initialization without the new operator
    "use strict";
    if ( !(this instanceof MobileServiceIndexDb) ) {
        return new MobileServiceIndexDb(dbName);
    }

    if ( _.isNull(dbName) ) {
        dbName = defaultDbName;
    }

    var tableDefinitions = {},
        runner = taskRunner();

    /**
     * Initializes the store.
     * A handle to the underlying sqlite store will be opened as part of initialization.
     * 
     * @function
     * @instance
     * @memberof MobileServiceSqliteStore
     * 
     * @returns A promise that is resolved when the initialization is complete OR rejected if it fails.
     */
    this.init = function() {
        return runner.run(function() {
            return this._init();
        }.bind(this));
    };

    this._init = function() {
        var self = this;
        return Platform.async(function(callback) {
            if (self._db) {
                return callback(); // already initialized.
            }

            //TODO: Should we use this?
            window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"}; // This line should only be needed if it is needed to support the object's constants for older browsers
            window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
        
            var request = window.indexedDB.open(dbName, 1);

            var db = window.sqlitePlugin.openDatabase(
                { name: dbName, location: 'default' },
                function successcb() {
                    self._db = db; // openDatabase is complete, set self._db
                    callback();
                },
                callback
            );

        })();
    };


    /**
     * Closes the handle to the underlying sqlite store.
     * 
     * @function
     * @instance
     * @memberof MobileServiceSqliteStore
     * 
     * @returns A promise that is resolved when the sqlite store is closed successfully OR rejected if it fails.
     */
    this.close = function() {
        var self = this;
        return runner.run(function() {
            if (!self._db) {
                return; // nothing to close
            }

            return Platform.async(function(callback) {
                self._db.close(function successcb() {
                    self._db = undefined;
                    callback();
                },
                callback);
            })();
        });
    };
};


module.exports = MobileServiceSqliteStore;