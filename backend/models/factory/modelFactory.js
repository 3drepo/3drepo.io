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
var mongoose = require('mongoose');
mongoose.Promise = Promise;

module.exports = {

	models: {},

	db: null,

	setDB: function(db){	
		this.db = db;
	},

	__checkDb: function(){
		if (!this.db){
			throw new Error('db connection is null');
		}
	},

	get: function (modelName, options){
		'use strict';

		this.__checkDb();

		let Model = mongoose.model(modelName);
		
		let data  = options && options.data || {};

		let item = new Model(data);
		
		item.collection = this.db.db(options.account).collection(this.__collectionName(modelName, options));

		item._dbcolOptions = options;

		return item;		
	},

	__collectionName: function(modelName, options){
		'use strict';
		
		let collectionName;


		//collectionName can be a function or a static string
		if (typeof this.models[modelName].collectionName === 'function'){

			collectionName = this.models[modelName].collectionName(options);
		} else {
			collectionName = this.models[modelName].collectionName;
		}

		return collectionName;
	},

	createClass: function(modelName, schema, collectionName) {
		'use strict';

		if (this.models[modelName] && this.models[modelName].mongooseModel){

			return this.models[modelName].mongooseModel;
		}

		let mongooseModel =  mongoose.model(modelName, schema);


		this.models[modelName] = { 
			collectionName,
			mongooseModel
		};

		mongooseModel.createInstance = (options, data) => {
			options.data = data;
			return this.get(modelName, options);
		};

		let self = this;

		function staticFunctionProxy(staticFuncName){

			let staticFunc = mongooseModel[staticFuncName];

			return function(options){

				var args = Array.prototype.slice.call(arguments);
				args.shift();

				// resetting the static collection
				if (!options || !options.account){
					throw new Error('account name (db) is missing');
				}

				let collection = self.db.db(options.account).collection(self.__collectionName(modelName, options));
				mongooseModel.collection = collection;

				return staticFunc.apply(this, args).then(items => {
					if (Array.isArray(items)){

						items.forEach((item, index, array) => {
							item.collection = collection;
							item._dbcolOptions = options;
							array[index] = item;
						});
						
					} else if (typeof items === 'number') {


					} else if (items){

						items.collection = collection;
						items._dbcolOptions = options;
					}

					return Promise.resolve(items);
				});
			};
		}

		['find', 'findOne', 'count', 'distinct', 'where', 'findOneAndUpdate', 'findOneAndRemove', 'remove'].forEach(staticFuncName => {
			mongooseModel[staticFuncName] = staticFunctionProxy(staticFuncName);
		});


		mongooseModel.findById = function(options, id){

			var args = Array.prototype.slice.call(arguments);
			args.splice(0, 2);

			args.unshift(options, { _id: id});

			return mongooseModel.findOne.apply(mongooseModel, args);
		};


		let update = mongooseModel.update;

		mongooseModel.update = function(options){

			self.db.db(options.account).collection(self.__collectionName(modelName, options));
			var args = Array.prototype.slice.call(arguments);
			args.shift();

			update.apply(mongooseModel, args);
		};

		mongooseModel.prototype.model = modelName => {
			let model = this.models[modelName].mongooseModel;
			return model;
		};

		return mongooseModel;
	}

};
