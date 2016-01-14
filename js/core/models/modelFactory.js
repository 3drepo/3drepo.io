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

module.exports = {

	models: {},

	setDb: function(db){	
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

		let model = this.db.model(modelName);
		
		let data  = options && options.data || {};

		let item = new model(data);
		
		item.collection = this.db.useDb(options.account).collection(this.__collectionName(modelName, options));

		return item;		
	},

	__collectionName: function(modelName, options){
		'use strict';
		
		let collectionName;

		console.log(options);

		//collectionName can be a function or a static string
		if (typeof this.models[modelName].collectionName === 'function'){

			console.log('hello');
			collectionName = this.models[modelName].collectionName(options);
		} else {
			collectionName = this.models[modelName].collectionName;
		}

		return collectionName;
	},

	createClass: function(modelName, schema, collectionName) {
		'use strict';

		this.__checkDb();

		let mongooseModel =  this.db.model(modelName, schema);

		this.models[modelName] = { 
			collectionName
		};


		mongooseModel.createInstance = (options, data) => {
			options.data = data;
			return this.get(modelName, options);
		};

		let findOne = mongooseModel.findOne;

		//use rest parameters when node no longer requires the --es_staging flag 
		let self = this;

		mongooseModel.findOne = function(options){

			var args = Array.prototype.slice.call(arguments);
			args.shift();

			mongooseModel.collection = self.db.useDb(options.account).collection(self.__collectionName(modelName, options));

			return findOne.apply(mongooseModel, args);
		}

		return mongooseModel;
	}

};


//Usage example

// Create model

// var Test = ModelFactory.createClass(
// 	'Test', 
// 	{name: String}, 
// 	options => { 
// 		return `${options.project}.test`;
// 	}
// );

// Instantiate a model

// var test = ModelFactory.get('Test', {
// 	account: 'dbtest001',
// 	project: 'project001'
// });

//or 

//var test = Test.createInstance({
// 	account: 'dbtest001',
// 	project: 'project001'
// });

// test.name = 'test001';
// test.save();

// will save to collection: project001.test in db: dbtest001 
