var repoGraphScene = require("../../repo/repoGraphScene.js");

var attrs = {
	_id: Buffer,
	shared_id: Buffer,
	paths: [],
	type: String,
	api: Number,
	parents: [],
	name: String
};

var statics = {};

statics.findByUID = function(dbCol, uid, projection){
	'use strict';

	let filter = { _id: stringToUUID(uid) };
	return this.findById(dbCol, stringToUUID(uid), projection).then(obj => {
		return Promise.resolve(repoGraphScene(dbCol.logger).decode([obj.toObject()]));
	});

}

module.exports = {attrs, statics};
