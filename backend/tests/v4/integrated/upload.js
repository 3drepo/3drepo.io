'use strict';

/**
 *  Copyright (C) 2014 3D Repo Ltd
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

const { queue: {purgeQueues}} = require("../../v5/helper/services");
const request = require('supertest');
const { expect } = require('chai');
const app = require('../../../src/v4/services/api.js').createApp();
const logger = require('../../../src/v4/logger.js');
const C = require('../../../src/v4/constants');
const responseCodes = require('../../../src/v4/response_codes.js');
const { templates:responseCodesV5 } = require('../../../src/v5/utils/responseCodes');
const helpers = require('../helpers/signUp');
const moment = require('moment');
const async = require('async');

describe('Uploading a model', () => {
	const User = require('../../../src/v4/models/user');
	let server;
	let agent;
	const username = 'upload_username';
	const password = 'Str0ngPassword!';
	const email = 'test3drepo_upload@mailinator.com';
	const model1 = { name: 'model1'};
	const model2 = { name: 'model2'};
	const model3 = { name: 'model3'};
	const desc = 'desc';
	const type = 'type';
	const unit = 'meter';
	const project = 'sample';

	before((done) => {
		server = app.listen(8080, () => {
			console.log('API test server is listening on port 8080!');

			async.series([
				function (done) {
					helpers.signUpAndLogin({
						server,
						request,
						agent,
						expect,
						User,
						username,
						password,
						email,
						desc,
						type,
						noBasicPlan: true,
						unit,
						done(err, _agent) {
							agent = _agent;
							done(err);
						},
					});
				},
				function (done) {
					agent.post(`/${username}/model`)
					.send({ type, desc, unit, modelName: model1.name, project })
					.expect(200, (err, res) => {
						model1.id = res.body.model;
						done(err);
					});
				},
				function (done) {
					agent.post(`/${username}/model`)
					.send({ type, desc, unit, modelName: model2.name, project })
					.expect(200, (err, res) => {
						model2.id = res.body.model;
						done(err);
					});
				},
				function (done) {
					agent.post(`/${username}/model`)
					.send({ type, desc, unit, modelName: model3.name, project })
					.expect(200, (err, res) => {
						model3.id = res.body.model;
						done(err);
					});
				},
			], done);
		});
	});

	after(function(done) {
		purgeQueues().then(() => {
			server.close(function() {
				console.log("API test server is closed");
				done();
			});
		});
	});
	describe('without quota', () => {
		it('should return error (no subscriptions)', (done) => {
			agent.post(`/${username}/${model1.id}/upload`)
				.field('tag', 'no_quota')
				.attach('file', `${__dirname}/../statics/3dmodels/8000cubes.obj`)
				.expect(401, (err, res) => {
					expect(res.body.code).to.equal(responseCodesV5.quotaLimitExceeded.code);
					done(err);
				});
		});
	});

	describe('with not enough quota', () => {
		before(async () => {
			const subscriptions = {
				discretionary: {
					collaborators: 2,
					data: 4,
					expiryDate: moment().utc().add(1, 'month').valueOf(),
				},
			};

			await User.updateSubscriptions(username, subscriptions);
		});

		it('should return error (has a subscription but ran out of space)', (done) => {
			agent.post(`/${username}/${model1.id}/upload`)
				.field('tag', 'no_space')
				.attach('file', `${__dirname}/../statics/3dmodels/8000cubes.obj`)
				.expect(401, (err, res) => {
					expect(res.body.code).to.equal(responseCodesV5.quotaLimitExceeded.code);
					done(err);
				});
		});
	});

	describe('with quota', () => {
		before(async () => {
			// give some money to this guy
			const subscriptions = {
				discretionary: {
					collaborators: 2,
					data: 1024,
					expiryDate: moment().utc().add(1, 'month').valueOf(),
				},
			};

			await User.updateSubscriptions(username, subscriptions);
		});

		it('should succeed', async () => {
			await agent.post(`/${username}/${model1.id}/upload`)
				.field('tag', 'with_quota')
				.attach('file', `${__dirname}/../statics/3dmodels/8000cubes.obj`)
				.expect(200);
		});
		it('should succeed (uppercase extension)', (done) => {
			agent.post(`/${username}/${model2.id}/upload`)
				.field('tag', 'uppercase_ext')
				.attach('file', `${__dirname}/../statics/3dmodels/upper.OBJ`)
				.expect(200, (err, res) => {
					done(err);
				});
		});

		it('but without tag should fail', (done) => {
			agent.post(`/${username}/${model1.id}/upload`)
				.attach('file', `${__dirname}/../statics/3dmodels/8000cubes.obj`)
				.expect(400, (err, res) => {
					expect(res.body.code).to.equal(responseCodesV5.invalidArguments.code);
					done(err);
				});
		});

		it('but with invalid tag should fail', (done) => {
			agent.post(`/${username}/${model1.id}/upload`)
				.field('tag', 'bad tag!')
				.attach('file', `${__dirname}/../statics/3dmodels/8000cubes.obj`)
				.expect(400, (err, res) => {
					expect(res.body.code).to.equal(responseCodesV5.invalidArguments.code);
					done(err);
				});
		});

		it('but empty file size should fail', (done) => {
			agent.post(`/${username}/${model1.id}/upload`)
				.field('tag', 'empty_file')
				.attach('file', `${__dirname}/../statics/3dmodels/empty.ifc`)
				.expect(400, (err, res) => {
					expect(res.body.code).to.equal(responseCodesV5.invalidArguments.code);
					done(err);
				});
		});

		it('but unaccepted extension should failed', (done) => {
			agent.post(`/${username}/${model1.id}/upload`)
				.field('tag', 'unsupported_ext')
				.attach('file', `${__dirname}/../statics/3dmodels/toy.abc`)
				.expect(400, (err, res) => {
					expect(res.body.code).to.equal(responseCodesV5.unsupportedFileFormat.code);
					done(err);
				});
		});

		it('but no extension should failed', (done) => {
			agent.post(`/${username}/${model1.id}/upload`)
				.field('tag', 'no_ext')
				.attach('file', `${__dirname}/../statics/3dmodels/toy`)
				.expect(400, (err, res) => {
					expect(res.body.code).to.equal(responseCodesV5.unsupportedFileFormat.code);
					done(err);
				});
		});

		it('but file size exceeded fixed single file size limit should fail', (done) => {
			agent.post(`/${username}/${model3.id}/upload`)
				.field('tag', 'too_big')
				.attach('file', `${__dirname}/../statics/3dmodels/toy.ifc`)
				.expect(400, (err, res) => {
					expect(res.body.code).to.equal(responseCodesV5.maxSizeExceeded.code);
					done(err);
				});
		});
	});

	describe('MS Logic Apps chunking', () => {
		let corID1;
		let corID2;

		describe('Initialise chunking request', () => {
			it('with invalid model should fail', (done) => {
				agent.post(`/${username}/invalidModel/upload/ms-chunking`)
					.send({
						filename: 'file.ifc',
						tag: 'rev0',
					})
					.expect(404, (err, res) => {
						expect(res.body.value).to.equal(responseCodes.MODEL_NOT_FOUND.code);
						done(err);
					});
			});

			it('without filename should fail', (done) => {
				agent.post(`/${username}/${model1.id}/upload/ms-chunking`)
					.send({ tag: 'no_filename' })
					.expect(400, (err, res) => {
						expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
						done(err);
					});
			});

			it('without tag should fail', (done) => {
				agent.post(`/${username}/${model1.id}/upload/ms-chunking`)
					.send({ filename: 'no_tag.ifc' })
					.expect(400, (err, res) => {
						expect(res.body.value).to.equal(responseCodes.INVALID_TAG_NAME.value);
						done(err);
					});
			});

			it('with invalid tag should fail', (done) => {
				agent.post(`/${username}/${model1.id}/upload/ms-chunking`)
					.send({
						filename: 'file.ifc',
						tag: 'bad tag!',
					})
					.expect(400, (err, res) => {
						expect(res.body.value).to.equal(responseCodes.INVALID_TAG_NAME.value);
						done(err);
					});
			});

			it('duplicate tag should fail', (done) => {
				agent.post(`/${username}/${model1.name}/upload/ms-chunking`)
					.send({
						filename: 'file.ifc',
						tag: 'tag_exists',
					})
					.expect(400, (err, res) => {
						expect(res.body.value).to.equal(responseCodes.DUPLICATE_TAG.value);
						done(err);
					});
			});

			it('with no file extension should fail', (done) => {
				agent.post(`/${username}/${model1.id}/upload/ms-chunking`)
					.send({
						filename: 'cubes',
						tag: 'id1',
					})
					.expect(400, (err, res) => {
						expect(res.body.value).to.equal(responseCodes.FILE_NO_EXT.value);
						done(err);
					});
			});

			it('with unsupported file should fail', (done) => {
				agent.post(`/${username}/${model1.id}/upload/ms-chunking`)
					.send({
						filename: 'cubes.pdf',
						tag: 'id1',
					})
					.expect(400, (err, res) => {
						expect(res.body.value).to.equal(responseCodes.FILE_FORMAT_NOT_SUPPORTED.value);
						done(err);
					});
			});

			it('without description should succeed', (done) => {
				agent.post(`/${username}/${model1.id}/upload/ms-chunking`)
					.send({
						filename: 'cubes.obj',
						tag: 'id1',
					})
					.expect(200, (err, res) => {
						corID1 = res.body.corID;
						done(err);
					});
			});

			it('should succeed', (done) => {
				agent.post(`/${username}/${model1.id}/upload/ms-chunking`)
					.send({
						filename: 'cubes.obj',
						tag: 'id2',
						desc: 'Revision 2',
					})
					.expect(200, (err, res) => {
						corID2 = res.body.corID;
						done(err);
					});
			});
		});

		describe('Start MS chunk upload', () => {
			it('with invalid model should fail', (done) => {
				agent.post(`/${username}/invalidModel/upload/ms-chunking/${corID1}`)
					.set('x-ms-transfer-mode', 'chunked')
					.set('x-ms-content-length', 6425218)
					.expect(404, (err, res) => {
						expect(res.body.value).to.equal(responseCodes.MODEL_NOT_FOUND.code);
						done(err);
					});
			});

			it('with invalid correlation ID should fail', (done) => {
				agent.post(`/${username}/${model1.id}/upload/ms-chunking/invalidCorID`)
					.set('x-ms-transfer-mode', 'chunked')
					.set('x-ms-content-length', 6425218)
					.expect(404, (err, res) => {
						expect(res.body.value).to.equal(responseCodes.CORRELATION_ID_NOT_FOUND.value);
						done(err);
					});
			});

			it('without transfer mode header should fail', (done) => {
				agent.post(`/${username}/${model1.id}/upload/ms-chunking/${corID1}`)
					.set('x-ms-content-length', 6425218)
					.expect(400, (err, res) => {
						expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
						done(err);
					});
			});

			it('should fail if transfer mode not chunked', (done) => {
				agent.post(`/${username}/${model1.id}/upload/ms-chunking/${corID1}`)
					.set('x-ms-transfer-mode', 'normal')
					.set('x-ms-content-length', 6425218)
					.expect(400, (err, res) => {
						expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
						done(err);
					});
			});

			it('without content length header should fail', (done) => {
				agent.post(`/${username}/${model1.id}/upload/ms-chunking/${corID1}`)
					.set('x-ms-transfer-mode', 'chunked')
					.expect(400, (err, res) => {
						expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
						done(err);
					});
			});

			it('with NaN content length header should fail', (done) => {
				agent.post(`/${username}/${model1.id}/upload/ms-chunking/${corID1}`)
					.set('x-ms-transfer-mode', 'chunked')
					.set('x-ms-content-length', '100MB')
					.expect(400, (err, res) => {
						expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
						done(err);
					});
			});

			it('should succeed', (done) => {
				agent.post(`/${username}/${model1.id}/upload/ms-chunking/${corID1}`)
					.set('x-ms-transfer-mode', 'chunked')
					.set('x-ms-content-length', 6425218)
					.expect(200, (err, res) => {
						expect(parseInt(res.headers['x-ms-chunk-size'])).to.equal(6425218);
						expect(res.headers.location).to.exist;
						done(err);
					});
			});

			it('should succeed if string is number', (done) => {
				agent.post(`/${username}/${model1.id}/upload/ms-chunking/${corID2}`)
					.set('x-ms-transfer-mode', 'chunked')
					.set('x-ms-content-length', '6425218')
					.expect(200, (err, res) => {
						expect(parseInt(res.headers['x-ms-chunk-size'])).to.equal(6425218);
						expect(res.headers.location).to.exist;
						done(err);
					});
			});
		});

		describe('Upload model chunk', () => {
			it('with invalid correlation ID should fail', (done) => {
				agent.patch(`/${username}/${model1.id}/upload/ms-chunking/invalidCorID`)
					.set('Content-Range', 'bytes 0-2999999/6425218')
					.set('Content-Type', 'application/octet-stream')
					.set('Content-Length', 'bytes=3000000')
					.attach('file', `${__dirname}/../statics/3dmodels/chunk0.obj`)
					.expect(404, (err, res) => {
						expect(res.body.value).to.equal(responseCodes.CORRELATION_ID_NOT_FOUND.value);
						done(err);
					});
			});

			it('without content-range header should fail', (done) => {
				agent.patch(`/${username}/${model1.id}/upload/ms-chunking/${corID1}`)
					.set('Content-Type', 'application/octet-stream')
					.set('Content-Length', 'bytes=3000000')
					.attach('file', `${__dirname}/../statics/3dmodels/chunk0.obj`)
					.expect(400, (err, res) => {
						expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
						done(err);
					});
			});

			it('content-range header not in bytes should fail', (done) => {
				agent.patch(`/${username}/${model1.id}/upload/ms-chunking/${corID1}`)
					.set('Content-Range', 'kilobytes 0-2999999/6425218')
					.set('Content-Type', 'application/octet-stream')
					.set('Content-Length', 'bytes=3000000')
					.attach('file', `${__dirname}/../statics/3dmodels/chunk0.obj`)
					.expect(400, (err, res) => {
						expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
						done(err);
					});
			});

			it('content-range header not separated by space should fail', (done) => {
				agent.patch(`/${username}/${model1.id}/upload/ms-chunking/${corID1}`)
					.set('Content-Range', 'bytes=0-2999999/6425218')
					.set('Content-Type', 'application/octet-stream')
					.set('Content-Length', 'bytes=3000000')
					.attach('file', `${__dirname}/../statics/3dmodels/chunk0.obj`)
					.expect(400, (err, res) => {
						expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
						done(err);
					});
			});

			it('chunk too large should fail', (done) => {
				agent.patch(`/${username}/${model1.id}/upload/ms-chunking/${corID1}`)
					.set('Content-Range', 'bytes 0-52428799/52428800')
					.set('Content-Type', 'application/octet-stream')
					.set('Content-Length', 'bytes=52428800')
					.attach('file', `${__dirname}/../statics/3dmodels/big0.ifc`)
					.expect(400, (err, res) => {
						expect(res.body.value).to.equal(responseCodes.SIZE_LIMIT.value);
						done(err);
					});
			});

			it('should succeed', (done) => {
				agent.patch(`/${username}/${model1.id}/upload/ms-chunking/${corID1}`)
					.set('Content-Range', 'bytes 0-2999999/6425218')
					.set('Content-Type', 'application/octet-stream')
					.set('Content-Length', 'bytes=3000000')
					.attach('file', `${__dirname}/../statics/3dmodels/chunk0.obj`)
					.expect(200, (err, res) => {
						expect(res.headers.range).to.equal('bytes=0-2999999');
						expect(parseInt(res.headers['x-ms-chunk-size'])).to.equal(3425218);
						done(err);
					});
			});

			it('with other valid correlation IDs should succeed', (done) => {
				agent.patch(`/${username}/${model1.id}/upload/ms-chunking/${corID2}`)
					.set('Content-Range', 'bytes 0-2999999/6425218')
					.set('Content-Type', 'application/octet-stream')
					.set('Content-Length', 'bytes=3000000')
					.attach('file', `${__dirname}/../statics/3dmodels/chunk0.obj`)
					.expect(200, (err, res) => {
						expect(res.headers.range).to.equal('bytes=0-2999999');
						expect(parseInt(res.headers['x-ms-chunk-size'])).to.equal(3425218);
						done(err);
					});
			});

			it('second chunk should succeed', (done) => {
				agent.patch(`/${username}/${model1.id}/upload/ms-chunking/${corID1}`)
					.set('Content-Range', 'bytes 3000000-5999999/6425218')
					.set('Content-Type', 'application/octet-stream')
					.set('Content-Length', 'bytes=3000000')
					.attach('file', `${__dirname}/../statics/3dmodels/chunk1.obj`)
					.expect(200, (err, res) => {
						const nextChunkSize = Math.min(C.MS_CHUNK_BYTES_LIMIT, 425218);
						expect(res.headers.range).to.equal('bytes=0-5999999');
						expect(parseInt(res.headers['x-ms-chunk-size'])).to.equal(nextChunkSize);
						done(err);
					});
			});

			it('final chunk should succeed', (done) => {
				agent.patch(`/${username}/${model1.id}/upload/ms-chunking/${corID1}`)
					.set('Content-Range', 'bytes 6000000-6425217/6425218')
					.set('Content-Type', 'application/octet-stream')
					.set('Content-Length', 'bytes=425218')
					.attach('file', `${__dirname}/../statics/3dmodels/chunk2.obj`)
					.expect(200, (err, res) => {
						expect(res.headers.range).to.equal('bytes=0-6425217');
						expect(parseInt(res.headers['x-ms-chunk-size'])).to.equal(0);
						done(err);
					});
			});

			it('file larger than expected should fail', (done) => {
				async.series([
					function (done) {
						agent.patch(`/${username}/${model1.id}/upload/ms-chunking/${corID2}`)
							.set('Content-Range', 'bytes 3000000-5999999/6425218')
							.set('Content-Type', 'application/octet-stream')
							.set('Content-Length', 'bytes=3000000')
							.attach('file', `${__dirname}/../statics/3dmodels/big1.ifc`)
							.expect(200, (err, res) => {
								const nextChunkSize = Math.min(C.MS_CHUNK_BYTES_LIMIT, 425218);
								expect(res.headers.range).to.equal('bytes=0-5999999');
								expect(parseInt(res.headers['x-ms-chunk-size'])).to.equal(nextChunkSize);
								done(err);
							});
					},
					function (done) {
						agent.patch(`/${username}/${model1.id}/upload/ms-chunking/${corID2}`)
							.set('Content-Range', 'bytes 6000000-6425217/6425218')
							.set('Content-Type', 'application/octet-stream')
							.set('Content-Length', 'bytes=425218')
							.attach('file', `${__dirname}/../statics/3dmodels/big2.ifc`)
							.expect(400, (err, res) => {
								expect(res.body.value).to.equal(responseCodes.SIZE_LIMIT.value);
								done(err);
							});
					},
				], done);
			});
		});
	});
});
