/**
 *  Copyright (C) 2026 3D Repo Ltd
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
const { times } = require('lodash');

const { src } = require('./path');

const { fieldOperators, valueOperators } = require(`${src}/models/metadata.rules.constants`);
const { actions: actionTypes } = require(`${src}/models/teamspaces.audits.constants`);
const { deleteIfUndefined } = require(`${src}/utils/helper/objects`);
const { generateUUID, UUIDToString, stringToUUID } = require(`${src}/utils/helper/uuids`);
const { MODEL_COMMENTER, MODEL_VIEWER } = require(`${src}/utils/permissions/permissions.constants`);
const { modelTypes, statusCodes } = require(`${src}/models/modelSettings.constants`);
const { propTypes, presetModules, statusTypes } = require(`${src}/schemas/tickets/templates.constants`);

const DataGen = {};

DataGen.generateUUIDString = () => UUIDToString(generateUUID());
DataGen.generateUUID = () => generateUUID();

// the last character is always 'a' to avoid generating a string that is compatible with Number() which gives unexpected results in some tests.
DataGen.generateRandomString = (l = 20) => (l ? `${Crypto.randomBytes(Math.ceil(l / 2)).toString('hex').slice(0, l - 1)}a` : '');
DataGen.generateRandomEmail = () => `${DataGen.generateRandomString()}@${DataGen.generateRandomString(6)}.com`;
DataGen.generateRandomBuffer = (length = 20) => Buffer.from(DataGen.generateRandomString(length));
DataGen.generateRandomDate = (start = new Date(2018, 1, 1), end = new Date()) => new Date(start.getTime()
	+ Math.random() * (end.getTime() - start.getTime()));
DataGen.generateRandomNumber = (min = -1000, max = 1000) => Math.random() * (max - min) + min;
DataGen.generateRandomBoolean = () => Math.random() < 0.5;
DataGen.generateRandomIfcGuid = () => DataGen.generateRandomString(22);
DataGen.generateRandomRvtId = () => Math.floor(Math.random() * 10000);
DataGen.generateRandomURL = () => `http://${DataGen.generateRandomString()}.com/`;

DataGen.generateRevisionEntry = (isVoid = false, hasFile = true, modelType, timestamp, status) => {
	const _id = DataGen.generateUUIDString();
	const entry = deleteIfUndefined({
		_id,
		tag: modelType === modelTypes.DRAWING ? undefined : DataGen.generateRandomString(),
		status,
		statusCode: modelType === modelTypes.DRAWING ? statusCodes[0].code : undefined,
		revCode: modelType === modelTypes.DRAWING ? DataGen.generateRandomString(10) : undefined,
		format: modelType === modelTypes.DRAWING ? '.pdf' : undefined,
		author: DataGen.generateRandomString(),
		timestamp: timestamp || DataGen.generateRandomDate(),
		desc: DataGen.generateRandomString(),
		void: !!isVoid,
	});

	if (hasFile) {
		entry.rFile = modelType === modelTypes.DRAWING
			? [DataGen.generateUUIDString()]
			: [`${_id}_${DataGen.generateRandomString()}_ifc`];
		entry.refData = DataGen.generateRandomString();

		if (modelType === modelTypes.DRAWING) {
			entry.image = DataGen.generateUUIDString();
			entry.thumbnail = DataGen.generateUUIDString();
			entry.imageData = DataGen.generateRandomString();
			entry.thumbnailData = DataGen.generateRandomString();
		}
	}

	return entry;
};

DataGen.generateGroup = (isSmart = false, {
	serialised = false,
	hasId = true,
	container = DataGen.generateUUIDString(),
	nObjects = 3,
	excludeDefinedObjects,
} = {}) => {
	const genId = () => (serialised ? DataGen.generateUUIDString() : generateUUID());
	const group = deleteIfUndefined({
		_id: hasId ? genId() : undefined,
		name: DataGen.generateRandomString(),
		excludeDefinedObjects,
	});

	if (isSmart) {
		group.rules = [
			{
				name: DataGen.generateRandomString(),
				field: { operator: fieldOperators.CONTAINS.name, values: [DataGen.generateRandomString()] },
				operator: valueOperators.IS.name,
				values: [DataGen.generateRandomString()],
			},
			{
				name: DataGen.generateRandomString(),
				field: { operator: fieldOperators.IS.name, values: [DataGen.generateRandomString()] },
				operator: valueOperators.IS.name,
				values: [DataGen.generateRandomString()],
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

DataGen.generateLegacyGroup = (account, model, isSmart = false, isIfcGuids = false, serialised = true) => {
	const genId = () => (serialised ? DataGen.generateUUIDString() : generateUUID());
	const group = {
		_id: genId(),
		name: DataGen.generateRandomString(),
		color: [1, 1, 1],
		createdAt: Date.now(),
		updatedAt: Date.now(),
		updatedBy: DataGen.generateRandomString(),
		author: DataGen.generateRandomString(),
	};

	if (isSmart) {
		group.rules = [{
			name: DataGen.generateRandomString(),
			field: { operator: fieldOperators.IS.name, values: ['IFC GUID'] },
			operator: valueOperators.IS.name,
			values: [DataGen.generateRandomString()],
		}];
	} else {
		group.objects = [{ account, model }];
		group.objects[0][isIfcGuids ? 'ifc_guids' : 'shared_ids'] = isIfcGuids
			? times(3, () => DataGen.generateRandomString(22))
			: [genId(), genId(), genId()];
	}

	return group;
};

DataGen.generateCustomStatusValues = () => Object.values(statusTypes).map((type) => ({
	name: DataGen.generateRandomString(15),
	type,
}));

DataGen.generateSequenceEntry = (rid) => {
	const startDate = DataGen.generateRandomDate();
	const endDate = DataGen.generateRandomDate(startDate);

	const sequence = {
		_id: generateUUID(),
		rev_id: rid,
		name: DataGen.generateRandomString(),
		startDate,
		endDate,
		frames: [
			{
				dateTime: startDate,
				state: DataGen.generateUUIDString(),
			},
			{
				dateTime: startDate,
				state: DataGen.generateUUIDString(),
			},
		],
	};

	const generateDate = () => DataGen.generateRandomDate(startDate, endDate);
	const states = sequence.frames.map(({ state }) => ({
		id: state,
		buffer: Buffer.from(DataGen.generateRandomString(), 'utf-8'),
	}));

	const activities = times(5, () => ({
		_id: generateUUID(),
		name: DataGen.generateRandomString(),
		startDate: generateDate(),
		endDate: generateDate(),
		sequenceId: sequence._id,
		data: times(3, () => ({

			key: DataGen.generateRandomString(),
			value: DataGen.generateRandomString(),
		})),

	}));

	const activityTree = Buffer.from(DataGen.generateRandomString(), 'utf-8');

	return { sequence, states, activities, activityTree };
};

DataGen.generateUserCredentials = () => ({
	user: DataGen.generateRandomString(),
	password: DataGen.generateRandomString(),
	apiKey: DataGen.generateRandomString(),
	basicData: {
		firstName: DataGen.generateRandomString(),
		lastName: DataGen.generateRandomString(),
		email: `${DataGen.generateRandomString()}@${DataGen.generateRandomString(6)}.com`,
		billing: {
			billingInfo: {
				company: DataGen.generateRandomString(),
				countryCode: 'GB',
			},
		},
	},
});

DataGen.generateRandomProject = (projectAdmins = []) => ({
	id: DataGen.generateUUIDString(),
	name: DataGen.generateRandomString(),
	permissions: projectAdmins.map(({ user }) => ({ user, permissions: ['admin_project'] })),
});

DataGen.generateRandomModel = ({ modelType = modelTypes.CONTAINER, viewers, commenters,
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
		_id: DataGen.generateUUIDString(),
		name: DataGen.generateRandomString(),
		properties: {
			...DataGen.generateRandomModelProperties(modelType),
			...properties,
			permissions,
		},
	};
};

DataGen.generateCalibration = () => ({
	_id: DataGen.generateUUIDString(),
	horizontal: {
		model: times(2, () => times(3, () => DataGen.generateRandomNumber())),
		drawing: times(2, () => times(2, () => DataGen.generateRandomNumber())),
	},
	verticalRange: [0, 10],
	units: 'mm',
	createdAt: DataGen.generateRandomDate(),
	createdBy: DataGen.generateRandomString(),
});

DataGen.generateRandomModelProperties = (modelType = modelTypes.CONTAINER) => ({
	desc: DataGen.generateRandomString(),
	...(modelType === modelTypes.DRAWING ? {
		number: DataGen.generateRandomString(),
		type: DataGen.generateRandomString(),
		calibration: { verticalRange: [DataGen.generateRandomNumber(0, 10), DataGen.generateRandomNumber(11, 20)], units: 'm' },
		modelType,
	} : {
		properties: {
			code: DataGen.generateRandomString(),
			unit: 'm',
		},
		...(modelType === modelTypes.FEDERATION ? { federate: true } : { type: DataGen.generateRandomString() }),
		status: 'ok',
		surveyPoints: [
			{
				position: [
					DataGen.generateRandomNumber(),
					DataGen.generateRandomNumber(),
					DataGen.generateRandomNumber(),
				],
				latLong: [
					DataGen.generateRandomNumber(),
					DataGen.generateRandomNumber(),
				],
			},
		],
		angleFromNorth: 123,
		defaultView: DataGen.generateUUIDString(),
		defaultLegend: DataGen.generateUUIDString(),
	}),
});

DataGen.generateTemplate = (deprecated, hasView = false, configOptions = {}) => ({
	_id: DataGen.generateUUIDString(),
	code: DataGen.generateRandomString(3),
	name: DataGen.generateRandomString(),
	config: configOptions,
	properties: [
		{
			name: DataGen.generateRandomString(),
			type: propTypes.DATE,
			required: true,
		},
		{
			name: DataGen.generateRandomString(),
			type: propTypes.TEXT,
			deprecated: true,
		},
		{
			name: DataGen.generateRandomString(),
			type: propTypes.NUMBER,
			default: DataGen.generateRandomNumber(),
		},
		...(hasView ? [{
			name: DataGen.generateRandomString(),
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
			name: DataGen.generateRandomString(),
			properties: [
				{
					name: DataGen.generateRandomString(),
					type: propTypes.TEXT,
				},
				{
					name: DataGen.generateRandomString(),
					type: propTypes.NUMBER,
					default: DataGen.generateRandomNumber(),
					deprecated: true,
				},
				{
					name: DataGen.generateRandomString(),
					type: propTypes.NUMBER,
					default: DataGen.generateRandomNumber(),
				},
				...(hasView ? [{
					name: DataGen.generateRandomString(),
					type: propTypes.VIEW,
					default: DataGen.generateRandomNumber(),
				}] : []),
			],
		},
	],
	...deleteIfUndefined({ deprecated }),
});

DataGen.generateAuditAction = (actionType) => {
	const actionData = {
		[actionTypes.USER_ADDED]: { user: DataGen.generateRandomString() },
		[actionTypes.USER_REMOVED]: { user: DataGen.generateRandomString() },
		[actionTypes.INVITATION_ADDED]: {
			email: DataGen.generateRandomString(),
			job: DataGen.generateRandomString(),
			permissions: { teamspace_admin: true },
		},
		[actionTypes.INVITATION_REVOKED]: {
			email: DataGen.generateRandomString(),
			job: DataGen.generateRandomString(),
			permissions: { teamspace_admin: true },
		},
		[actionTypes.PERMISSIONS_UPDATED]: { users: [DataGen.generateRandomString()],
			permissions: [{
				model: DataGen.generateUUID(),
				project: DataGen.generateUUID(),
				from: [MODEL_COMMENTER],
				to: [MODEL_VIEWER],
			}] },
	};

	return {
		_id: DataGen.generateUUIDString(),
		action: actionType,
		executor: DataGen.generateRandomString(),
		timestamp: DataGen.generateRandomDate(),
		data: actionData[actionType],
	};
};

DataGen.generateRandomObject = () => ({
	[DataGen.generateRandomString()]: DataGen.generateRandomString(),
	[DataGen.generateRandomString()]: DataGen.generateRandomString(),
	[DataGen.generateRandomString()]: DataGen.generateRandomString(),
	[DataGen.generateRandomString()]: DataGen.generateRandomString(),
});

DataGen.generateView = (account, model, hasThumbnail = true) => ({
	_id: DataGen.generateUUIDString(),
	name: DataGen.generateRandomString(),
	...(hasThumbnail ? { thumbnail: DataGen.generateRandomBuffer() } : {}),
});

DataGen.generateBasicNode = (type, rev_id, parents, additionalData = {}) => deleteIfUndefined({
	_id: generateUUID(),
	shared_id: generateUUID(),
	rev_id: stringToUUID(rev_id),
	type,
	parents,
	...additionalData,
});

DataGen.generateMeshNode = (rev_id, parents) => {
	const blobData = {
		vertices: times(9, () => DataGen.generateRandomNumber(-100, 100)),
		normals: times(9, () => DataGen.generateRandomNumber(-1, 1)),
		faces: [3, ...times(3, () => Math.floor(DataGen.generateRandomNumber(0, 2)))],
	};

	// javascript is 64-bit float by default, need to convert to proper typed array and back
	blobData.vertices = Array.from(new Float32Array(blobData.vertices));
	blobData.normals = Array.from(new Float32Array(blobData.normals));

	return DataGen.generateBasicNode('mesh', rev_id, parents, { blobData });
};

DataGen.generateTextureNode = (rev_id, parents) => {
	const blobData = {
		data: DataGen.generateRandomString(256),
	};
	const nodeData = {
		blobData,
		extension: 'png',
	};
	return DataGen.generateBasicNode('texture', rev_id, parents, nodeData);
};

module.exports = DataGen;
