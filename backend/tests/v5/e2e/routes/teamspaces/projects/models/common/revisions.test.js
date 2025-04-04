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

const SuperTest = require('supertest');
const ServiceHelper = require('../../../../../../helper/services');
const { src, dwgModel, dwgModelUppercaseExt, image } = require('../../../../../../helper/path');
const { writeFileSync, unlinkSync } = require('fs');
const CryptoJs = require('crypto-js');

const { deleteIfUndefined } = require(`${src}/utils/helper/objects`);
const { modelTypes, statusCodes } = require(`${src}/models/modelSettings.constants`);
const { calibrationStatuses } = require(`${src}/models/calibrations.constants`);
const { templates } = require(`${src}/utils/responseCodes`);

let server;
let agent;

const generateBasicData = () => {
	const users = {
		tsAdmin: ServiceHelper.generateUserCredentials(),
		noProjectAccess: ServiceHelper.generateUserCredentials(),
		viewer: ServiceHelper.generateUserCredentials(),
		commenter: ServiceHelper.generateUserCredentials(),
		nobody: ServiceHelper.generateUserCredentials(),
	};

	const teamspace = ServiceHelper.generateRandomString();
	const project = ServiceHelper.generateRandomProject();

	const models = {
		drawWithRev: {
			_id: ServiceHelper.generateUUIDString(),
			name: ServiceHelper.generateRandomString(),
			properties: {
				...ServiceHelper.generateRandomModelProperties(modelTypes.DRAWING),
				permissions: [{ user: users.viewer.user, permission: 'viewer' }, { user: users.commenter.user, permission: 'commenter' }],
			},
		},
		drawWithNoRev: {
			_id: ServiceHelper.generateUUIDString(),
			name: ServiceHelper.generateRandomString(),
			properties: ServiceHelper.generateRandomModelProperties(modelTypes.DRAWING),
		},
		conWithRev: {
			_id: ServiceHelper.generateUUIDString(),
			name: ServiceHelper.generateRandomString(),
			properties: {
				...ServiceHelper.generateRandomModelProperties(modelTypes.CONTAINER),
				permissions: [{ user: users.viewer.user, permission: 'viewer' }, { user: users.commenter.user, permission: 'commenter' }],
			},
		},
		conWithNoRev: {
			_id: ServiceHelper.generateUUIDString(),
			name: ServiceHelper.generateRandomString(),
			properties: ServiceHelper.generateRandomModelProperties(modelTypes.CONTAINER),
		},
		queuedStatusCont: {
			_id: ServiceHelper.generateUUIDString(),
			name: ServiceHelper.generateRandomString(),
			properties: { ...ServiceHelper.generateRandomModelProperties(), status: 'queued' },
		},
		processingStatusCont: {
			_id: ServiceHelper.generateUUIDString(),
			name: ServiceHelper.generateRandomString(),
			properties: { ...ServiceHelper.generateRandomModelProperties(), status: 'processing' },
		},
		federation: {
			_id: ServiceHelper.generateUUIDString(),
			name: ServiceHelper.generateRandomString(),
			properties: { ...ServiceHelper.generateRandomModelProperties(modelTypes.FEDERATION) },
		},
	};

	const drawRevisions = {
		voidRevision: { ...ServiceHelper.generateRevisionEntry(true, true, modelTypes.DRAWING),
			timestamp: new Date(100000),
			calibration: calibrationStatuses.UNCALIBRATED,
		},
		nonVoidRevision: { ...ServiceHelper.generateRevisionEntry(false, true, modelTypes.DRAWING),
			timestamp: new Date(200000),
			calibration: calibrationStatuses.CALIBRATED,
		},
		noFileRevision: { ...ServiceHelper.generateRevisionEntry(false, false, modelTypes.DRAWING),
			timestamp: new Date(300000),
			calibration: calibrationStatuses.UNCONFIRMED,
		},
	};

	const calibration = ServiceHelper.generateCalibration();

	const conRevisions = {
		nonVoidRevision: ServiceHelper.generateRevisionEntry(),
		voidRevision: ServiceHelper.generateRevisionEntry(true, true),
		noFileRevision: ServiceHelper.generateRevisionEntry(false, false),
	};

	return {
		users,
		teamspace,
		project,
		models,
		drawRevisions,
		conRevisions,
		calibration,
	};
};

const setupData = async ({ users, teamspace, project, models, drawRevisions, conRevisions, calibration }) => {
	const { tsAdmin, ...otherUsers } = users;

	await ServiceHelper.db.createUser(tsAdmin);
	await ServiceHelper.db.createTeamspace(teamspace, [tsAdmin.user]);

	const userProms = Object.keys(otherUsers).map((key) => ServiceHelper.db.createUser(users[key], key !== 'nobody' ? [teamspace] : []));

	const modelProms = Object.keys(models).map((key) => ServiceHelper.db.createModel(
		teamspace,
		models[key]._id,
		models[key].name,
		models[key].properties,
	));

	return Promise.all([
		...userProms,
		...modelProms,
		ServiceHelper.db.createProject(teamspace, project.id, project.name,
			Object.keys(models).map((key) => models[key]._id)),
		...Object.keys(drawRevisions).map((key) => ServiceHelper.db.createRevision(teamspace,
			project.id, models.drawWithRev._id, drawRevisions[key], modelTypes.DRAWING)),
		...Object.keys(conRevisions).map((key) => ServiceHelper.db.createRevision(teamspace,
			project.id, models.conWithRev._id, conRevisions[key], modelTypes.CONTAINER)),
		ServiceHelper.db.createCalibration(teamspace, project.id, models.drawWithRev._id,
			drawRevisions.nonVoidRevision._id, calibration),
	]);
};

const testGetRevisions = () => {
	describe('Get Revisions', () => {
		const basicData = generateBasicData();
		const { users, teamspace, project, models, drawRevisions, conRevisions } = basicData;

		beforeAll(async () => {
			await setupData(basicData);
		});

		const formatRevisions = (revs, modelType, includeVoid = false) => {
			const formattedRevisions = revs
				.sort((a, b) => b.timestamp - a.timestamp)
				.flatMap((rev) => (includeVoid || !rev.void ? deleteIfUndefined({
					_id: rev._id,
					revCode: modelType === modelTypes.DRAWING ? rev.revCode : undefined,
					calibration: modelType === modelTypes.DRAWING
						? (rev.calibration ?? calibrationStatuses.UNCALIBRATED)
						: undefined,
					statusCode: modelType === modelTypes.DRAWING ? rev.statusCode : undefined,
					tag: modelType === modelTypes.CONTAINER ? rev.tag : undefined,
					format: modelType === modelTypes.CONTAINER && rev.rFile ? '.'.concat(rev.rFile[0].split('_').pop()) : rev.format,
					author: rev.author,
					void: rev.void,
					timestamp: rev.timestamp.getTime(),
					desc: rev.desc,
				}) : []));

			return { revisions: formattedRevisions };
		};

		const generateTestData = (modelType) => {
			let model;
			let modelNotFound;

			if (modelType === modelTypes.CONTAINER) {
				model = models.conWithRev;
				modelNotFound = templates.containerNotFound;
			} else {
				model = models.drawWithRev;
				modelNotFound = templates.drawingNotFound;
			}

			const params = {
				key: users.tsAdmin.apiKey,
				ts: teamspace,
				projectId: project.id,
				modelId: model._id,
				modelType,
			};

			return [
				['the user does not have a valid session', { ...params, key: null }, false, templates.notLoggedIn],
				['the teamspace does not exist', { ...params, ts: ServiceHelper.generateRandomString() }, false, templates.teamspaceNotFound],
				['the user is not a member of the teamspace', { ...params, key: users.nobody.apiKey }, false, templates.teamspaceNotFound],
				['the user does not have access to the model', { ...params, key: users.noProjectAccess.apiKey }, false, templates.notAuthorized],
				['the project does not exist', { ...params, projectId: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
				['the model does not exist', { ...params, modelId: ServiceHelper.generateRandomString() }, false, modelNotFound],
				['the model is of wrong type', { ...params, modelId: models.federation._id }, false, modelNotFound],
				['the user has adequate permissions (non void revisions)', params, true],
				['the user has adequate permissions (all revisions)', { ...params, showVoid: true }, true],
			];
		};

		const runTest = (desc, params, success, error) => {
			const route = ({ ts, projectId, modelId, modelType, showVoid = false, key }) => `/v5/teamspaces/${ts}/projects/${projectId}/${modelType}s/${modelId}/revisions?showVoid=${showVoid}&key=${key}`;

			test(`should ${success ? 'succeed' : `fail with ${error.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : error.status;
				const res = await agent.get(route(params)).expect(expectedStatus);

				if (success) {
					const { modelType } = params;
					const revisions = modelType === modelTypes.DRAWING ? drawRevisions : conRevisions;
					expect(res.body).toEqual(
						formatRevisions(Object.keys(revisions).map((key) => revisions[key]),
							modelType, params.showVoid));
				} else {
					expect(res.body.code).toEqual(error.code);
				}
			});
		};

		describe.each(generateTestData(modelTypes.CONTAINER))('Containers', runTest);
		describe.each(generateTestData(modelTypes.DRAWING))('Drawing', runTest);
	});
};

const testCreateNewRevision = () => {
	describe('Create New Revision', () => {
		const basicData = generateBasicData();
		const { users, teamspace, project, models, drawRevisions, conRevisions } = basicData;

		const oversizedDwgPath = 'oversized.dwg';
		const exceedQuotaDwgPath = 'exceedQuota.dwg';

		beforeAll(async () => {
			await setupData(basicData);
			writeFileSync(oversizedDwgPath, Buffer.from(ServiceHelper.generateRandomString(20000000)));
			writeFileSync(exceedQuotaDwgPath, Buffer.from(ServiceHelper.generateRandomString(6000000)));
		});

		afterAll(() => {
			unlinkSync(oversizedDwgPath);
			unlinkSync(exceedQuotaDwgPath);
		});

		const generateTestData = (modelType) => {
			let model;
			let modelWithNoRev;
			let modelNotFound;

			if (modelType === modelTypes.CONTAINER) {
				model = models.conWithRev;
				modelWithNoRev = models.conWithNoRev;
				modelNotFound = templates.containerNotFound;
			} else {
				model = models.drawWithRev;
				modelWithNoRev = models.drawWithNoRev;
				modelNotFound = templates.drawingNotFound;
			}

			const generateParams = () => deleteIfUndefined({
				key: users.tsAdmin.apiKey,
				ts: teamspace,
				projectId: project.id,
				modelId: model._id,
				modelType,
				file: dwgModel,
				tag: modelType === modelTypes.CONTAINER ? ServiceHelper.generateRandomString(10) : undefined,
				statusCode: modelType === modelTypes.DRAWING ? statusCodes[0].code : undefined,
				revCode: modelType === modelTypes.DRAWING ? ServiceHelper.generateRandomString(10) : undefined,
			});

			const drawingCases = [
				['the statusCode is invalid', { ...generateParams(), statusCode: ServiceHelper.generateRandomString() }, false, templates.invalidArguments],
				['the revCode is invalid', { ...generateParams(), revCode: ServiceHelper.generateRandomString(11) }, false, templates.invalidArguments],
				['the revCode and statusCode are already used', { ...generateParams(), revCode: drawRevisions.nonVoidRevision.revCode, statusCode: drawRevisions.nonVoidRevision.statusCode }, false, templates.invalidArguments],
			];

			const containerCases = [
				['model status is queued', { ...generateParams(), modelId: models.queuedStatusCont._id }, false, templates.invalidArguments],
				['model status is processing', { ...generateParams(), modelId: models.processingStatusCont._id }, false, templates.invalidArguments],
				['tag is invalid', { ...generateParams(), tag: ServiceHelper.generateRandomString(51) }, false, templates.invalidArguments],
				['tag is already used', { ...generateParams(), tag: conRevisions.nonVoidRevision.tag }, false, templates.invalidArguments],
			];

			return [
				['the user does not have a valid session', { ...generateParams(), key: null }, false, templates.notLoggedIn],
				['the teamspace does not exist', { ...generateParams(), ts: ServiceHelper.generateRandomString() }, false, templates.teamspaceNotFound],
				['the user is not a member of the teamspace', { ...generateParams(), key: users.nobody.apiKey }, false, templates.teamspaceNotFound],
				['the user does not have access to the model', { ...generateParams(), key: users.noProjectAccess.apiKey }, false, templates.notAuthorized],
				['the user is viewer', { ...generateParams(), key: users.viewer.apiKey }, false, templates.notAuthorized],
				['the user is commenter', { ...generateParams(), key: users.commenter.apiKey }, false, templates.notAuthorized],
				['the project does not exist', { ...generateParams(), projectId: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
				['the model does not exist', { ...generateParams(), modelId: ServiceHelper.generateRandomString() }, false, modelNotFound],
				['the model is of wrong type', { ...generateParams(), modelId: models.federation._id }, false, modelNotFound],
				['the file is missing', { ...generateParams(), file: undefined }, false, templates.invalidArguments],
				['the file has incorrect format', { ...generateParams(), file: image }, false, templates.unsupportedFileFormat],
				['the file is larger than the allowed file size', { ...generateParams(), file: oversizedDwgPath }, false, templates.maxSizeExceeded],
				['the file is larger than the user quota', { ...generateParams(), file: exceedQuotaDwgPath }, false, templates.quotaLimitExceeded],
				['the file is valid', generateParams(), true],
				['the file is valid with uppercase extension', { ...generateParams(), file: dwgModelUppercaseExt, modelId: modelWithNoRev._id }, true],
				...(modelType === modelTypes.DRAWING ? drawingCases : containerCases),
			];
		};

		const runTest = (desc, params, success, error) => {
			const route = ({ ts, projectId, modelId, modelType, key }) => `/v5/teamspaces/${ts}/projects/${projectId}/${modelType}s/${modelId}/revisions?key=${key}`;

			test(`should ${success ? 'succeed' : `fail with ${error.code}`} if ${desc}`, async () => {
				const expectedResult = success ? templates.ok : error;

				const req = params.modelType === modelTypes.DRAWING
					? agent.post(route(params))
						.set('Content-Type', 'multipart/form-data')
						.field('statusCode', params.statusCode)
						.field('revCode', params.revCode)
						.attach('file', params.file)
					: agent.post(route(params))
						.set('Content-Type', 'multipart/form-data')
						.field('tag', params.tag)
						.attach('file', params.file);

				const res = await req.expect(expectedResult.status);

				expect(res.body.code).toEqual(success ? undefined : error.code);
			});
		};

		describe.each(generateTestData(modelTypes.CONTAINER))('Containers', runTest);
		describe.each(generateTestData(modelTypes.DRAWING))('Drawing', runTest);
	});
};

const testUpdateRevisionStatus = () => {
	describe('Update Revision Status', () => {
		const basicData = generateBasicData();
		const { users, teamspace, project, models, drawRevisions, conRevisions } = basicData;

		beforeAll(async () => {
			await setupData(basicData);
		});

		const generateTestData = (modelType) => {
			let model;
			let nonVoidrevision;
			let voidRevision;
			let modelNotFound;

			if (modelType === modelTypes.CONTAINER) {
				model = models.conWithRev;
				nonVoidrevision = conRevisions.nonVoidRevision;
				voidRevision = conRevisions.voidRevision;
				modelNotFound = templates.containerNotFound;
			} else {
				model = models.drawWithRev;
				nonVoidrevision = drawRevisions.nonVoidRevision;
				voidRevision = drawRevisions.voidRevision;
				modelNotFound = templates.drawingNotFound;
			}

			const params = {
				key: users.tsAdmin.apiKey,
				ts: teamspace,
				projectId: project.id,
				modelId: model._id,
				modelType,
				revisionId: nonVoidrevision._id,
				setVoid: true,
			};

			return [
				['the user does not have a valid session', { ...params, key: null }, false, templates.notLoggedIn],
				['the teamspace does not exist', { ...params, ts: ServiceHelper.generateRandomString() }, false, templates.teamspaceNotFound],
				['the user is not a member of the teamspace', { ...params, key: users.nobody.apiKey }, false, templates.teamspaceNotFound],
				['the user does not have access to the model', { ...params, key: users.noProjectAccess.apiKey }, false, templates.notAuthorized],
				['the user is viewer', { ...params, key: users.viewer.apiKey }, false, templates.notAuthorized],
				['the user is commenter', { ...params, key: users.commenter.apiKey }, false, templates.notAuthorized],
				['the project does not exist', { ...params, projectId: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
				['the model does not exist', { ...params, modelId: ServiceHelper.generateRandomString() }, false, modelNotFound],
				['the model is of wrong type', { ...params, modelId: models.federation._id }, false, modelNotFound],
				['the revision does not exist', { ...params, revisionId: ServiceHelper.generateRandomString() }, false, templates.revisionNotFound],
				['the body of the request is no boolean', { ...params, setVoid: ServiceHelper.generateRandomString() }, false, templates.invalidArguments],
				['the body of the request contains extra data', { ...params, extraData: { extraProp: ServiceHelper.generateRandomString() } }, false, templates.invalidArguments],
				['the body of the request is valid and set to true', params, true],
				['the body of the request is valid and set to false', { ...params, setVoid: false, revisionId: voidRevision._id }, true],
			];
		};

		const runTest = (desc, params, success, error) => {
			const patchRoute = ({ ts, projectId, modelId, revisionId, modelType, key }) => `/v5/teamspaces/${ts}/projects/${projectId}/${modelType}s/${modelId}/revisions/${revisionId}?key=${key}`;
			const getRoute = ({ ts, projectId, modelId, modelType, key }) => `/v5/teamspaces/${ts}/projects/${projectId}/${modelType}s/${modelId}/revisions?key=${key}&showVoid=true`;

			test(`should ${success ? 'succeed' : `fail with ${error.code}`} if ${desc}`, async () => {
				const { setVoid, extraData, revisionId } = params;
				const expectedStatus = success ? templates.ok.status : error.status;

				const res = await agent.patch(patchRoute(params))
					.send({ void: setVoid, ...extraData })
					.expect(expectedStatus);

				if (success) {
					const revs = await agent.get(getRoute(params));
					expect(revs.body.revisions.find((r) => r._id === revisionId).void).toBe(setVoid);
				} else {
					expect(res.body.code).toEqual(error.code);
				}

				expect(res.body.code).toEqual(success ? undefined : error.code);
			});
		};

		describe.each(generateTestData(modelTypes.CONTAINER))('Containers', runTest);
		describe.each(generateTestData(modelTypes.DRAWING))('Drawing', runTest);
	});
};

const testDownloadRevisionFiles = () => {
	describe('Download Revision Files', () => {
		const basicData = generateBasicData();
		const { users, teamspace, project, models, drawRevisions, conRevisions } = basicData;

		beforeAll(async () => {
			await setupData(basicData);
		});

		const generateTestData = (modelType) => {
			let model;
			let revision;
			let noFileRevision;
			let voidRevision;
			let modelNotFound;

			if (modelType === modelTypes.CONTAINER) {
				model = models.conWithRev;
				revision = conRevisions.nonVoidRevision;
				noFileRevision = conRevisions.noFileRevision;
				voidRevision = conRevisions.voidRevision;
				modelNotFound = templates.containerNotFound;
			} else {
				model = models.drawWithRev;
				revision = drawRevisions.nonVoidRevision;
				noFileRevision = drawRevisions.noFileRevision;
				voidRevision = drawRevisions.voidRevision;
				modelNotFound = templates.drawingNotFound;
			}

			const params = {
				key: users.tsAdmin.apiKey,
				ts: teamspace,
				projectId: project.id,
				modelId: model._id,
				modelType,
				revision,
			};

			return [
				['the user does not have a valid session', { ...params, key: null }, false, templates.notLoggedIn],
				['the teamspace does not exist', { ...params, ts: ServiceHelper.generateRandomString() }, false, templates.teamspaceNotFound],
				['the user is not a member of the teamspace', { ...params, key: users.nobody.apiKey }, false, templates.teamspaceNotFound],
				['the user does not have access to the model', { ...params, key: users.noProjectAccess.apiKey }, false, templates.notAuthorized],
				['the user is viewer', { ...params, key: users.viewer.apiKey }, false, templates.notAuthorized],
				['the user is commenter', { ...params, key: users.commenter.apiKey }, false, templates.notAuthorized],
				['the project does not exist', { ...params, projectId: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
				['the model does not exist', { ...params, modelId: ServiceHelper.generateRandomString() }, false, modelNotFound],
				['the model is of wrong type', { ...params, modelId: models.federation._id }, false, modelNotFound],
				['the revision does not exist', { ...params, revision: ServiceHelper.generateRevisionEntry() }, false, templates.revisionNotFound],
				['the revision has no file', { ...params, revision: noFileRevision }, false, templates.fileNotFound],
				['the revision has a file', params, true],
				['the revision has a file (void revision)', { ...params, revision: voidRevision }, true],
			];
		};

		const runTest = (desc, params, success, error) => {
			const route = ({ ts, projectId, modelId, revision, modelType, key }) => `/v5/teamspaces/${ts}/projects/${projectId}/${modelType}s/${modelId}/revisions/${revision._id}/files${modelType === modelTypes.DRAWING ? '/original' : ''}?key=${key}`;

			test(`should ${success ? 'succeed' : `fail with ${error.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : error.status;

				const res = await agent.get(`${route(params)}`).expect(expectedStatus);

				if (success) {
					expect(res.text).toEqual(params.revision.refData);
				} else {
					expect(res.body.code).toEqual(error.code);
				}
			});
		};

		describe.each(generateTestData(modelTypes.CONTAINER))('Containers', runTest);
		describe.each(generateTestData(modelTypes.DRAWING))('Drawing', runTest);
	});
};

const testGetRevisionMD5Hash = () => {
	describe('Get Revision MD5 Hash', () => {
		const basicData = generateBasicData();
		const { users, teamspace, project, models, conRevisions } = basicData;

		beforeAll(async () => {
			await setupData(basicData);
		});

		const generateTestData = () => {
			const model = models.conWithRev;
			const revision = conRevisions.nonVoidRevision;
			const { voidRevision } = conRevisions;

			const MD5HashResponseExpectation = {
				container: model._id,
				tag: revision.tag,
				timestamp: new Date(revision.timestamp).getTime(),
				hash: CryptoJs.MD5(Buffer.from(revision.rFile[0])).toString(),
				filename: revision.rFile[0],
				size: 20,
			};

			const params = {
				key: users.tsAdmin.apiKey,
				ts: teamspace,
				projectId: project.id,
				modelId: model._id,
				revision: { ...conRevisions.nonVoidRevision, refData: MD5HashResponseExpectation },
			};

			return [
				['the user does not have a valid session.', { ...params, key: null }, false, templates.notLoggedIn],
				['the teamspace does not exist.', { ...params, ts: ServiceHelper.generateRandomString() }, false, templates.teamspaceNotFound],
				['the user is not a member of the teamspace.', { ...params, key: users.nobody.apiKey }, false, templates.teamspaceNotFound],
				['the user does not have access to the model.', { ...params, key: users.noProjectAccess.apiKey }, false, templates.notAuthorized],
				['the user is viewer.', { ...params, key: users.viewer.apiKey }, true],
				['the user is commenter.', { ...params, key: users.commenter.apiKey }, true],
				['the project does not exist.', { ...params, projectId: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
				['the model does not exist.', { ...params, modelId: ServiceHelper.generateRandomString() }, false, templates.containerNotFound],
				['the model is of wrong type.', { ...params, modelId: models.federation._id }, false, templates.containerNotFound],
				['the revision does not exist.', { ...params, revision: ServiceHelper.generateRevisionEntry() }, false, templates.revisionNotFound],
				['the revision has a file.', params, true],
				['the revision has a file (void revision).', { ...params, revision: voidRevision }, false, templates.revisionNotFound],
			];
		};

		const runTest = (desc, params, success, error) => {
			const route = ({ ts, projectId, modelId, revision, key }) => `/v5/teamspaces/${ts}/projects/${projectId}/containers/${modelId}/revisions/${revision._id}/files/original/info?key=${key}`;

			test(`should ${success ? 'succeed' : `fail with ${error.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : error.status;
				const res = await agent.get(`${route(params)}`).expect(expectedStatus);

				if (success) {
					expect(res.text).toEqual(JSON.stringify(params.revision.refData));
				} else {
					expect(res.body.code).toEqual(error.code);
				}
			});
		};

		describe.each(generateTestData())('Container', runTest);
	});
};

const testGetImage = () => {
	describe('Get Image', () => {
		const basicData = generateBasicData();
		const { users, teamspace, project, models, drawRevisions } = basicData;

		beforeAll(async () => {
			await setupData(basicData);
		});

		const generateTestData = () => {
			const model = models.drawWithRev;
			const revision = drawRevisions.nonVoidRevision;
			const { noFileRevision } = drawRevisions;
			const modelNotFound = templates.drawingNotFound;

			const params = {
				key: users.tsAdmin.apiKey,
				ts: teamspace,
				projectId: project.id,
				modelId: model._id,
				revision,
			};

			return [
				['the user does not have a valid session', { ...params, key: null }, false, templates.notLoggedIn],
				['the teamspace does not exist', { ...params, ts: 'notAvalidTS' }, false, templates.teamspaceNotFound],
				['the user is not a member of the teamspace', { ...params, key: users.nobody.apiKey }, false, templates.teamspaceNotFound],
				['the user does not have access to the model', { ...params, key: users.noProjectAccess.apiKey }, false, templates.notAuthorized],
				['the project does not exist', { ...params, projectId: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
				['the model does not exist', { ...params, modelId: ServiceHelper.generateRandomString() }, false, modelNotFound],
				['the model is of wrong type', { ...params, modelId: models.federation._id }, false, modelNotFound],
				['the revision does not exist', { ...params, revision: ServiceHelper.generateRevisionEntry() }, false, templates.fileNotFound],
				['the revision has no file', { ...params, revision: noFileRevision }, false, templates.fileNotFound],
				['the revision has a file', params, true],
				['the user is viewer', { ...params, key: users.viewer.apiKey }, true],
				['the user is commenter', { ...params, key: users.commenter.apiKey }, true],
			];
		};

		const runTest = (desc, params, success, error) => {
			const route = ({ ts, projectId, modelId, revision, key }) => `/v5/teamspaces/${ts}/projects/${projectId}/drawings/${modelId}/revisions/${revision._id}/files/image?key=${key}`;

			test(`should ${success ? 'succeed' : `fail with ${error.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : error.status;

				const res = await agent.get(`${route(params)}`).expect(expectedStatus);

				if (success) {
					expect(res.body?.toString()).toEqual(params.revision.imageData);
				} else {
					expect(res.body.code).toEqual(error.code);
				}
			});
		};

		describe.each(generateTestData(modelTypes.DRAWING))('Drawing', runTest);
	});
};

describe(ServiceHelper.determineTestGroup(__filename), () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
	});

	afterAll(() => Promise.all([
		ServiceHelper.queue.purgeQueues(),
		ServiceHelper.closeApp(server),
	]));

	testGetRevisions();
	testCreateNewRevision();
	testUpdateRevisionStatus();
	testDownloadRevisionFiles();
	testGetImage();
	testGetRevisionMD5Hash();
});
