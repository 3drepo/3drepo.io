'use strict';

/**
 *  Copyright (C) 2019 3D Repo Ltd
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

const { expect } = require('chai');
const SessionTracker = require('../../v5/helper/sessionTracker');
const app = require('../../../src/v4/services/api.js').createApp();
const request = require('supertest');
const IssueHelper = require('../helpers/issues.js');
const { loginUsers } = require('../helpers/users.js');
const async = require('async');
const { orderBy } = require('lodash');

describe('Resources ', function () {
	this.timeout(60000);
	const usernames = ['adminTeamspace1RoleA',
		'viewerTeamspace1Model1RoleC',
		'collaboratorTeamspace1Model1RoleC',
		'collaboratorTeamspace1Model1RoleD',
		'teamSpace1'];

	const password = 'password';
	const account = 'teamSpace1';
	const model = '5bfc11fa-50ac-b7e7-4328-83aa11fa50ac';
	let agents;

	const createIssue = IssueHelper.createIssue(account, model);
	const attachDocs = IssueHelper.attachDocument(account, model);
	const getIssue = IssueHelper.getIssue(account, model);
	const attachUrl = IssueHelper.attachUrl(account, model);
	const detachResource = IssueHelper.detachResourceFromIssue(account, model);

	let server;
	before(async () => {
		agents = await loginUsers(usernames, password);
		server = agents.server;
	});

	after(async () => {
		await agents.done();
	});

	it('of file type should be able to be attached to an issue', (done) => {
		async.waterfall([
			createIssue(agents.adminTeamspace1RoleA),
			attachDocs(agents.adminTeamspace1RoleA, ['firstdocument', 'seconddocument'], ['test_doc.docx', 'dummy.pdf']),
			(refs, next) => {
				expect(refs).to.be.an('array').and.to.have.length(2);
				refs = orderBy(refs, 'name');
				expect(refs[0]).to.contain({ name: 'firstdocument.docx' });
				expect(refs[1]).to.contain({ name: 'seconddocument.pdf' });
				next();
			},
		], done);
	});

	it('of url type should be able to be attached to an issue', (done) => {
		async.waterfall([
			createIssue(agents.adminTeamspace1RoleA),
			attachUrl(agents.adminTeamspace1RoleA, ['homepage', 'blog'], ['http://www.3drepo.com', 'https://3drepo.com/blog/']),
			(refs, next) => {
				expect(refs).to.be.an('array').and.to.have.length(2);
				refs = orderBy(refs, 'name');
				expect(refs[1]).to.contain({ name: 'homepage', link: 'http://www.3drepo.com' });
				expect(refs[0]).to.contain({ name: 'blog', link: 'https://3drepo.com/blog/' });
				next();
			},
		], done);
	});

	it('attached to an issue should appear in the issue after being retrieved', (done) => {
		async.waterfall([
			createIssue(agents.adminTeamspace1RoleA),
			attachDocs(agents.adminTeamspace1RoleA, ['anotherDoc', 'anotherPdf'], ['test_doc.docx', 'dummy.pdf']),
			(refs, next) => {
				const issueId = refs[0].issueIds[0];
				next(null, { _id: issueId });
			},
			attachUrl(agents.adminTeamspace1RoleA, ['homepage', 'blog'], ['http://www.3drepo.com', 'https://3drepo.com/blog/']),
			(refs, next) => {
				const issueId = refs[0].issueIds[0];
				next(null, issueId);
			},
			getIssue(agents.adminTeamspace1RoleA),
			(issue, next) => {
				expect(issue.resources).to.be.an('array').and.to.have.length(4);
				const resources = orderBy(issue.resources, 'name');
				expect(resources[0]).to.contain({ name: 'anotherDoc.docx' });
				expect(resources[1]).to.contain({ name: 'anotherPdf.pdf' });
				expect(resources[2]).to.contain({ name: 'blog', link: 'https://3drepo.com/blog/' });
				expect(resources[3]).to.contain({ name: 'homepage', link: 'http://www.3drepo.com' });
				next();
			},
		], done);
	});

	it('attached resource to issue should be able to be deleted', (done) => {
		async.waterfall([
			createIssue(agents.adminTeamspace1RoleA),
			attachDocs(agents.adminTeamspace1RoleA, ['aPdfFile'], ['dummy.pdf']),
			(refs, next) => {
				const ref = refs[0];
				const issueId = ref.issueIds[0];
				const resourceId = ref._id;

				detachResource(agents.adminTeamspace1RoleA, issueId, resourceId, (err, res) => {
					next(err, issueId);
				});
			},
			getIssue(agents.adminTeamspace1RoleA),
			(issue, next) => {
				expect(issue.resources).to.be.an('array').and.to.have.length(0);
				next();
			},
		], done);
	});

	it('attached resource to issue should be able to be downloaded', (done) => {
		async.waterfall([
			createIssue(agents.adminTeamspace1RoleA),
			attachDocs(agents.adminTeamspace1RoleA, ['anotherDoc', 'anotherPdf'], ['test_doc.docx', 'dummy.pdf']),
			(refs, next) => {
				agents.adminTeamspace1RoleA.get(`/${account}/${model}/resources/${refs[0]._id}`).expect(200, next);
			},
		], done);
	});

	it('attached resource to issue should not be able to be downloaded by unauthorised users', (done) => {
		async.waterfall([
			createIssue(agents.adminTeamspace1RoleA),
			attachDocs(agents.adminTeamspace1RoleA, ['anotherDoc', 'anotherPdf'], ['test_doc.docx', 'dummy.pdf']),
			(refs, next) => {
				request.agent(server).get(`/${account}/${model}/resources/${refs[0]._id}`).expect(401, next);
			},
		], done);
	});
});
