/*
 Copyright 2016 IBM All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

	  http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

'use strict';

var api = require('fabric-client/lib/api.js');
var Cloudant = require('cloudant');

/**
 * This is a default implementation of the [KeyValueStore]{@link module:api.KeyValueStore} API.
 * It uses files to store the key values.
 *
 * @class
 */
var KeyValueStore = class extends api.KeyValueStore {

	/**
	 * constructor
	 *
	 * @param {Object} options contains a single property 'path' which points to the top-level directory
	 * for the store
	 */
	constructor(options) {
		
		if (!options || !options.account) {
            options = { 
                account: '8ef21d3b-fab2-4de4-8295-82de50a1be0f-bluemix',
                password: 'e7fc9613bd7878311fd2c925fb85c1e3c65b41da1b5aef19d21251fd2db69346',
                db: 'hyperldeger-console' 
            };
			//throw new Error('Must provide the path to the directory to hold files for the store.');
		}

		// Create the keyValStore instance
        super();
        
        var cloudant; 
        console.log("#####################################################################################");
        console.log("######################## Cloudant ###################################################");
        console.log("######################## options",options," ############################################");
        console.log("#####################################################################################");
		
        if(options.url) {
            cloudant = Cloudant(options.url);
        } else {
            cloudant = Cloudant({account: options.account, password: options.password});
        }
        
        var db = cloudant.db.use(options.db);

		var self = this;
		this.db = db;
		return new Promise(function(resolve, reject) {
			return resolve(self);
		});
	}

	/**
	 * Get the value associated with name.
	 * @param {string} name
	 * @returns Promise for the value
	 * @ignore
	 */
	getValue(name) {
        console.log("###############################################################");
        console.log("################# getValue name : ",name,"########################");
        console.log("###############################################################");
		var self = this;
        var db = self.db;
		return new Promise(function(resolve, reject) {
			db.get(name, function(err, data) {
                if(!data){
                    data = {};
                } 

                console.log("###############################################################");
                console.log("################# getValue name : ",name,"########################");
                console.log("################# getValue value : ",data.value,"########################");
                console.log("###############################################################");
                return resolve(data.value);
            });
		});
	}

	/**
	 * Set the value associated with name.
	 * @param {string} name
	 * @param {string} value
	 * @returns Promise for a "true" value on successful completion
	 * @ignore
	 */
	setValue(name, value) {
		console.log("###############################################################");
        console.log("################# setValue name : ",name,"########################");
        console.log("################# setValue value : ",value,"########################");
        console.log("###############################################################");
        var self = this;
        return new Promise(function(resolve, reject) {
            var db = self.db;
            db.get(name, function(err, doc) {
                if(err) {
                    
                    db.insert({value : value}, name, function(err, body, header) {
                        if (err) {
                            console.log('[insert] ', err);
                            return reject(err);
                        } else {
                            console.log('Certificate inserted');
                            console.log(body);
                            return resolve(value);
                        }
                    });
                    
                } else {
                    db.destroy(doc._id, doc._rev, function(err, data) {
                        if(err) {
                            return reject(err);
                        } else {
                            db.insert({value : value}, name, function(err, body, header) {
                            if (err) {
                                console.log('[insert] ', err);
                                return reject(err);
                            } else {
                                console.log('Certificate inserted');
                                console.log(body);
                                return resolve(value);
                            }
                        });
                        }
                    });
                }
            });

        });
	}
};

module.exports = KeyValueStore;
