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

const { createResponseCode, templates } = require('../../utils/responseCodes');
const { PassThrough } = require('stream');
const archiver = require('archiver');
archiver.registerFormat('zip-encrypted', require('archiver-zip-encrypted'));
const { templates: emailTemplates } = require('../../services/mailer/mailer.constants');
const { generateHashString } = require('../../utils/helper/strings');
const { getActionLog } = require('../../models/teamspaces.audits');
const { getUserByUsername } = require('../../models/users');
const { sendEmail } = require('../../services/mailer');

const Audit = {};

const createAuditLogArchive = async (actions) => {
	try {
		const password = generateHashString();
		const stream = new PassThrough();

		const archive = archiver.create('zip-encrypted', {
			zlib: { level: 1 },
			encryptionMethod: 'aes256',
			password,
		});

		const content = `[${actions.map((action) => JSON.stringify(action)).join(',')}]`;
		archive.append(content, { name: 'audit.json' });

		const archiveReady = new Promise((resolve, reject) => {
			archive.on('end', resolve);
			archive.on('error', reject);
			archive.pipe(stream);
		});

		archive.finalize();
		await archiveReady;

		return { archive: stream, password };
	} catch (err) {
		throw createResponseCode(templates.unknown, `Failed to create zip file: ${err.message}`);
	}
};

Audit.getAuditLogArchive = async (teamspace, username, fromDate, toDate) => {
	const actions = await getActionLog(teamspace, fromDate, toDate);
	const { archive, password } = await createAuditLogArchive(actions.map(({ _id, ...data }) => data));
	const { customData: { email, firstName } } = await getUserByUsername(username, { 'customData.email': 1, 'customData.firstName': 1 });
	await sendEmail(emailTemplates.AUDIT.name, email, { firstName, password });

	return archive;
};

module.exports = Audit;
