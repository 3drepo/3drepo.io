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

const { src, modelFolder, objModel } = require('../../../../../helper/path');
const {
	determineTestGroup,
	generateRandomString,
	generateUUIDString,
} = require('../../../../../helper/services');

const fs = require('fs/promises');
const path = require('path');
const CryptoJs = require('crypto-js');

jest.mock('../../../../../../../src/v5/utils/helper/models');
const ModelHelper = require(`${src}/utils/helper/models`);

jest.mock('../../../../../../../src/v5/models/projectSettings');
const ProjectSettings = require(`${src}/models/projectSettings`);
jest.mock('../../../../../../../src/v5/models/modelSettings');
const ModelSettings = require(`${src}/models/modelSettings`);
jest.mock('../../../../../../../src/v5/models/users');
const Users = require(`${src}/models/users`);
jest.mock('../../../../../../../src/v5/models/revisions');
const Revisions = require(`${src}/models/revisions`);
const Containers = require(`${src}/processors/teamspaces/projects/models/containers`);
const Views = require(`${src}/models/views`);
jest.mock('../../../../../../../src/v5/models/views');
const Legends = require(`${src}/models/legends`);
jest.mock('../../../../../../../src/v5/models/legends');
jest.mock('../../../../../../../src/v5/services/filesManager');
const FilesManager = require(`${src}/services/filesManager`);
jest.mock('../../../../../../../src/v5/models/fileRefs');

jest.mock('../../../../../../../src/v5/handler/queue');
const QueueHandler = require(`${src}/handler/queue`);

const { templates } = require(`${src}/utils/responseCodes`);
const { modelTypes } = require(`${src}/models/modelSettings.constants`);

const newContainerId = 'newContainerId';
ModelSettings.addModel.mockImplementation(() => newContainerId);
ModelSettings.deleteModel.mockImplementation((ts, project, model) => {
	if (Number.isInteger(model)) {
		return Promise.resolve(undefined);
	}
	return Promise.reject(templates.containerNotFound);
});

const modelList = [
	{ _id: 1, name: 'model1', permissions: [{ user: 'user1', permission: 'collaborator' }, { user: 'user2', permission: 'collaborator' }] },
	{ _id: 2, name: 'model2', permissions: [{ user: 'user2', permission: 'commenter' }] },
	{ _id: 3, name: 'model3', permissions: [{ user: 'user1', permission: 'viewer' }] },
	{ _id: 4, name: 'model4', permissions: [] },
	{ _id: 4, name: 'model4' },
];

ModelSettings.getModelById.mockImplementation((ts, model) => {
	if (Number.isInteger(model)) {
		return Promise.resolve(modelList[model - 1]);
	}
	return Promise.reject(templates.containerNotFound);
});

const containerSettings = {
	container1: {
		_id: 1,
		name: 'container 1',
		type: 'type 1',
		properties: {
			unit: 'm',
			code: 'CTN1',
		},
		status: 'ok',
		defaultView: 2,
		defaultLegend: 3,
		timestamp: new Date(),
		surveyPoints: [123],
		angleFromNorth: 10,
		desc: 'One description',
		errorReason: {
			message: 'error reason',
			timestamp: 123,
			errorCode: 1,
		},
	},
	container2: {
		_id: 2,
		name: 'container 2',
		type: 'type 2',
		properties: {
			unit: 'mm',
			code: 'CTN2',
		},
		status: 'processing',
	},
	container3: {
		_id: 3,
		name: 'container 3',
		type: 'type 2',
		properties: {
			unit: 'mm',
			code: 'CTN2',
		},
		status: 'failed',
		errorReason: {
			message: 'abc',
			bouncerValue: 1,
			timestamp: new Date(),
		},
	},
	container4: {
		_id: 4,
		name: 'container 4',
		type: 'type 2',
		properties: {
			unit: 'mm',
			code: 'CTN2',
		},
		status: 'processing',
		errorReason: {
			message: 'abc',
			bouncerValue: 1,
			timestamp: new Date(),
		},
	},
};

const user1Favourites = [1];

const project = { _id: 1, name: 'project', models: modelList.map(({ _id }) => _id) };

const container2Rev = {
	_id: 12,
	tag: 'revTag',
	timestamp: 1630606846000,
};

ProjectSettings.getProjectById.mockImplementation(() => project);
ProjectSettings.addModelToProject.mockResolvedValue();
ModelSettings.getModelByQuery.mockImplementation((ts, query) => {
	if (query.name === 'model1') Promise.resolve(modelList[0]);
	else throw templates.modelNotFound;
});
ModelSettings.getContainers.mockImplementation(() => modelList);
const getContainerByIdMock = ModelSettings.getContainerById.mockImplementation((teamspace,
	container) => containerSettings[container]);
Views.getViewById.mockImplementation((teamspace, model, view) => {
	if (view === 1) {
		return 1;
	}
	throw templates.viewNotFound;
});

Legends.checkLegendExists.mockImplementation((teamspace, model, legend) => {
	if (legend === 1) {
		return 1;
	}
	throw templates.legendNotFound;
});

Revisions.getRevisionCount.mockImplementation((teamspace, container) => (container === 'container2' ? 10 : 0));
Revisions.getLatestRevision.mockImplementation((teamspace, container) => {
	if (container === 'container2') return container2Rev;
	throw templates.revisionNotFound;
});

Users.getFavourites.mockImplementation((user) => (user === 'user1' ? user1Favourites : []));
Users.appendFavourites.mockImplementation((username, teamspace, favouritesToAdd) => {
	for (const favourite of favouritesToAdd) {
		if (user1Favourites.indexOf(favourite) === -1) {
			user1Favourites.push(favourite);
		}
	}
});

Users.deleteFavourites.mockImplementation((username, teamspace, favouritesToAdd) => {
	for (const favourite of favouritesToAdd) {
		const index = user1Favourites.indexOf(favourite);
		if (index !== -1) {
			user1Favourites.splice(index, 1);
		}
	}
});

// Permissions mock
jest.mock('../../../../../../../src/v5/utils/permissions/permissions', () => ({
	...jest.requireActual('../../../../../../../src/v5/utils/permissions/permissions'),
	isTeamspaceAdmin: jest.fn().mockImplementation((teamspace, user) => user === 'tsAdmin'),
	hasProjectAdminPermissions: jest.fn().mockImplementation((perm, user) => user === 'projAdmin'),
}));

const determineResults = (username) => modelList.flatMap(({ permissions, _id, name }) => {
	const isAdmin = username === 'projAdmin' || username === 'tsAdmin';
	const hasModelPerm = permissions && permissions.find((entry) => entry.user === username);
	const isFavourite = username === 'user1' && user1Favourites.includes(_id);
	return isAdmin || hasModelPerm ? { _id, name, role: isAdmin ? 'admin' : hasModelPerm.permission, isFavourite } : [];
});

const testGetContainerList = () => {
	describe('Get container list by user', () => {
		test('should return the whole list if the user is a teamspace admin', async () => {
			const res = await Containers.getContainerList('teamspace', 'xxx', 'tsAdmin');
			expect(res).toEqual(determineResults('tsAdmin'));
		});
		test('should return the whole list if the user is a project admin', async () => {
			const res = await Containers.getContainerList('teamspace', 'xxx', 'projAdmin');
			expect(res).toEqual(determineResults('projAdmin'));
		});
		test('should return a partial list if the user has model access in some containers', async () => {
			const res = await Containers.getContainerList('teamspace', 'xxx', 'user1');
			expect(res).toEqual(determineResults('user1'));
		});
		test('should return a partial list if the user has model access in some containers (2)', async () => {
			const res = await Containers.getContainerList('teamspace', 'xxx', 'user2');
			expect(res).toEqual(determineResults('user2'));
		});
		test('should return empty array if the user has no access', async () => {
			const res = await Containers.getContainerList('teamspace', 'xxx', 'nobody');
			expect(res).toEqual([]);
		});
	});
};

const testAppendFavourites = () => {
	describe('Add containers to favourites', () => {
		test('new containers should be added to favourites if user has all permissions', async () => {
			await expect(Containers.appendFavourites('user1', 'teamspace', 'project', [3])).resolves.toEqual(undefined);
		});

		test('should return error if one or more containers are not found', async () => {
			await expect(Containers.appendFavourites('user1', 'teamspace', 'project', [1, -1]))
				.rejects.toEqual({ ...templates.invalidArguments, message: 'The following models were not found: -1' });
		});

		test('should return error if the containers list provided is empty', async () => {
			await expect(Containers.appendFavourites('user1', 'teamspace', 'project', []))
				.rejects.toEqual({ ...templates.invalidArguments, message: 'The favourites list provided is empty' });
		});

		test('should return error if user has no permissions on one or more models', async () => {
			await expect(Containers.appendFavourites('user1', 'teamspace', 'project', [1, 2]))
				.rejects.toEqual({ ...templates.invalidArguments, message: 'The following models were not found: 2' });
		});
	});
};

const testDeleteFavourites = () => {
	describe('Remove containers from favourites', () => {
		test('containers should be removed from favourites if user has all permissions', async () => {
			await expect(Containers.deleteFavourites('tsAdmin', 'teamspace', 'project', [1])).resolves.toEqual(undefined);
		});

		test('should return error if one or more containers are not found', async () => {
			await expect(Containers.deleteFavourites('tsAdmin', 'teamspace', 'project', [1, -1]))
				.rejects.toEqual({ ...templates.invalidArguments, message: 'The following models were not found: -1' });
		});

		test('should return error if the containers list provided is empty', async () => {
			await expect(Containers.deleteFavourites('user1', 'teamspace', 'project', []))
				.rejects.toEqual({ ...templates.invalidArguments, message: 'The favourites list provided is empty' });
		});

		test('should return error if user has no permissions on one or more models', async () => {
			await expect(Containers.deleteFavourites('user1', 'teamspace', 'project', [2]))
				.rejects.toEqual({ ...templates.invalidArguments, message: 'The following models were not found: 2' });
		});
	});
};

const formatToStats = (settings, revCount, latestRev) => {
	const res = {
		type: settings.type,
		code: settings.properties.code,
		status: settings.status,
		unit: settings.properties.unit,
		revisions: {
			total: revCount,
			lastUpdated: latestRev.timestamp,
			latestRevision: latestRev.tag || latestRev._id,
		},
	};

	if (settings.status === 'failed') {
		res.errorReason = { message: settings.errorReason.message, timestamp: settings.errorReason.timestamp };
	}
	return res;
};

const testGetContainerStats = () => {
	describe.each([
		['the container exists and have no revisions', 'container1'],
		['the container exists and have revisions', 'container2'],
		['the container exists and latest revision processing have failed', 'container3'],
		['the container exists and some previous revision processing have failed', 'container4'],
	])('Get container stats', (desc, container) => {
		test(`should return the stats if ${desc}[${container}]`, async () => {
			const res = await Containers.getContainerStats('teamspace', 'project', container);
			expect(res).toEqual(formatToStats(containerSettings[container], container === 'container2' ? 10 : 0, container === 'container2' ? container2Rev : {}));
		});
	});
};

const testAddContainer = () => {
	describe('Add container', () => {
		test('should return the container ID on success', async () => {
			const data = {
				name: 'container name',
				code: 'code99',
				unit: 'mm',
			};
			const res = await Containers.addContainer('teamspace', 'project', data);
			expect(res).toEqual(newContainerId);
			expect(ProjectSettings.addModelToProject.mock.calls.length).toBe(1);
		});
	});
};

const testDeleteContainer = () => {
	describe('Delete container', () => {
		test('should succeed', async () => {
			ModelHelper.removeModelData.mockResolvedValueOnce();
			ProjectSettings.removeModelFromProject.mockResolvedValueOnce();

			const teamspace = generateRandomString();
			const projectId = generateRandomString();
			const model = generateRandomString();
			await Containers.deleteContainer(teamspace, projectId, model);

			expect(ModelHelper.removeModelData).toHaveBeenCalledTimes(1);
			expect(ModelHelper.removeModelData).toHaveBeenCalledWith(teamspace, projectId, model);
			expect(ProjectSettings.removeModelFromProject).toHaveBeenCalledTimes(1);
			expect(ProjectSettings.removeModelFromProject).toHaveBeenCalledWith(teamspace, projectId, model);
		});
	});
};

const testGetRevisions = () => {
	describe('Get container revisions', () => {
		const revisions = [
			{
				_id: generateUUIDString(),
				author: generateRandomString(),
				timestamp: new Date(),
				rFile: [`${generateUUIDString()}_${generateUUIDString()}_ifc`],
			},
			{
				_id: generateUUIDString(),
				author: generateRandomString(),
				timestamp: new Date(),
				rFile: [`${generateUUIDString()}_${generateUUIDString()}_obj`],
			},
			{
				_id: generateUUIDString(),
				author: generateRandomString(),
				timestamp: new Date(),
			},
			{
				_id: generateUUIDString(),
				author: generateRandomString(),
				timestamp: new Date(),
				void: true,
			},
		];

		const formatRevisions = (revs) => revs.map(({ rFile, ...r }) => {
			if (rFile) {
				const format = '.'.concat(rFile[0].split('_').pop());
				return { ...r, format };
			}
			return r;
		});

		Revisions.getRevisionFormat.mockImplementation((rFile) => (rFile ? '.'.concat(rFile[0].split('_').pop()) : undefined));
		const teamspace = generateRandomString();
		const proj = generateRandomString();
		const container = generateRandomString();

		test('should return non-void revisions if the container exists', async () => {
			Revisions.getRevisions.mockImplementationOnce(() => revisions);

			const res = await Containers.getRevisions(teamspace, proj, container, false);
			expect(Revisions.getRevisions).toHaveBeenCalledTimes(1);
			expect(Revisions.getRevisions).toHaveBeenCalledWith(teamspace, proj, container, modelTypes.CONTAINER, false,
				{ _id: 1, author: 1, timestamp: 1, tag: 1, void: 1, desc: 1, rFile: 1 });

			expect(res).toEqual(formatRevisions(revisions));
		});

		test('should return all revisions if the container exists', async () => {
			Revisions.getRevisions.mockImplementationOnce(() => revisions);

			const res = await Containers.getRevisions(teamspace, proj, container, true);
			expect(Revisions.getRevisions).toHaveBeenCalledTimes(1);
			expect(Revisions.getRevisions).toHaveBeenCalledWith(teamspace, proj, container, modelTypes.CONTAINER, true,
				{ _id: 1, author: 1, timestamp: 1, tag: 1, void: 1, desc: 1, rFile: 1 });

			expect(res).toEqual(formatRevisions(revisions));
		});
	});
};

const fileExists = (file) => fs.access(file).then(() => true).catch(() => false);

const testNewRevision = () => {
	const fileCreated = path.join(modelFolder, 'toRemove.obj');
	describe('New container revisions', () => {
		const teamspace = 'teamspace';
		const model = '123';
		const data = {};
		const file = { path: fileCreated, originalname: 'hello.obj' };
		test('should execute successfully if queueModelUpload returns', async () => {
			await fs.copyFile(objModel, fileCreated);
			ModelSettings.getContainerById.mockResolvedValueOnce({ properties: { unit: 'm' } });
			await expect(Containers.newRevision(teamspace, model, data, file)).resolves.toBe(undefined);
			await expect(fileExists(fileCreated)).resolves.toBe(false);
			expect(QueueHandler.queueMessage).toHaveBeenCalledTimes(1);
		});

		test('v4 compatibility test', async () => {
			await fs.copyFile(objModel, fileCreated);
			ModelSettings.getContainerById.mockResolvedValueOnce({});
			await expect(Containers.newRevision(teamspace, model, data, file)).resolves.toBe(undefined);
			await expect(fileExists(fileCreated)).resolves.toBe(false);
			expect(QueueHandler.queueMessage).toHaveBeenCalledTimes(1);
		});

		test('should return whatever error queueModelUpload returns should it fail', async () => {
			ModelSettings.getContainerById.mockResolvedValueOnce({ properties: { unit: 'm' } });
			await expect(Containers.newRevision(teamspace, model, data, file))
				.rejects.toEqual(templates.queueInsertionFailed);
			await expect(fileExists(fileCreated)).resolves.toBe(false);
			expect(QueueHandler.queueMessage).not.toHaveBeenCalled();
		});
	});
};

const testGetSettings = () => {
	describe('Get container settings', () => {
		test('should return the container settings', async () => {
			const projection = { corID: 0, account: 0, permissions: 0 };
			const res = await Containers.getSettings('teamspace', 'container1');
			expect(res).toEqual(containerSettings.container1);
			expect(getContainerByIdMock.mock.calls.length).toBe(1);
			expect(getContainerByIdMock.mock.calls[0][2]).toEqual(projection);
		});
	});
};

const testUpdateRevisionStatus = () => {
	describe('Update revision status', () => {
		test('should update the status of a revision', async () => {
			const teamspace = generateRandomString();
			const container = generateRandomString();
			const revision = generateRandomString();
			const status = generateRandomString();

			await Containers.updateRevisionStatus(teamspace, project._id, container, revision, status);

			expect(Revisions.updateRevisionStatus).toHaveBeenCalledTimes(1);
			expect(Revisions.updateRevisionStatus).toHaveBeenCalledWith(teamspace, project._id, container,
				modelTypes.CONTAINER, revision, status);
		});
	});
};

const formatFilename = (name) => name.substr(36).replace(/_([^_]*)$/, '.$1');

const testDownloadRevisionFiles = () => {
	describe('Download revision files', () => {
		test('should throw error if revision has no file', async () => {
			Revisions.getRevisionByIdOrTag.mockResolvedValueOnce({ rFile: [] });

			await expect(Containers.downloadRevisionFiles('teamspace', 'container', generateUUIDString()))
				.rejects.toEqual(templates.fileNotFound);

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(0);
		});

		test('should download files if revision has file', async () => {
			const teamspace = generateRandomString();
			const container = generateRandomString();
			const fileName = `${generateUUIDString()}${generateUUIDString()}.ifc`;
			const revision = generateRandomString();
			Revisions.getRevisionByIdOrTag.mockResolvedValueOnce({ rFile: [fileName] });

			const output = {
				[generateRandomString()]: generateRandomString(),
			};
			FilesManager.getFileAsStream.mockResolvedValueOnce(output);

			await expect(Containers.downloadRevisionFiles(teamspace, container, revision))
				.resolves.toEqual({ ...output, filename: formatFilename(fileName) });

			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledTimes(1);
			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledWith(teamspace, container, modelTypes.CONTAINER,
				revision, { rFile: 1 }, { includeVoid: true });

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(teamspace, `${container}.history.ref`, fileName);
		});
	});
};

const testGetMD5Hash = () => {
	describe('Get revision MD5 hash', () => {
		test('should return empty if revision has no file', async () => {
			Revisions.getRevisionByIdOrTag.mockResolvedValueOnce(templates.revisionNotFound);
			const randomRevision = generateUUIDString();

			await expect(Containers.getRevisionMD5Hash('teamspace', 'container', randomRevision)).resolves.toEqual({});

			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledTimes(1);
			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledWith('teamspace', 'container', 'container', randomRevision, { fileSize: 1, rFile: 1, tag: 1, timestamp: 1 }, { includeVoid: false });
			expect(FilesManager.getMD5FileHash).not.toHaveBeenCalled();
		});
		test('should return an object if revision has a valid file and the file should be retrieved if no MD5Hash exists in the fileRef', async () => {
			const revisionMock = { _id: generateRandomString(), rFile: ['success!'], timestamp: new Date(), tag: 'testTag' };
			const revisionCodeMock = generateUUIDString();
			const fileHash = { hash: CryptoJs.MD5(revisionMock._id).toString(), size: 100 };

			Revisions.getRevisionByIdOrTag.mockResolvedValueOnce(revisionMock);
			FilesManager.getMD5FileHash.mockResolvedValueOnce(fileHash);

			await expect(Containers.getRevisionMD5Hash('teamspace', 'container', revisionCodeMock)).resolves.toEqual({
				container: 'container',
				tag: revisionMock.tag,
				timestamp: revisionMock.timestamp,
				hash: fileHash.hash,
				filename: revisionMock.rFile[0],
				size: fileHash.size,
			});

			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledTimes(1);
			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledWith('teamspace', 'container', 'container', revisionCodeMock, { fileSize: 1, rFile: 1, tag: 1, timestamp: 1 }, { includeVoid: false });
			expect(FilesManager.getMD5FileHash).toHaveBeenCalledTimes(1);
			expect(FilesManager.getMD5FileHash).toHaveBeenCalledWith('teamspace', 'container.history', revisionMock.rFile[0]);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetContainerList();
	testGetContainerStats();
	testAddContainer();
	testDeleteContainer();
	testAppendFavourites();
	testDeleteFavourites();
	testGetRevisions();
	testNewRevision();
	testGetSettings();
	testUpdateRevisionStatus();
	testDownloadRevisionFiles();
	testGetMD5Hash();
});
