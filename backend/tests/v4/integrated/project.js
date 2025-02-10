'use strict';

/**
 *  Copyright (C) 2017 3D Repo Ltd
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

const request = require('supertest');
const SessionTracker = require('../../v5/helper/sessionTracker');
const { expect } = require('chai');
const app = require('../../../src/v4/services/api.js').createApp();
const logger = require('../../../src/v4/logger.js');

const { systemLogger } = logger;
const responseCodes = require('../../../src/v4/response_codes.js');
const async = require('async');
const C = require('../../../src/v4/constants');
const { findModelSettings } = require('../../../src/v4/models/modelSetting.js');

describe('Projects', () => {
	let server;
	let agent;
	const username = 'projectuser';
	const password = 'projectuser';

	const projectName = 'project_exists';

	const modelIds = ['a05974d0-2a8b-11eb-a58a-fde0111b8800', 'a5cd0670-2a8b-11eb-9358-1ff831483af6', 'ad8a39f0-2a8b-11eb-89a2-59e199077914'];

	const goldenTestModelList = [
		{
			_id: 'a05974d0-2a8b-11eb-a58a-fde0111b8800',
			type: 'type',
			desc: 'desc',
			name: 'TestModel1',
			__v: 0,
			subModels: [],
			surveyPoints: [],
			properties: { unit: 'm', code: '00011' },
			permissions: [
				'change_model_settings',
				'upload_files',
				'create_issue',
				'comment_issue',
				'view_issue',
				'view_model',
				'download_model',
				'edit_federation',
				'delete_federation',
				'delete_model',
				'manage_model_permission',
			],
			status: 'ok',
			id: 'a05974d0-2a8b-11eb-a58a-fde0111b8800',
			model: 'a05974d0-2a8b-11eb-a58a-fde0111b8800',
			account: 'projectuser',
			headRevisions: {},
		},
		{
			_id: 'a5cd0670-2a8b-11eb-9358-1ff831483af6',
			type: 'type',
			desc: 'desc',
			name: 'TestModel2',
			__v: 0,
			subModels: [],
			surveyPoints: [],
			properties: { unit: 'm', code: '00011' },
			permissions: [
				'change_model_settings',
				'upload_files',
				'create_issue',
				'comment_issue',
				'view_issue',
				'view_model',
				'download_model',
				'edit_federation',
				'delete_federation',
				'delete_model',
				'manage_model_permission',
			],
			status: 'ok',
			id: 'a5cd0670-2a8b-11eb-9358-1ff831483af6',
			model: 'a5cd0670-2a8b-11eb-9358-1ff831483af6',
			account: 'projectuser',
			headRevisions: {},
		},
	];

	const goldenRandomNameList = [
		{
			_id: 'ad8a39f0-2a8b-11eb-89a2-59e199077914',
			type: 'type',
			desc: 'desc',
			name: 'RandomName',
			__v: 0,
			subModels: [],
			surveyPoints: [],
			properties: { unit: 'm', code: '00011' },
			permissions: [
				'change_model_settings',
				'upload_files',
				'create_issue',
				'comment_issue',
				'view_issue',
				'view_model',
				'download_model',
				'edit_federation',
				'delete_federation',
				'delete_model',
				'manage_model_permission',
			],
			status: 'ok',
			id: 'ad8a39f0-2a8b-11eb-89a2-59e199077914',
			model: 'ad8a39f0-2a8b-11eb-89a2-59e199077914',
			account: 'projectuser',
			headRevisions: {},
		},
	];

	const goldenFullModelList = [...goldenTestModelList, ...goldenRandomNameList];

	before(async () => {
		await new Promise((resolve) => {
			server = app.listen(8080, () => {
				console.log('API test server is listening on port 8080!');
				resolve();
			});
		});

		agent = SessionTracker(request(server));
		await agent.login(username, password);
	});

	after((done) => {
		server.close(() => {
			console.log('API test server is closed');
			done();
		});
	});

	it('list all projects should succeed', (done) => {
		const goldenProjects = [
			{
				_id: '58f734f4-ca85-3d15-e5eb-0ca000000000',
				name: 'project_exists',
				__v: 3,
				permissions: [
					{ user: 'testing', permissions: [] },
					{ user: 'projectuser', permissions: [] },
				],
				models: [
					'a05974d0-2a8b-11eb-a58a-fde0111b8800',
					'a5cd0670-2a8b-11eb-9358-1ff831483af6',
					'ad8a39f0-2a8b-11eb-89a2-59e199077914',
				],
			},
			{
				_id: '58f73509-ca85-3d15-e5eb-0ca100000000',
				name: 'project2',
				permissions: [
					{ user: 'testing', permissions: [] },
					{ user: 'projectuser', permissions: [] },
				],
				models: [],
			},
			{
				_id: '58f7353e-ca85-3d15-e5eb-0ca200000000',
				name: 'project3',
				permissions: [
					{ user: 'testing', permissions: [] },
					{ user: 'projectuser', permissions: [] },
				],
				models: [],
			},
			{
				_id: '58f73555-ca85-3d15-e5eb-0ca300000000',
				name: 'project4',
				permissions: [
					{ user: 'testing', permissions: [] },
					{ user: 'projectuser', permissions: [] },
				],
				models: [],
			},
		];

		agent.get(`/${username}/projects`)
			.expect(200, (err, res) => {
				expect(res.body).to.deep.equal(goldenProjects);
				done(err);
			});
	});

	it('should able to create project', (done) => {
		const project = {
			name: 'project1',
		};

		async.series([
			(callback) => {
				agent.post(`/${username}/projects`)
					.send(project)
					.expect(200, (err, res) => {
						callback(err);
					});
			},
			(callback) => {
				agent.get(`/${username}.json`)
					.expect(200, (err, res) => {
						const account = res.body.accounts.find((account) => account.account === username);
						expect(account).to.exist;

						const pg = account.projects.find((pg) => pg.name === project.name);
						expect(pg).to.exist;

						callback(err);
					});
			},
		], (err, res) => done(err));
	});

	it('should fail to create project with name default', (done) => {
		agent.post(`/${username}/projects`)
			.send({ name: 'default' })
			.expect(400, (err, res) => {
				expect(res.body.value).to.equal(responseCodes.INVALID_PROJECT_NAME.value);
				done(err);
			});
	});

	it('should fail to create project with dup name', (done) => {
		const project = {
			name: projectName,
		};

		agent.post(`/${username}/projects`)
			.send(project)
			.expect(400, (err, res) => {
				expect(res.body.value).to.equal(responseCodes.PROJECT_EXIST.value);
				done(err);
			});
	});

	it('should fail to create project with invalid name(1)', (done) => {
		const project = {
			name: ' ',
		};

		agent.post(`/${username}/projects`)
			.send(project)
			.expect(400, (err, res) => {
				expect(res.body.value).to.equal(responseCodes.INVALID_PROJECT_NAME.value);
				done(err);
			});
	});

	it('should fail to create project with invalid name(2)', (done) => {
		const project = {
			name: '!?/#&',
		};

		agent.post(`/${username}/projects`)
			.send(project)
			.expect(400, (err, res) => {
				expect(res.body.value).to.equal(responseCodes.INVALID_PROJECT_NAME.value);
				done(err);
			});
	});

	it('should fail to create project with no name', (done) => {
		const project = {
			name: '',
		};

		agent.post(`/${username}/projects`)
			.send(project)
			.expect(400, (err, res) => {
				expect(res.body.value).to.equal(responseCodes.INVALID_PROJECT_NAME.value);
				done(err);
			});
	});

	it('should fail to create project with name longer than 120 characters', (done) => {
		const project = {
			name: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
		};

		agent.post(`/${username}/projects`)
			.send(project)
			.expect(400, (err, res) => {
				expect(res.body.value).to.equal(responseCodes.INVALID_PROJECT_NAME.value);
				done(err);
			});
	});

	it('should be able to update project [DEPRECATED]', (done) => {
		const project = {
			name: 'project2',
			permissions: [{
				user: 'testing',
				permissions: ['create_model', 'edit_project'],
			}],
		};

		async.series([
			(callback) => {
				agent.put(`/${username}/projects/${project.name}`)
					.send(project)
					.expect(200, (err, res) => {
						callback(err);
					});
			},
			(callback) => {
				agent.get(`/${username}/projects/${project.name}`)
					.expect(200, (err, res) => {
						const entriesFiltered = res.body.permissions.filter(((entry) => entry.permissions.length > 0));
						expect(entriesFiltered).to.deep.equal(project.permissions);
						callback(err);
					});
			},
		], (err, res) => done(err));
	});

	it('should be able to update project', (done) => {
		const project = {
			name: 'project2',
			permissions: [{
				user: 'testing',
				permissions: ['create_model', 'edit_project'],
			}],
		};

		async.series([
			(callback) => {
				agent.patch(`/${username}/projects/${project.name}`)
					.send(project)
					.expect(200, (err, res) => {
						callback(err);
					});
			},
			(callback) => {
				agent.get(`/${username}/projects/${project.name}`)
					.expect(200, (err, res) => {
						const entriesFiltered = res.body.permissions.filter(((entry) => entry.permissions.length > 0));
						expect(entriesFiltered).to.deep.equal(project.permissions);
						callback(err);
					});
			},
		], (err, res) => done(err));
	});

	it('should be able to update project permissions', (done) => {
		const projectName = 'project2';
		const project = {
			permissions: [{
				user: 'testing',
				permissions: ['create_model'],
			}],
		};

		async.series([
			(callback) => {
				agent.patch(`/${username}/projects/${projectName}`)
					.send(project)
					.expect(200, (err, res) => {
						callback(err);
					});
			},
			(callback) => {
				agent.get(`/${username}/projects/${projectName}`)
					.expect(200, (err, res) => {
						const entriesFiltered = res.body.permissions.filter(((entry) => entry.permissions.length > 0));
						expect(entriesFiltered).to.deep.equal(project.permissions);
						callback(err);
					});
			},
		], (err, res) => done(err));
	});

	it('should remove all model permissions if a user gets project admin permission', (done) => {
		const project = {
			permissions: [{
				user: 'testing',
				permissions: [C.PERM_PROJECT_ADMIN],
			}],
		};

		async.series([
			(callback) => {
				agent.patch(`/${username}/projects/${projectName}`)
					.send(project)
					.expect(200, (err, res) => {
						callback(err);
					});
			},
			(callback) => {
				agent.get(`/${username}/projects/${projectName}`)
					.expect(200, async (err, res) => {
						const entriesFiltered = res.body.permissions.filter(((entry) => entry.permissions.length > 0));
						expect(entriesFiltered).to.deep.equal(project.permissions);

						const models = await findModelSettings(username, { _id: { $in: modelIds } }, { permissions: 1 });
						const modelsFiltered = models.filter(((entry) => entry.permissions.filter((p) => p.user === 'testing').length));
						expect(modelsFiltered).to.deep.equal([]);

						callback(err);
					});
			},
		], (err, res) => done(err));
	});

	it('should be able to remove project permissions', (done) => {
		const projectName = 'project2';
		const testUser = 'testing';
		const project = {
			permissions: [{
				user: testUser,
				permissions: [],
			}],
		};

		async.series([
			(callback) => {
				agent.patch(`/${username}/projects/${projectName}`)
					.send(project)
					.expect(200, (err, res) => {
						callback(err);
					});
			},
			(callback) => {
				agent.get(`/${username}/projects/${projectName}`)
					.expect(200, (err, res) => {
						expect(res.body.permissions.find((x) => x.user === testUser).permissions.length).to.equal(0);
						callback(err);
					});
			},
		], (err, res) => done(err));
	});

	it('should be able to update project name [DEPRECATED]', (done) => {
		const project = {
			name: 'project2_new',
		};

		async.series([
			(callback) => {
				agent.put(`/${username}/projects/project2`)
					.send(project)
					.expect(200, (err, res) => {
						callback(err);
					});
			},
			(callback) => {
				agent.get(`/${username}.json`)
					.expect(200, (err, res) => {
						const account = res.body.accounts.find((account) => account.account === username);
						expect(account).to.exist;

						const pg = account.projects.find((pg) => pg.name === project.name);
						expect(pg).to.exist;

						callback(err);
					});
			},
		], (err, res) => done(err));
	});

	it('should be able to update project name', (done) => {
		const projectName = 'project2_new';
		const project = {
			name: 'project2',
		};

		async.series([
			(callback) => {
				agent.patch(`/${username}/projects/${projectName}`)
					.send(project)
					.expect(200, (err, res) => {
						callback(err);
					});
			},
			(callback) => {
				agent.get(`/${username}.json`)
					.expect(200, (err, res) => {
						const account = res.body.accounts.find((account) => account.account === username);
						expect(account).to.exist;

						const pg = account.projects.find((pg) => pg.name === project.name);
						expect(pg).to.exist;

						callback(err);
					});
			},
		], (err, res) => done(err));
	});

	it('should fail to update project for invalid permissions [DEPRECATED]', (done) => {
		const project = {
			name: 'project3',
			permissions: [{
				user: 'testing',
				permissions: ['create_issue'],
			}],
		};

		agent.put(`/${username}/projects/${project.name}`)
			.send(project)
			.expect(400, (err, res) => {
				expect(res.body.value).to.equal(responseCodes.INVALID_PERM.value);
				done(err);
			});
	});

	it('should fail to update project for invalid permissions', (done) => {
		const project = {
			name: 'project3',
			permissions: [{
				user: 'testing',
				permissions: ['create_issue'],
			}],
		};

		agent.patch(`/${username}/projects/${project.name}`)
			.send(project)
			.expect(400, (err, res) => {
				expect(res.body.value).to.equal(responseCodes.INVALID_PERM.value);
				done(err);
			});
	});

	it('should fail to assign permission to unlicensed user [DEPRECATED]', (done) => {
		const project = {
			name: 'project3',
			permissions: [{
				user: 'metaTest',
				permissions: ['edit_project'],
			}],
		};

		agent.patch(`/${username}/projects/${project.name}`)
			.send(project)
			.expect(400, (err, res) => {
				expect(res.body.value).to.equal(responseCodes.USER_NOT_ASSIGNED_WITH_LICENSE.value);
				done(err);
			});
	});

	it('should fail to assign permission to unlicensed user [DEPRECATED]', (done) => {
		const project = {
			name: 'project3',
			permissions: [{
				user: 'metaTest',
				permissions: ['edit_project'],
			}],
		};

		agent.put(`/${username}/projects/${project.name}`)
			.send(project)
			.expect(400, (err, res) => {
				expect(res.body.value).to.equal(responseCodes.USER_NOT_ASSIGNED_WITH_LICENSE.value);
				done(err);
			});
	});

	it('should fail to assign permission to unlicensed user', (done) => {
		const project = {
			name: 'project3',
			permissions: [{
				user: 'metaTest',
				permissions: ['edit_project'],
			}],
		};

		agent.patch(`/${username}/projects/${project.name}`)
			.send(project)
			.expect(400, (err, res) => {
				expect(res.body.value).to.equal(responseCodes.USER_NOT_ASSIGNED_WITH_LICENSE.value);
				done(err);
			});
	});

	it('should fail to update a project that doesnt exist [DEPRECATED]', (done) => {
		agent.put(`/${username}/projects/notexist`)
			.send({})
			.expect(404, (err, res) => {
				expect(res.body.value).to.equal(responseCodes.PROJECT_NOT_FOUND.value);
				done(err);
			});
	});

	it('should fail to update a project that doesnt exist', (done) => {
		agent.patch(`/${username}/projects/notexist`)
			.send({})
			.expect(404, (err, res) => {
				expect(res.body.value).to.equal(responseCodes.PROJECT_NOT_FOUND.value);
				done(err);
			});
	});

	it('should fail to delete a project that doesnt exist', (done) => {
		agent.delete(`/${username}/projects/notexist`)
			.expect(404, (err, res) => {
				expect(res.body.value).to.equal(responseCodes.PROJECT_NOT_FOUND.value);
				done(err);
			});
	});

	it('list all project models should fail;', (done) => {
		agent.get(`/${username}/projects/${projectName}/models`)
			.expect(v5Responses.endpointDecomissioned.status, (err, res) => {
				expect(res.body).to.equal({
					...v5Responses.endpointDecomissioned
					message: `This endpoint is no longer available. Please use GET /v5/teamspaces/{teamspace}/projects/{project}/{modelType} instead.`
				});
				done(err);
			});
	});


	it('should able to delete project', (done) => {
		const project = {
			name: 'project_exists',
		};

		async.series([
			(callback) => {
				agent.delete(`/${username}/projects/${project.name}`)
					.expect(200, (err, res) => {
						callback(err);
					});
			},
			(callback) => {
				agent.get(`/${username}.json`)
					.expect(200, (err, res) => {
						const account = res.body.accounts.find((account) => account.account === username);
						expect(account).to.exist;

						const pg = account.projects.find((pg) => pg.name === project.name);
						expect(pg).to.not.exist;

						callback(err);
					});
			},
		], (err, res) => done(err));
	});

	it('should able to delete empty project', (done) => {
		const project = {
			name: 'project4',
		};

		async.series([
			(callback) => {
				agent.delete(`/${username}/projects/${project.name}`)
					.expect(200, (err, res) => {
						callback(err);
					});
			},
			(callback) => {
				agent.get(`/${username}.json`)
					.expect(200, (err, res) => {
						const account = res.body.accounts.find((account) => account.account === username);
						expect(account).to.exist;

						const pg = account.projects.find((pg) => pg.name === project.name);
						expect(pg).to.not.exist;

						callback(err);
					});
			},
		], (err, res) => done(err));
	});

	it('should fail to delete a project that doesnt exist', (done) => {
		agent.delete(`/${username}/projects/notexist`)
			.expect(404, (err, res) => {
				expect(res.body.value).to.equal(responseCodes.PROJECT_NOT_FOUND.value);
				done(err);
			});
	});
});
