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

const amqp = require('amqplib');
const http = require('http');
const fs = require('fs');

const DataGen = require('./dataGen');
const DataGenClashes = require('./dataGen.clashes');
const DataGenTickets = require('./dataGen.tickets');
const SessionTracker = require('./sessionTracker');

const { image, src, srcV4 } = require('./path');

const { createAppAsync: createServer } = require(`${srcV4}/services/api`);
const { createApp: createFrontend } = require(`${srcV4}/services/frontend`);
const { io: ioClient } = require('socket.io-client');

const { stopPurge } = require(`${src}/models/frontegg.cache`);
const { tmpdir } = require('os');

const path = require('path');
const { PassThrough } = require('stream');

const { isString } = require(`${src}/utils/helper/typeCheck`);

const { BYPASS_AUTH } = require(`${src}/utils/config.constants`);
const { CLASH_PLANS_COL, CLASH_RUNS_COL } = require(`${src}/models/clashes.constants`);
const { EVENTS, ACTIONS } = require(`${src}/services/chat/chat.constants`);
const DbHandler = require(`${src}/handler/db`);
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { INTERNAL_DB } = require(`${src}/handler/db.constants`);
const QueueHandler = require(`${src}/handler/queue`);
const config = require(`${src}/utils/config`);
const { FileStorageTypes } = require(`${src}/utils/config.constants`);
const { editSubscriptions, grantAdminToUser, updateAddOns } = require(`${src}/models/teamspaceSettings`);
const { initTeamspace, addTeamspaceMember } = require(`${src}/processors/teamspaces`);
const { UUIDToString, stringToUUID } = require(`${src}/utils/helper/uuids`);
const { PROJECT_ADMIN } = require(`${src}/utils/permissions/permissions.constants`);
const { deleteIfUndefined } = require(`${src}/utils/helper/objects`);
const FilesManager = require(`${src}/services/filesManager`);
const { modelTypes } = require(`${src}/models/modelSettings.constants`);

const { USERS_DB_NAME, AVATARS_COL_NAME } = require(`${src}/models/users.constants`);
const { COL_NAME } = require(`${src}/models/projectSettings.constants`);

const db = {};
const queue = {};
const ServiceHelper = { db, queue, socket: {} };
Object.assign(ServiceHelper, DataGen);
Object.assign(ServiceHelper, DataGenTickets, DataGenClashes);

queue.purgeQueues = async () => {
	const { host, model_queue, clash_queue, callback_queue } = config.cn_queue;
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
		purgeQueue(model_queue),
		purgeQueue(clash_queue),
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

// userCredentials should be the same format as the return value of generateUserCredentials
db.createUser = async (userCredentials, tsList = [], customData = {}) => {
	const { user, password, apiKey, basicData = {} } = userCredentials;

	await DbHandler.createUser(user, password, {
		billing: { billingInfo: {} },
		...basicData,
		...customData,
		apiKey,
	}, []);

	await Promise.all(tsList.map((ts) => addTeamspaceMember(ts, user)));
};

db.createTeamspace = async (teamspace, admins = [], subscriptions, createUser = true, addOns) => {
	if (createUser) {
		await ServiceHelper.db.createUser({
			...ServiceHelper.generateUserCredentials(),
			user: teamspace,
			password: teamspace });
	}
	const firstAdmin = createUser ? teamspace : admins[0];
	const accountId = await initTeamspace(teamspace, firstAdmin);
	await Promise.all(admins.map(async (adminUser) => {
		if (firstAdmin !== adminUser) {
			await addTeamspaceMember(teamspace, adminUser);
			await grantAdminToUser(teamspace, adminUser);
		}
	}));

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
		await writeReferencedData(revision.rFile[0], revision.refData);
	}

	if (revision.image) {
		await writeReferencedData(revision.image, revision.imageData);
	}

	if (revision.thumbnail) {
		await writeReferencedData(revision.thumbnail, revision.thumbnailData);
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

db.createMetadata = (teamspace, modelId, metadataId, metadata, revId) => DbHandler.insertOne(teamspace, `${modelId}.scene`,
	{ _id: stringToUUID(metadataId), type: 'meta', metadata, rev_id: stringToUUID(revId) });

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

db.createClashPlans = async (teamspace, project, plans) => {
	const formattedPlans = plans.map((plan) => {
		if (plan.tickets) {
			// eslint-disable-next-line no-param-reassign
			plan.tickets.template = stringToUUID(plan.tickets.template);
		}

		return ({
			...plan,
			_id: stringToUUID(plan._id),
			project: stringToUUID(project),
		});
	});
	await DbHandler.insertMany(teamspace, CLASH_PLANS_COL, formattedPlans);
};

db.createClashRuns = async (teamspace, project, plan, runs) => {
	const formattedProject = isString(project) ? stringToUUID(project) : project;
	const formattedRuns = runs.map(({ clashResults, triggeredAt, updatedAt, plan: runPlan, ...run }) => {
		const planToStore = runPlan ?? plan;
		return deleteIfUndefined({
			...run,
			_id: stringToUUID(run._id),
			project: formattedProject,
			triggeredAt: new Date(triggeredAt),
			updatedAt: new Date(updatedAt ?? triggeredAt),
			plan: planToStore ? { ...planToStore, _id: stringToUUID(planToStore._id) } : undefined,
		});
	});

	await Promise.all(runs.map(({ _id, clashResults }) => (clashResults
		? FilesManager.storeFile(teamspace, CLASH_RUNS_COL, stringToUUID(_id),
			Buffer.from(JSON.stringify(clashResults)))
		: Promise.resolve())));

	await DbHandler.insertMany(teamspace, CLASH_RUNS_COL, formattedRuns);
};

db.addLoginRecords = async (records) => {
	await DbHandler.insertMany(INTERNAL_DB, 'loginRecords', records);
};

const addNodes = async (teamspace, modelId, nodes) => {
	const arrTypes = {
		vertices: Float32Array,
		faces: Uint32Array,
		normals: Float32Array,
		data: Uint8Array,
	};
	const collection = `${modelId}.scene`;

	const processedNodes = await Promise.all(nodes.map(async (node) => {
		const { blobData, ...nodeData } = node;
		if (blobData) {
			const stream = new PassThrough();
			const elementInfo = {};
			let offset = 0;
			Object.keys(blobData).forEach((key) => {
				const data = blobData[key];
				const Type = arrTypes[key];
				const typed = new Type(data);

				const buffer = isString(data) ? Buffer.from(data) : Buffer.from(
					typed.buffer,
					typed.byteOffset,
					typed.byteLength,
				);
				stream.write(buffer);
				const start = offset;
				const size = buffer.byteLength;

				elementInfo[key] = {
					start, size,
				};
				offset = start + size;
			});

			stream.end();
			const name = ServiceHelper.generateUUIDString();
			// eslint-disable-next-line no-underscore-dangle
			nodeData._blobRef = { elements: elementInfo, buffer: { start: 0, size: offset, name } };

			await FilesManager.storeFileStream(teamspace, collection, name, stream);
		}

		return nodeData;
	}));

	await DbHandler.insertMany(teamspace, collection, processedNodes);
};

db.createScene = (teamspace, project, modelId, rev, nodes, meshMap) => Promise.all([
	addNodes(teamspace, modelId, nodes),
	...(meshMap ? [FilesManager.storeFile(teamspace, `${modelId}.stash.json_mpc`, `${UUIDToString(rev._id)}/idToMeshes.json`, JSON.stringify(meshMap))] : []),
]);

db.addJSONFile = (teamspace, modelId, name, content) => FilesManager.storeFile(teamspace, `${modelId}.stash.json_mpc`, name, content);
ServiceHelper.createTmpDir = () => {
	const tmpDir = tmpdir();
	const folder = ServiceHelper.generateUUIDString();
	const fullPath = path.posix.join(tmpDir, folder);
	fs.mkdirSync(fullPath, { recursive: true });

	return fullPath;
};

ServiceHelper.createQueryString = (options) => {
	const keys = Object.keys(deleteIfUndefined(options, true));

	if (keys.length) {
		const optionsArr = keys.map((key) => `${key}=${options[key]}`);
		return `?${optionsArr.join('&')}`;
	}

	return '';
};
ServiceHelper.fileExists = (filePath) => {
	let flag = true;
	try {
		fs.accessSync(filePath, fs.constants.F_OK);
	} catch (e) {
		flag = false;
	}
	return flag;
};

ServiceHelper.generateImportedComment = () => {
	const comment = ServiceHelper.generateComment();
	return {
		createdAt: comment.createdAt,
		message: comment.message,
		images: comment.images,
		originalAuthor: ServiceHelper.generateRandomString(),
	};
};

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

ServiceHelper.createGroupWithRule = (rule) => {
	const group = ServiceHelper.generateGroup(true, { serialised: true, hasId: false });
	return { ...group, rules: [rule] };
};

ServiceHelper.app = async (bypassAuth = false) => (await createServer({ [BYPASS_AUTH]: bypassAuth })).listen(8080);

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
	stopPurge();
	if (server) await server.close();
	await db.reset();
	EventsManager.reset();
	QueueHandler.close();
};

ServiceHelper.resetFileshare = () => {
	const fsDir = config[FileStorageTypes.FS].path;
	fs.rmSync(fsDir, { recursive: true });
	fs.mkdirSync(fsDir);
};

ServiceHelper.resetSharedDir = () => {
	const fsDir = config.cn_queue.shared_storage;
	fs.rmSync(fsDir, { recursive: true });
	fs.mkdirSync(fsDir);
};

module.exports = ServiceHelper;
