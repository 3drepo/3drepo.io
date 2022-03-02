const { removeAllFilesFromModel } = require("../../models/fileRefs");
const { deleteModel } = require("../../models/modelSettings");
const db = require('../../handler/db');
const ModelHelper = {};

const removeModelCollections = async (ts, model) => {
	const collections = await db.listCollections(ts);
	const promises = [];

	collections.forEach((collection) => {
		if (collection.name.startsWith(`${model}.`)) {
			promises.push(db.dropCollection(ts, collection));
		}
	});

	return Promise.all(promises);
};

ModelHelper.removeModelData = async (teamspace, model) => {
	// This needs to be done before removeModelCollections or we risk the .ref col being deleted before we check it
	await removeAllFilesFromModel(teamspace, model);

	return Promise.all([
		removeModelCollections(teamspace, model),
		deleteModel(teamspace, model),
	]);
};


module.exports = ModelHelper;
