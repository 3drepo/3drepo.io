const addAdminJob = require('./addAdminJob');
const removeUnityAssetsJSON = require('./removeUnityAssetsJSON');
const removeGridFSBackUps = require('./removeGridFSBackUps');
const moveGridFSToFS = require('./moveGridFSToFS');

const scripts = [
	{ script: addAdminJob, desc: 'Add Admin job and assign the teamspace owner' },
	{ script: removeUnityAssetsJSON, desc: 'Remove redundant UnityAssets.json files' },
	{ script: removeGridFSBackUps, desc: 'Remove GridFS backup entries' },
	{ script: moveGridFSToFS, desc: 'Move gridFS documents to fileshare' },
	{ script: removeGridFSBackUps, desc: 'Remove redundant GridFS files (due to last script)' },
];

module.exports = scripts;
