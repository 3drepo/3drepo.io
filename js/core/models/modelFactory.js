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

	checkDb: function(){
		if (!this.db){
			throw new Error('db connection is null')
		}
	},

	get: function (modelName, options){
		'use strict';

		this.checkDb();

		let model = this.db.model(modelName);
		
		let data  = options && options.data || {};

		let item = new model(data);

		let collectionName;

		if (typeof this.models[modelName].collectionName === 'function'){
			collectionName = this.models[modelName].collectionName(options);
		} else {
			collectionName = this.models[modelName].collectionName;
		}
		
		item.collection = this.db.useDb(options.account).collection(collectionName);

		return item;		
	},

	createClass: function(modelName, schema, collectionName) {
		'use strict';

		this.checkDb();

		let mongooseModel =  this.db.model(modelName, schema);
		
		console.log(this.models);

		this.models[modelName] = { 
			collectionName
		};

		return mongooseModel;
	}

};


//Usage example

// Create model

// ModelFactory.createClass(
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

// test.name = 'test001';
// test.save();

// will save to collection: project001.test in db: dbtest001 
