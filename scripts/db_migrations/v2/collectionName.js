'use strict';

const uuidV4 = require('node-uuid').v4;
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const url = process.argv[2];

function isUUID(uuid) {
    return uuid && Boolean(uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i));
}

if(!url){
	console.log('Please specify mongodb url');
	process.exit();
}

let db;
// Connect using MongoClient
MongoClient.connect(url).then(_db => {

	db = _db;
	return db.admin().listDatabases();

}).then(dbObject => {


	let promises = [];
	let innerPromises = [];

	dbObject.databases.forEach(dbItem => {
		// each db

		const thisDb = db.db(dbItem.name);
		let fedProjs = [];

		promises.push(
			new Promise((resolve, reject) => {
				thisDb.collection('settings').find().sort({'federate': -1}).forEach(modelSetting => {
					//each model

					const oldModelId = modelSetting._id;
					console.log(`processing ${dbItem.name}::${oldModelId}`);
					
					if(modelSetting.federate){
						fedProjs.push(modelSetting);
					}

					if(isUUID(oldModelId)){
						console.log(`${dbItem.name}::${oldModelId} - looks like the model id is already an UUID. Done.`)
						return;
					}

					const newModelId = uuidV4();

					modelSetting.name = oldModelId;
					modelSetting._id = newModelId;

					//change all collection names
					function changeModelId(){

						console.log(`${dbItem.name}::${oldModelId} - inserting model setting with new id ${newModelId}`);
						let collections;

						return thisDb.collection('settings').insertOne(modelSetting).then(() => {
							return thisDb.listCollections({ name: new RegExp(`^${oldModelId}\\.`)}).toArray();
						}).then(_collections => {

							collections = _collections;

							let collectionProms = [];
							let updateProms = [];

							collections.forEach(collection => {
								if(collection.name.endsWith('.files')){
									console.log(`${dbItem.name}::${oldModelId} - rename all filename path in ${collection.name}`);
									collectionProms.push(
										thisDb.collection(collection.name).find({filename: {'$exists': 1}}, {filename : 1}).toArray().then(items => {
											
											items.forEach(item => {
												let newFileName = item.filename.split('/');
												if(newFileName[2] === oldModelId){
													newFileName[2] = newModelId;
													newFileName = newFileName.join('/');
													updateProms.push(thisDb.collection(collection.name).updateOne({ _id: item._id}, { '$set': { 'filename': newFileName}}));
												}
											});

										})
									);
								}
								
							});

							return Promise.all(collectionProms).then(() => Promise.all(updateProms));

						}).then(() => {

							let renameProms = [];
							collections.forEach(collection => {
								//rename collection
								const newCollectionName = `${newModelId}.${collection.name.split('.').slice(1).join('.')}`;
								console.log(`${dbItem.name}::${oldModelId} - renaming collection ${collection.name} to ${newCollectionName}`);


								renameProms.push(thisDb.renameCollection(collection.name, newCollectionName));
							});

							return Promise.all(renameProms);

						}).then(() => {
							//change all model names in user.customData.models
							console.log(`${dbItem.name}::${oldModelId} - updating all user.customData.models`);

							return db.db('admin').collection('system.users').updateMany(
								{'customData.models': {'$elemMatch': {account: dbItem.name, model: oldModelId} } },
								{'$set': { 'customData.models.$.model' : newModelId}}
							);

						}).then(() => {

							console.log(`${dbItem.name}::${oldModelId} - renaming model name in projects collection `);
							return thisDb.collection('projects').updateMany({ models: oldModelId}, {'$set': {'models.$' : newModelId} });

						}).then(() => {
							//remove old model settings
							console.log(`${dbItem.name}::${oldModelId} - removing old model settings`)
							return thisDb.collection('settings').deleteOne( { _id : oldModelId});
						}).then(() => {

							let updateFedProms = [];

							if(!modelSetting.federate){
								console.log(`${dbItem.name}::${oldModelId} - changing the model id of ref objects in all federate projects`)
								
								fedProjs.forEach(fedProj => {
									updateFedProms.push(
										thisDb.collection(`${fedProj._id}.scene`).updateMany({ name: `${dbItem.name}:${oldModelId}`}, { '$set': { name: `${dbItem.name}:${newModelId}` } }),
										thisDb.collection(`${fedProj._id}.scene`).updateMany({ project: oldModelId}, { '$set': { project: newModelId } })
									);
								})
							}

							return Promise.all(updateFedProms);
						});
					}

					innerPromises.push(changeModelId());


				}, err => {
					err ? reject(err) : resolve();
				});
			})
		);
	});

	return Promise.all(promises).then(() => Promise.all(innerPromises));

}).then(() => {
	console.log('Done!');
	process.exit();
}).catch(err => {
	console.log(err);
	process.exit(-1);
})