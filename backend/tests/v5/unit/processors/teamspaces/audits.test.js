/**
 *  Copyright (C) 2024 3D Repo Ltd
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

const { src } = require('../../../helper/path');
const { times } = require('lodash');

const { generateRandomString, generateRandomObject, generateUUID } = require('../../../helper/services');
const { templates } = require('../../../../../src/v5/utils/responseCodes');

const { templates: emailTemplates } = require(`${src}/services/mailer/mailer.constants`);

const Audits = require(`${src}/processors/teamspaces/audits`);

jest.mock('../../../../../src/v5/models/teamspaces.audits');
const AuditsModel = require(`${src}/models/teamspaces.audits`);

jest.mock('../../../../../src/v5/services/mailer');
const Mailer = require(`${src}/services/mailer`);

jest.mock('../../../../../src/v5/models/users');
const UsersModel = require(`${src}/models/users`);

jest.mock('archiver');
const Archiver = require('archiver');

const testGetAuditLogArchive = () => {
	describe('Get Audit Log Archive', () => {
		const teamspace = generateRandomString();
		const username = generateRandomString();
		const email = generateRandomString();
		const firstName = generateRandomString();
		const fromDate = generateRandomString();
		const toDate = generateRandomString();
		const actions = times(5, () => ({ _id: generateUUID(), ...generateRandomObject() }));

		test('should get audit log archive and send an email with the password', async () => {
			Archiver.registerFormat.mockReturnValueOnce(undefined);
			Archiver.create.mockReturnValueOnce({
				append: () => {},
				finalize: () => {},
			});

			AuditsModel.getActionLog.mockResolvedValueOnce(actions);
			UsersModel.getUserByUsername.mockResolvedValueOnce({ customData: { email, firstName } });

			await Audits.getAuditLogArchive(teamspace, username, fromDate, toDate);

			expect(AuditsModel.getActionLog).toHaveBeenCalledTimes(1);
			expect(AuditsModel.getActionLog).toHaveBeenCalledWith(teamspace, fromDate, toDate);
			expect(UsersModel.getUserByUsername).toHaveBeenCalledTimes(1);
			expect(UsersModel.getUserByUsername).toHaveBeenCalledWith(username, { 'customData.email': 1, 'customData.firstName': 1 });
			expect(Mailer.sendEmail).toHaveBeenCalledTimes(1);
			const { password } = Mailer.sendEmail.mock.calls[0][2];
			expect(Mailer.sendEmail).toHaveBeenCalledWith(emailTemplates.AUDIT.name, email,
				{ firstName, password });
		});

		test('should return error if an archiver method fails', async () => {
			Archiver.registerFormat.mockReturnValueOnce(undefined);
			Archiver.create.mockImplementationOnce(() => { throw new Error(); });

			AuditsModel.getActionLog.mockResolvedValueOnce(actions);

			await expect(Audits.getAuditLogArchive(teamspace, username, fromDate, toDate))
				.rejects.toEqual({ ...templates.unknown, message: 'Failed to create zip file.' });

			expect(AuditsModel.getActionLog).toHaveBeenCalledTimes(1);
			expect(AuditsModel.getActionLog).toHaveBeenCalledWith(teamspace, fromDate, toDate);
			expect(UsersModel.getUserByUsername).not.toHaveBeenCalled();
			expect(Mailer.sendEmail).not.toHaveBeenCalled();
		});
	});
};

describe('processors/teamspaces/audits', () => {
	testGetAuditLogArchive();
});
