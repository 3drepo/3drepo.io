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
const http = require('http');
const fs = require('fs');
const { times } = require('lodash');

const SessionTracker = require('./sessionTracker');

const { image, src, srcV4 } = require('./path');

const { createAppAsync: createServer } = require(`${srcV4}/services/api`);
const { createApp: createFrontend } = require(`${srcV4}/services/frontend`);
const { io: ioClient } = require('socket.io-client');

const { providers } = require(`${src}/services/sso/sso.constants`);

const { EVENTS, ACTIONS } = require(`${src}/services/chat/chat.constants`);
const DbHandler = require(`${src}/handler/db`);
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { INTERNAL_DB } = require(`${src}/handler/db.constants`);
const QueueHandler = require(`${src}/handler/queue`);
const config = require(`${src}/utils/config`);
const { editSubscriptions, grantAdminToUser, updateAddOns } = require(`${src}/models/teamspaceSettings`);
const { initTeamspace } = require(`${src}/processors/teamspaces`);
const { generateUUID, UUIDToString, stringToUUID } = require(`${src}/utils/helper/uuids`);
const { MODEL_COMMENTER, MODEL_VIEWER, PROJECT_ADMIN } = require(`${src}/utils/permissions/permissions.constants`);
const { deleteIfUndefined } = require(`${src}/utils/helper/objects`);
const { isArray } = require(`${src}/utils/helper/typeCheck`);
const FilesManager = require(`${src}/services/filesManager`);
const { modelTypes, statusCodes } = require(`${src}/models/modelSettings.constants`);
const { actions: actionTypes } = require(`${src}/models/teamspaces.audits.constants`);

const { statusTypes } = require(`${src}/schemas/tickets/templates.constants`);
const { generateFullSchema } = require(`${src}/schemas/tickets/templates`);

const { fieldOperators, valueOperators } = require(`${src}/models/metadata.rules.constants`);

const { USERS_DB_NAME, USERS_COL, AVATARS_COL_NAME } = require(`${src}/models/users.constants`);
const { COL_NAME } = require(`${src}/models/projectSettings.constants`);
const { propTypes, presetModules } = require(`${src}/schemas/tickets/templates.constants`);

const db = {};
const queue = {};
const ServiceHelper = { db, queue, socket: {} };

queue.purgeQueues = async () => {
	const { host, worker_queue, model_queue, callback_queue } = config.cn_queue;
	const conn = await amqp.connect(host);

	const purgeQueue = async (queueName) => {
		try {
			const channel = await conn.createChannel();
			channel.on('error', () => { });
			await channel.purgeQueue(queueName);
			await channel.close();
		} catch (err) {
			// Skip channels that don't exists
			// No need to raise an error since channels that
			// don't exist can be considered cleaned up already.
		}
	};

	await Promise.all([
		purgeQueue(worker_queue),
		purgeQueue(model_queue),
		purgeQueue(callback_queue),
	]);

	await conn.close();
};

db.reset = async () => {
	const dbs = await DbHandler.listDatabases(true);
	const protectedDB = [USERS_DB_NAME, 'local'];
	const dbProms = dbs.map(({ name }) => {
		if (!protectedDB.includes(name)) {
			return DbHandler.dropDatabase(name);
		}
		return Promise.resolve();
	});

	const cols = await DbHandler.listCollections(USERS_DB_NAME);

	const colProms = cols.map(({ name }) => (name === 'system.version' ? Promise.resolve() : DbHandler.deleteMany(USERS_DB_NAME, name, {})));

	await Promise.all([...dbProms, ...colProms]);
	await DbHandler.disconnect();
};

db.addSSO = async (user, id = ServiceHelper.generateRandomString()) => {
	await DbHandler.updateOne(USERS_DB_NAME, USERS_COL, { user }, { $set: { 'customData.sso': { type: providers.AAD, id } } });
};

// userCredentials should be the same format as the return value of generateUserCredentials
db.createUser = (userCredentials, tsList = [], customData = {}) => {
	const { user, password, apiKey, basicData = {} } = userCredentials;
	const roles = tsList.map((ts) => ({ db: ts, role: 'team_member' }));
	return DbHandler.createUser(user, password, {
		billing: { billingInfo: {} },
		userId: user,
		...basicData,
		...customData,
		apiKey,
	}, roles);
};

db.createTeamspace = async (teamspace, admins = [], subscriptions, createUser = true, addOns) => {
	if (createUser) await ServiceHelper.db.createUser({ user: teamspace, password: teamspace });
	else if (admins.length === 0) {
		throw Error('an admin needs to be provided, or createUser needs to be set to true.');
	}
	const firstAdmin = createUser ? teamspace : admins[0];
	const accountId = await initTeamspace(teamspace, firstAdmin);
	await Promise.all(admins.map((adminUser) => (firstAdmin !== adminUser
		? grantAdminToUser(teamspace, adminUser) : Promise.resolve())));

	if (subscriptions) {
		await Promise.all(Object.keys(subscriptions).map((subType) => editSubscriptions(teamspace,
			subType, subscriptions[subType])));
	}

	if (Object.keys(addOns ?? {}).length) {
		await updateAddOns(teamspace, addOns);
	}

	return accountId;
};

db.createProject = (teamspace, _id, name, models = [], admins = []) => {
	const project = {
		_id: stringToUUID(_id),
		createdAt: new Date(),
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

db.createRevision = async (teamspace, project, model, revision, modelType) => {
	const historyCol = modelType === modelTypes.DRAWING ? `${modelType}s.history` : `${model}.history`;
	const writeReferencedData = (id, buffer) => FilesManager.storeFile(teamspace,
		historyCol, id, buffer);

	if (revision.rFile) {
		writeReferencedData(revision.rFile[0], revision.refData);
	}

	if (revision.image) {
		writeReferencedData(revision.image, revision.imageData);
	}

	if (revision.thumbnail) {
		writeReferencedData(revision.thumbnail, revision.thumbnailData);
	}
	const formattedRevision = {
		...revision,
		_id: stringToUUID(revision._id),
		...(modelType === modelTypes.DRAWING ? { project: stringToUUID(project), model } : {}),
	};

	delete formattedRevision.refData;
	delete formattedRevision.imageData;
	delete formattedRevision.thumbnailData;
	await DbHandler.insertOne(teamspace, historyCol, formattedRevision);
};

db.createCalibration = async (teamspace, project, drawing, revision, calibration) => {
	const formattedCalibration = deleteIfUndefined({
		...calibration,
		_id: stringToUUID(calibration._id),
		project: stringToUUID(project),
		drawing,
		rev_id: stringToUUID(revision),
		verticalRange: undefined,
	});

	await DbHandler.insertOne(teamspace, 'drawings.calibrations', formattedCalibration);
};

db.createAuditAction = (teamspace, action) => {
	const formattedAction = {
		_id: stringToUUID(action._id),
		...action,
	};

	return DbHandler.insertOne(teamspace, 'auditing', formattedAction);
};

db.createSequence = async (teamspace, model, { sequence, states, activities, activityTree }) => {
	const seqCol = `${model}.sequences`;
	const actCol = `${model}.activities`;

	await Promise.all([
		DbHandler.insertOne(teamspace, seqCol, sequence),
		DbHandler.insertMany(teamspace, actCol, activities),
		states.map(({ id, buffer }) => FilesManager.storeFile(teamspace, seqCol, id, buffer)),
		FilesManager.storeFile(teamspace, actCol, UUIDToString(sequence._id), activityTree),
	]);
};

db.createLegacyGroups = (teamspace, modelId, groups = []) => {
	const toInsert = groups.map((entry) => {
		const converted = {
			...entry,
			_id: stringToUUID(entry._id),
		};

		if ((entry.objects || []).length) {
			converted.objects = entry.objects.map((objectEntry) => {
				const convertedObj = { ...objectEntry };
				if (objectEntry.shared_ids) {
					convertedObj.shared_ids = objectEntry.shared_ids.map(UUIDToString);
				}
				return convertedObj;
			});
		}

		return converted;
	});

	return DbHandler.insertMany(teamspace, `${modelId}.groups`, toInsert);
};

db.createTemplates = (teamspace, data = []) => {
	const toInsert = data.map((entry) => {
		const converted = {
			...entry,
			_id: stringToUUID(entry._id),
		};
		return converted;
	});

	return DbHandler.insertMany(teamspace, 'templates', toInsert);
};

db.createTicket = (teamspace, project, model, ticket) => {
	const formattedTicket = {
		...ticket,
		_id: stringToUUID(ticket._id),
		type: stringToUUID(ticket.type),
		project: stringToUUID(project),
		teamspace,
		model,
	};
	return DbHandler.insertOne(teamspace, 'tickets', formattedTicket);
};

db.createComment = (teamspace, project, model, ticket, comment) => {
	const formattedComment = {
		...comment,
		_id: stringToUUID(comment._id),
		project: stringToUUID(project),
		ticket: stringToUUID(ticket),
		teamspace,
		model,
	};

	return DbHandler.insertOne(teamspace, 'tickets.comments', formattedComment);
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

db.createMetadata = (teamspace, modelId, metadataId, metadata) => DbHandler.insertOne(teamspace, `${modelId}.scene`,
	{ _id: stringToUUID(metadataId), type: 'meta', metadata });

const createImage = async (dbName, colName, type, imageId, imageData) => {
	const { defaultStorage } = config;
	config.defaultStorage = type;
	await FilesManager.storeFile(dbName, colName, imageId, imageData);
	config.defaultStorage = defaultStorage;
};

db.createAvatar = (username, type, avatarData) => createImage(USERS_DB_NAME, AVATARS_COL_NAME,
	type, username, avatarData);

db.createProjectImage = (teamspace, project, type, imageData) => createImage(teamspace, COL_NAME,
	type, project, imageData);

db.addLoginRecords = async (records) => {
	await DbHandler.insertMany(INTERNAL_DB, 'loginRecords', records);
};

db.createScene = (teamspace, project, modelId, rev, nodes, meshMap) => Promise.all([
	db.createRevision(teamspace, project, modelId, rev),
	DbHandler.insertMany(teamspace, `${modelId}.scene`, nodes),
	FilesManager.storeFile(teamspace, `${modelId}.stash.json_mpc`, `${UUIDToString(rev._id)}/idToMeshes.json`, JSON.stringify(meshMap)),

]);
ServiceHelper.createQueryString = (options) => {
	const keys = Object.keys(deleteIfUndefined(options, true));

	if (keys.length) {
		const optionsArr = keys.map((key) => `${key}=${options[key]}`);
		return `?${optionsArr.join('&')}`;
	}

	return '';
};
ServiceHelper.sleepMS = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
ServiceHelper.fileExists = (filePath) => {
	let flag = true;
	try {
		fs.accessSync(filePath, fs.constants.F_OK);
	} catch (e) {
		flag = false;
	}
	return flag;
};

ServiceHelper.outOfOrderArrayEqual = (arr1, arr2) => {
	expect(arr1.length).toEqual(arr2.length);
	expect(arr1).toEqual(expect.arrayContaining(arr2));
};

ServiceHelper.generateUUIDString = () => UUIDToString(generateUUID());
ServiceHelper.generateUUID = () => generateUUID();
ServiceHelper.generateRandomString = (length = 20) => Crypto.randomBytes(Math.ceil(length / 2.0)).toString('hex').substring(0, length);
ServiceHelper.generateRandomBuffer = (length = 20) => Buffer.from(ServiceHelper.generateRandomString(length));
ServiceHelper.generateRandomDate = (start = new Date(2018, 1, 1), end = new Date()) => new Date(start.getTime()
	+ Math.random() * (end.getTime() - start.getTime()));
ServiceHelper.generateRandomNumber = (min = -1000, max = 1000) => Math.random() * (max - min) + min;
ServiceHelper.generateRandomBoolean = () => Math.random() < 0.5;
ServiceHelper.generateRandomIfcGuid = () => ServiceHelper.generateRandomString(22);
ServiceHelper.generateRandomRvtId = () => Math.floor(Math.random() * 10000);

ServiceHelper.generateRandomURL = () => `http://${ServiceHelper.generateRandomString()}.com/`;

ServiceHelper.generateCustomStatusValues = () => Object.values(statusTypes).map((type) => ({
	name: ServiceHelper.generateRandomString(15),
	type,
}));

ServiceHelper.generateSequenceEntry = (rid) => {
	const startDate = ServiceHelper.generateRandomDate();
	const endDate = ServiceHelper.generateRandomDate(startDate);

	const sequence = {
		_id: generateUUID(),
		rev_id: rid,
		name: ServiceHelper.generateRandomString(),
		startDate,
		endDate,
		frames: [
			{
				dateTime: startDate,
				state: ServiceHelper.generateUUIDString(),
			},
			{
				dateTime: startDate,
				state: ServiceHelper.generateUUIDString(),
			},
		],
	};

	const generateDate = () => ServiceHelper.generateRandomDate(startDate, endDate);
	const states = sequence.frames.map(({ state }) => ({
		id: state,
		buffer: Buffer.from(ServiceHelper.generateRandomString(), 'utf-8'),
	}));

	const activities = times(5, () => ({
		_id: generateUUID(),
		name: ServiceHelper.generateRandomString(),
		startDate: generateDate(),
		endDate: generateDate(),
		sequenceId: sequence._id,
		data: times(3, () => ({

			key: ServiceHelper.generateRandomString(),
			value: ServiceHelper.generateRandomString(),
		})),

	}));

	const activityTree = Buffer.from(ServiceHelper.generateRandomString(), 'utf-8');

	return { sequence, states, activities, activityTree };
};

ServiceHelper.generateUserCredentials = () => ({
	user: ServiceHelper.generateRandomString(),
	password: ServiceHelper.generateRandomString(),
	apiKey: ServiceHelper.generateRandomString(),
	basicData: {
		firstName: ServiceHelper.generateRandomString(),
		lastName: ServiceHelper.generateRandomString(),
		email: `${ServiceHelper.generateRandomString()}@${ServiceHelper.generateRandomString(6)}.com`,
		billing: {
			billingInfo: {
				company: ServiceHelper.generateRandomString(),
				countryCode: 'GB',
			},
		},
	},
});

ServiceHelper.determineTestGroup = (path) => {
	const match = path.match(/^.*[/|\\](e2e|unit|drivers|scripts)[/|\\](.*).test.js$/);
	if (match?.length === 3) {
		return `${match[1].toUpperCase()} ${match[2]}`;
	}
	return path;
};

ServiceHelper.generateRandomProject = (projectAdmins = []) => ({
	id: ServiceHelper.generateUUIDString(),
	name: ServiceHelper.generateRandomString(),
	permissions: projectAdmins.map(({ user }) => ({ user, permissions: ['admin_project'] })),
});

ServiceHelper.generateRandomModel = ({ modelType = modelTypes.CONTAINER, viewers, commenters,
	collaborators, properties = {} } = {}) => {
	const permissions = [];
	if (viewers?.length) {
		permissions.push(...viewers.map((user) => ({ user, permission: 'viewer' })));
	}

	if (commenters?.length) {
		permissions.push(...commenters.map((user) => ({ user, permission: 'commenter' })));
	}

	if (collaborators?.length) {
		permissions.push(...collaborators.map((user) => ({ user, permission: 'collaborator' })));
	}

	return {
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		properties: {
			...ServiceHelper.generateRandomModelProperties(modelType),
			...properties,
			permissions,
		},
	};
};

ServiceHelper.generateRevisionEntry = (isVoid = false, hasFile = true, modelType, timestamp, status) => {
	const _id = ServiceHelper.generateUUIDString();
	const entry = deleteIfUndefined({
		_id,
		tag: modelType === modelTypes.DRAWING ? undefined : ServiceHelper.generateRandomString(),
		status,
		statusCode: modelType === modelTypes.DRAWING ? statusCodes[0].code : undefined,
		revCode: modelType === modelTypes.DRAWING ? ServiceHelper.generateRandomString(10) : undefined,
		format: modelType === modelTypes.DRAWING ? '.pdf' : undefined,
		author: ServiceHelper.generateRandomString(),
		timestamp: timestamp || ServiceHelper.generateRandomDate(),
		desc: ServiceHelper.generateRandomString(),
		void: !!isVoid,
	});

	if (hasFile) {
		entry.rFile = modelType === modelTypes.DRAWING ? [ServiceHelper.generateUUIDString()] : [`${_id}_${ServiceHelper.generateRandomString()}_ifc`];
		entry.refData = ServiceHelper.generateRandomString();

		if (modelType === modelTypes.DRAWING) {
			entry.image = ServiceHelper.generateUUIDString();
			entry.thumbnail = ServiceHelper.generateUUIDString();

			entry.imageData = ServiceHelper.generateRandomString();
			entry.thumbnailData = ServiceHelper.generateRandomString();
		}
	}

	return entry;
};

ServiceHelper.generateCalibration = () => ({
	_id: ServiceHelper.generateUUIDString(),
	horizontal: {
		model: times(2, () => times(3, () => ServiceHelper.generateRandomNumber())),
		drawing: times(2, () => times(2, () => ServiceHelper.generateRandomNumber())),
	},
	verticalRange: [0, 10],
	units: 'mm',
	createdAt: ServiceHelper.generateRandomDate(),
	createdBy: ServiceHelper.generateRandomString(),
});

ServiceHelper.generateRandomModelProperties = (modelType = modelTypes.CONTAINER) => ({
	desc: ServiceHelper.generateRandomString(),
	...(modelType === modelTypes.DRAWING ? {
		number: ServiceHelper.generateRandomString(),
		type: ServiceHelper.generateRandomString(),
		calibration: { verticalRange: [ServiceHelper.generateRandomNumber(0, 10), ServiceHelper.generateRandomNumber(11, 20)], units: 'm' },
		modelType,
	} : {
		properties: {
			code: ServiceHelper.generateRandomString(),
			unit: 'm',
		},
		...(modelType === modelTypes.FEDERATION ? { federate: true } : { type: ServiceHelper.generateRandomString() }),
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
	}),
});

ServiceHelper.generateTemplate = (deprecated, hasView = false, configOptions = {}) => ({
	_id: ServiceHelper.generateUUIDString(),
	code: ServiceHelper.generateRandomString(3),
	name: ServiceHelper.generateRandomString(),
	config: configOptions,
	properties: [
		{
			name: ServiceHelper.generateRandomString(),
			type: propTypes.DATE,
			required: true,
		},
		{
			name: ServiceHelper.generateRandomString(),
			type: propTypes.TEXT,
			deprecated: true,
		},
		{
			name: ServiceHelper.generateRandomString(),
			type: propTypes.NUMBER,
			default: ServiceHelper.generateRandomNumber(),
		},
		...(hasView ? [{
			name: ServiceHelper.generateRandomString(),
			type: propTypes.VIEW,
		}] : []),
	],
	modules: [
		{
			type: presetModules.SHAPES,
			deprecated: true,
			properties: [],
		},
		{
			name: ServiceHelper.generateRandomString(),
			properties: [
				{
					name: ServiceHelper.generateRandomString(),
					type: propTypes.TEXT,
				},
				{
					name: ServiceHelper.generateRandomString(),
					type: propTypes.NUMBER,
					default: ServiceHelper.generateRandomNumber(),
					deprecated: true,
				},
				{
					name: ServiceHelper.generateRandomString(),
					type: propTypes.NUMBER,
					default: ServiceHelper.generateRandomNumber(),
				},
				...(hasView ? [{
					name: ServiceHelper.generateRandomString(),
					type: propTypes.VIEW,
					default: ServiceHelper.generateRandomNumber(),
				}] : []),
			],
		},
	],
	...deleteIfUndefined({ deprecated }),
});

const generateProperties = (propTemplate, internalType, container) => {
	const properties = {};

	propTemplate.forEach(({ name, deprecated, readOnly, type, values }) => {
		if (deprecated || readOnly) return;
		if (type === propTypes.TEXT) {
			properties[name] = ServiceHelper.generateRandomString();
		} if (type === propTypes.LONG_TEXT) {
			properties[name] = ServiceHelper.generateRandomString();
		} else if (type === propTypes.DATE) {
			properties[name] = internalType ? new Date() : Date.now();
		} else if (type === propTypes.NUMBER) {
			properties[name] = ServiceHelper.generateRandomNumber();
		} else if (type === propTypes.BOOLEAN) {
			properties[name] = ServiceHelper.generateRandomBoolean();
		} else if (type === propTypes.ONE_OF && isArray(values)) {
			properties[name] = values[values.length - 1];
		} else if (type === propTypes.MANY_OF && isArray(values)) {
			properties[name] = values;
		} else if (type === propTypes.COORDS) {
			properties[name] = [0, 0, 0];
		} else if (type === propTypes.VIEW) {
			properties[name] = {
				camera: {
					position: [0, 0, 0],
					forward: [0, 0, 0],
					up: [0, 0, 0],
				},
				state: {
					hidden: [
						{ group: ServiceHelper.generateGroup(true, { serialised: true, hasId: false }) },
						{ group: ServiceHelper.generateGroup(false, { serialised: true, hasId: false, container }) },
					],
				},
			};
		}
	});

	return properties;
};

ServiceHelper.generateAuditAction = (actionType) => {
	const actionData = {
		[actionTypes.USER_ADDED]: { user: ServiceHelper.generateRandomString() },
		[actionTypes.USER_REMOVED]: { user: ServiceHelper.generateRandomString() },
		[actionTypes.INVITATION_ADDED]: {
			email: ServiceHelper.generateRandomString(),
			job: ServiceHelper.generateRandomString(),
			permissions: { teamspace_admin: true },
		},
		[actionTypes.INVITATION_REVOKED]: {
			email: ServiceHelper.generateRandomString(),
			job: ServiceHelper.generateRandomString(),
			permissions: { teamspace_admin: true },
		},
		[actionTypes.PERMISSIONS_UPDATED]: { users: [ServiceHelper.generateRandomString()],
			permissions: [{
				model: ServiceHelper.generateUUID(),
				project: ServiceHelper.generateUUID(),
				from: [MODEL_COMMENTER],
				to: [MODEL_VIEWER],
			}] },
	};

	return {
		_id: ServiceHelper.generateUUIDString(),
		action: actionType,
		executor: ServiceHelper.generateRandomString(),
		timestamp: ServiceHelper.generateRandomDate(),
		data: actionData[actionType],
	};
};

ServiceHelper.generateRandomObject = () => ({
	[ServiceHelper.generateRandomString()]: ServiceHelper.generateRandomString(),
	[ServiceHelper.generateRandomString()]: ServiceHelper.generateRandomString(),
	[ServiceHelper.generateRandomString()]: ServiceHelper.generateRandomString(),
	[ServiceHelper.generateRandomString()]: ServiceHelper.generateRandomString(),
});

ServiceHelper.generateTicket = (template, internalType = false, container) => {
	const fullTemplate = generateFullSchema(template) ?? template;
	const modules = {};
	(fullTemplate?.modules || []).forEach(({ name, type, deprecated, properties }) => {
		if (deprecated) return;
		const id = name ?? type;
		modules[id] = generateProperties(properties, internalType, container);
	});

	const ticket = {
		_id: ServiceHelper.generateUUIDString(),
		type: fullTemplate._id,
		title: ServiceHelper.generateRandomString(),
		properties: generateProperties(fullTemplate.properties, internalType, container),
		modules,
	};

	return ticket;
};

ServiceHelper.generateImportedComment = (author = ServiceHelper.generateRandomString()) => ({
	...ServiceHelper.generateComment(author),
	originalAuthor: ServiceHelper.generateRandomString(),
});

ServiceHelper.generateComment = (author = ServiceHelper.generateRandomString()) => {
	const base64img = fs.readFileSync(image).toString('base64');

	return {
		_id: ServiceHelper.generateUUIDString(),
		createdAt: ServiceHelper.generateRandomDate(),
		updatedAt: ServiceHelper.generateRandomDate(),
		message: ServiceHelper.generateRandomString(),
		images: [base64img],
		author,
	};
};

// This generates groups for v5 schema (used for tickets), use generateLegacyGroup if you need v4 compatible groups
ServiceHelper.generateGroup = (isSmart = false, {
	serialised = false,
	hasId = true,
	container = ServiceHelper.generateUUIDString(),
	nObjects = 3,
} = {}) => {
	const genId = () => (serialised ? ServiceHelper.generateUUIDString() : generateUUID());
	const group = deleteIfUndefined({
		_id: hasId ? genId() : undefined,
		name: ServiceHelper.generateRandomString(),
	});

	if (isSmart) {
		group.rules = [
			{
				name: ServiceHelper.generateRandomString(),
				field: { operator: fieldOperators.CONTAINS.name, values: [ServiceHelper.generateRandomString()] },
				operator: valueOperators.IS.name,
				values: [
					ServiceHelper.generateRandomString(),
				],
			},
			{
				name: ServiceHelper.generateRandomString(),
				field: { operator: fieldOperators.IS.name, values: [ServiceHelper.generateRandomString()] },
				operator: valueOperators.IS.name,
				values: [
					ServiceHelper.generateRandomString(),
				],
			},
		];
	} else {
		group.objects = [{
			container,
			_ids: times(nObjects, genId),
		}];
	}

	return group;
};

ServiceHelper.createGroupWithRule = (rule) => {
	const group = ServiceHelper.generateGroup(true, { serialised: true, hasId: false });
	return { ...group, rules: [rule] };
};

// This generates groups with v4 schema. use generateGroup for v5 (tickets) schema
ServiceHelper.generateLegacyGroup = (account, model, isSmart = false, isIfcGuids = false, serialised = true) => {
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
				name: ServiceHelper.generateRandomString(),
				field: { operator: fieldOperators.IS.name, values: ['IFC GUID'] },
				operator: valueOperators.IS.name,
				values: [
					ServiceHelper.generateRandomString(),
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

ServiceHelper.generateView = (account, model, hasThumbnail = true) => ({
	_id: ServiceHelper.generateUUIDString(),
	name: ServiceHelper.generateRandomString(),
	...(hasThumbnail ? { thumbnail: ServiceHelper.generateRandomBuffer() } : {}),
});

ServiceHelper.app = async () => (await createServer()).listen(8080);

ServiceHelper.frontend = () => createFrontend().listen(8080);

ServiceHelper.chatApp = () => {
	const server = http.createServer();
	const chatConfig = config.servers.find(({ service }) => service === 'chat');
	server.listen(chatConfig.port, config.hostname);

	// doing a local import as this includes the session service which doesn't clean itself up properly
	// eslint-disable-next-line global-require
	const ChatService = require(`${src}/services/chat`);
	return ChatService.createApp(server);
};

ServiceHelper.loginAndGetCookie = async (agent, user, options) => {
	const session = SessionTracker(agent);
	await session.login(user, options);
	return session.getCookies();
};

ServiceHelper.socket.connectToSocket = (session) => new Promise((resolve, reject) => {
	const { port } = config.servers.find(({ service }) => service === 'chat');
	const socket = ioClient(`http://${config.host}:${port}`,
		{
			path: '/chat',
			transports: ['websocket'],
			reconnection: true,
			reconnectionDelay: 500,
			...(session ? { extraHeaders: { Cookie: `connect.sid=${session}` } } : {}),
		});
	socket.on('connect', () => resolve(socket));
	socket.on('connect_error', reject);
});

ServiceHelper.socket.loginAndGetSocket = async (agent, user, password) => {
	const { session: cookie } = await ServiceHelper.loginAndGetCookie(agent, user, password);
	return ServiceHelper.socket.connectToSocket(cookie);
};

ServiceHelper.socket.joinRoom = (socket, data) => new Promise((resolve, reject) => {
	socket.on(EVENTS.MESSAGE, (msg) => {
		expect(msg).toEqual(expect.objectContaining(
			{ event: EVENTS.SUCCESS, data: { action: ACTIONS.JOIN, data } },
		));
		socket.off(EVENTS.MESSAGE);
		socket.off(EVENTS.ERROR);
		resolve();
	});

	socket.on(EVENTS.ERROR, () => {
		socket.off(EVENTS.MESSAGE);
		socket.off(EVENTS.ERROR);
		reject();
	});
	socket.emit('join', data);
});

ServiceHelper.closeApp = async (server) => {
	await queue.purgeQueues();
	if (server) await server.close();
	await db.reset();
	EventsManager.reset();
	QueueHandler.close();
};

ServiceHelper.resetFileshare = () => {
	const fsDir = config.fs.path;
	fs.rmSync(fsDir, { recursive: true });
	fs.mkdirSync(fsDir);
};

ServiceHelper.resetSharedDir = () => {
	const fsDir = config.cn_queue.shared_storage;
	fs.rmSync(fsDir, { recursive: true });
	fs.mkdirSync(fsDir);
};

ServiceHelper.generateBasicNode = (type, rev_id, parents, additionalData = {}) => deleteIfUndefined({
	_id: generateUUID(),
	shared_id: generateUUID(),
	rev_id: stringToUUID(rev_id),
	type,
	parents,
	...additionalData,
});

module.exports = ServiceHelper;
