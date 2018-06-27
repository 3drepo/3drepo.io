/**
 *	Copyright (C) 2014 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// mongoose model factory for different db and collection name for each instance
"use strict";
const mongoose = require("mongoose");
mongoose.Promise = Promise;

module.exports = {

	models: {},

	dbManager: null,

	setDB: function(dbManager) {
		this.dbManager = dbManager;
	},

	__checkDb: function() {
		this.dbManager.getAuthDB().then(db => {
			if (!db) {
				throw new Error("db connection is null");
			}
		});
	},

	get: function (modelName, options) {
		this.__checkDb();

		const Model = mongoose.model(modelName);

		const data  = options && options.data || {};

		const item = new Model(data);

		// FIXME: this needs to use the normal getCollection(), which returns a promise.
		item.collection = this.dbManager._getCollection(options.account, this.__collectionName(modelName, options));

		item._dbcolOptions = options;

		return item;
	},

	__collectionName: function(modelName, options) {
		let collectionName;

		// collectionName can be a function or a static string
		if (typeof this.models[modelName].collectionName === "function") {

			collectionName = this.models[modelName].collectionName(options);
		} else {
			collectionName = this.models[modelName].collectionName;
		}

		return collectionName;
	},

	createClass: function(modelName, schema, collectionName) {
		if (this.models[modelName] && this.models[modelName].mongooseModel) {

			return this.models[modelName].mongooseModel;
		}

		let mongooseModel;
		if (mongoose.models[modelName]) {
			mongooseModel = mongoose.model(modelName);
		} else {
			mongooseModel = mongoose.model(modelName, schema);
		}

		// let mongooseModel =  mongoose.model(modelName, schema);

		this.models[modelName] = {
			collectionName,
			mongooseModel
		};

		mongooseModel.createInstance = (options, data) => {
			options.data = data;
			return this.get(modelName, options);
		};

		const self = this;

		function staticFunctionProxy(staticFuncName) {

			const staticFunc = mongooseModel[staticFuncName];

			return function(options) {

				const args = Array.prototype.slice.call(arguments);
				args.shift();

				// resetting the static collection
				if (!options || !options.account) {
					throw new Error("account name (db) is missing");
				}

				return self.dbManager.getCollection(options.account, self.__collectionName(modelName, options)).then(collection => {
					mongooseModel.collection = collection;
					const applyPromise = staticFunc.apply(this, args).then(items => {
						if (Array.isArray(items)) {

							items.forEach((item, index, array) => {
								item.collection = collection;
								item._dbcolOptions = options;
								array[index] = item;
							});

						} else if (items && typeof items !== "number") {
							items.collection = collection;
							items._dbcolOptions = options;
						}

						return Promise.resolve(items);
					});

					return applyPromise.then(items => {
						return items;
					}).catch(err => {
						self.dbManager.disconnect();
						return Promise.reject(err);
					});
				});
			};
		}

		["find", "findOne", "count", "distinct", "where", "findOneAndUpdate", "findOneAndRemove", "remove"].forEach(staticFuncName => {
			mongooseModel[staticFuncName] = staticFunctionProxy(staticFuncName);
		});

		mongooseModel.findById = function(options, id) {

			const args = Array.prototype.slice.call(arguments);
			args.splice(0, 2);

			args.unshift(options, { _id: id});

			return mongooseModel.findOne.apply(mongooseModel, args);
		};

		const update = mongooseModel.update;

		mongooseModel.update = function(options) {
			// FIXME: another one that breaks when I turn it into a promise.
			const collection = self.dbManager._getCollection(options.account,self.__collectionName(modelName, options));
			mongooseModel.collection = collection;

			const args = Array.prototype.slice.call(arguments);
			args.shift();

			return update.apply(mongooseModel, args);
		};

		mongooseModel.prototype.model = _modelName => {
			const model = this.models[_modelName].mongooseModel;
			return model;
		};

		return mongooseModel;
	}

};
