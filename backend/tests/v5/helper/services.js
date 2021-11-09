/**
 *  Copyright (C) 2021 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const Crypto = require('crypto');
const amqp = require('amqplib');

const { src, srcV4 } = require('./path');

const { createApp } = require(`${srcV4}/services/api`);
const DbHandler = require(`${src}/handler/db`);
const config = require(`${src}/utils/config`);
const { createTeamSpaceRole } = require(`${srcV4}/models/role`);
const { generateUUID, uuidToString, stringToUUID } = require(`${srcV4}/utils`);
const { PROJECT_ADMIN, TEAMSPACE_ADMIN } = require(`${src}/utils/permissions/permissions.constants`);

const db = {};
const queue = {};
const ServiceHelper = { db, queue };

queue.purgeQueues = async () => {
	try {
		// eslint-disable-next-line
		const { host, worker_queue, model_queue, callback_queue } = config.cn_queue;
		const conn = await amqp.connect(host);
		const channel = await conn.createChannel();

		channel.on('error', () => {});

		await Promise.all([
			channel.purgeQueue(worker_queue),
			channel.purgeQueue(model_queue),
			channel.purgeQueue(callback_queue),
		]);
	} catch (err) {
		// doesn't really matter if purge queue failed. it's just for clean up.
	}
};

// userCredentials should be the same format as the return value of generateUserCredentials
db.createUser = async (userCredentials, tsList = [], customData = {}) => {
	const { user, password, apiKey, basicData = {} } = userCredentials;
	const roles = tsList.map((ts) => ({ db: ts, role: 'team_member' }));
	const adminDB = await DbHandler.getAuthDB();
	return adminDB.addUser(user, password, { customData: { ...basicData, ...customData, apiKey }, roles });
};

db.createTeamspaceRole = (ts) => createTeamSpaceRole(ts);

// breaking = create a broken schema for teamspace to trigger errors for testing
db.createTeamspace = (teamspace, admins = [], breaking = false) => {
	const permissions = admins.map((adminUser) => ({ user: adminUser, permissions: TEAMSPACE_ADMIN }));
	return Promise.all([
		ServiceHelper.db.createUser({ user: teamspace, password: teamspace }, [],
			{ permissions: breaking ? undefined : permissions }),
		ServiceHelper.db.createTeamspaceRole(teamspace),
	]);
};

db.createProject = (teamspace, _id, name, models = [], admins = []) => {
	const project = {
		_id: stringToUUID(_id),
		name,
		models,
		permissions: admins.map((user) => ({ user, permissions: [PROJECT_ADMIN] })),
	};

	return DbHandler.insertOne(teamspace, 'projects', project);
};

db.createModel = (teamspace, _id, name, props) => {
	const settings = {
		_id,
		name,
		...props,
	};
	return DbHandler.insertOne(teamspace, 'settings', settings);
};

db.createRevision = (teamspace, modelId, revision) => {
	const formattedRevision = { ...revision, _id: stringToUUID(revision._id) };
	return DbHandler.insertOne(teamspace, `${modelId}.history`, formattedRevision);
};

db.createGroups = (teamspace, modelId, groups = []) => {
	const toInsert = groups.map((entry) => {
		const converted = {
			...entry,
			_id: stringToUUID(entry._id),
		};

		if ((entry.objects || []).length) {
			converted.objects = entry.objects.map((objectEntry) => {
				const convertedObj = { ...objectEntry };
				if (objectEntry.shared_ids) {
					convertedObj.shared_ids = objectEntry.shared_ids.map(uuidToString);
				}
				return convertedObj;
			});
		}

		return converted;
	});

	return DbHandler.insertMany(teamspace, `${modelId}.groups`, toInsert);
};

db.createJobs = (teamspace, jobs) => DbHandler.insertMany(teamspace, 'jobs', jobs);

db.createIssue = (teamspace, modelId, issue) => {
	const formattedIssue = { ...issue, _id: stringToUUID(issue._id) };
	return DbHandler.insertOne(teamspace, `${modelId}.issues`, formattedIssue);
};

db.createRisk = (teamspace, modelId, risk) => {
	const formattedRisk = { ...risk, _id: stringToUUID(risk._id) };
	return DbHandler.insertOne(teamspace, `${modelId}.risks`, formattedRisk);
};

db.createViews = (teamspace, modelId, views) => {
	const formattedViews = views.map((view) => ({ ...view, _id: stringToUUID(view._id) }));
	return DbHandler.insertMany(teamspace, `${modelId}.views`, formattedViews);
};

db.createLegends = (teamspace, modelId, legends) => {
	const formattedLegends = legends.map((legend) => ({ ...legend, _id: stringToUUID(legend._id) }));
	return DbHandler.insertMany(teamspace, `${modelId}.sequences.legends`, formattedLegends);
};

ServiceHelper.generateUUIDString = () => uuidToString(generateUUID());
ServiceHelper.generateUUID = () => generateUUID();
ServiceHelper.generateRandomString = (length = 20) => Crypto.randomBytes(Math.ceil(length / 2.0)).toString('hex');
ServiceHelper.generateRandomDate = (start = new Date(2018, 1, 1), end = new Date()) => new Date(start.getTime()
    + Math.random() * (end.getTime() - start.getTime()));
ServiceHelper.generateRandomNumber = (min = -1000, max = 1000) => Math.random() * (max - min) + min;

ServiceHelper.generateUserCredentials = () => ({
	user: ServiceHelper.generateRandomString(),
	password: ServiceHelper.generateRandomString(),
	apiKey: ServiceHelper.generateRandomString(),
	basicData: {
		firstName: ServiceHelper.generateRandomString(),
		lastName: ServiceHelper.generateRandomString(),
		billing: {
			billingInfo: {
				company: ServiceHelper.generateRandomString(),
			},
		},
	},
});

ServiceHelper.generateRevisionEntry = (isVoid = false) => ({
	_id: ServiceHelper.generateUUIDString(),
	tag: ServiceHelper.generateRandomString(),
	author: ServiceHelper.generateRandomString(),
	timestamp: ServiceHelper.generateRandomDate(),
	void: !!isVoid,
});

ServiceHelper.generateRandomModelProperties = () => ({
	properties: {
		code: ServiceHelper.generateRandomString(),
		unit: 'm',
	},
	desc: ServiceHelper.generateRandomString(),
	type: ServiceHelper.generateRandomString(),
	status: 'ok',
	surveyPoints: [
		{
			position: [
				ServiceHelper.generateRandomNumber(),
				ServiceHelper.generateRandomNumber(),
				ServiceHelper.generateRandomNumber(),
			],
			latLong: [
				ServiceHelper.generateRandomNumber(),
				ServiceHelper.generateRandomNumber(),
			],
		},
	],
	angleFromNorth: 123,
	defaultView: ServiceHelper.generateUUIDString(),
	defaultLegend: ServiceHelper.generateUUIDString(),
});

ServiceHelper.generateGroup = (account, model, isSmart = false, isIfcGuids = false, serialised = true) => {
	const genId = () => (serialised ? ServiceHelper.generateUUIDString() : generateUUID());
	const group = {
		_id: genId(),
		name: ServiceHelper.generateRandomString(),
		color: [1, 1, 1],
		createdAt: Date.now(),
		updatedAt: Date.now(),
		updatedBy: ServiceHelper.generateRandomString(),
		author: ServiceHelper.generateRandomString(),
	};

	if (isSmart) {
		group.rules = [
			{
				field: 'IFC GUID',
				operator: 'IS',
				values: [
					'1rbbJcnUDEEA_ArpSqk3B7',
				],
			},
		];
	} else {
		group.objects = [{
			account, model,
		}];

		if (isIfcGuids) {
			group.objects[0].ifc_guids = [
				ServiceHelper.generateRandomString(22),
				ServiceHelper.generateRandomString(22),
				ServiceHelper.generateRandomString(22),
			];
		} else {
			group.objects[0].shared_ids = [genId(), genId(), genId()];
		}
	}

	return group;
};

ServiceHelper.app = () => createApp().listen(8080);

ServiceHelper.closeApp = async (server) => {
	await DbHandler.disconnect();
	if (server) await server.close();
};

module.exports = ServiceHelper;
