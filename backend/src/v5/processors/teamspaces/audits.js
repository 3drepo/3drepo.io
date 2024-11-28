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

const { PassThrough } = require('stream');
const Yup = require('yup');
const archiver = require('archiver');
archiver.registerFormat('zip-encrypted', require('archiver-zip-encrypted'));
const { templates: emailTemplates } = require('../../services/mailer/mailer.constants');
const { generateHashString } = require('../../utils/helper/strings');
const { getActionLog } = require('../../models/teamspaces.audits');
const { getUserByUsername } = require('../../models/users');
const { logger } = require('../../utils/logger');
const { sendEmail } = require('../../services/mailer');
const { templates } = require('../../utils/responseCodes');
const { types } = require('../../utils/helper/yup');

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

		const contentsStream = new PassThrough();

		const actionSchema = Yup.object({
			data: Yup.object({
				permissions: Yup.array().of(Yup.object({
					project: types.id,
				})),
			}),
			timestamp: types.timestamp,
		});

		contentsStream.write('[');
		actions.forEach(({ _id, ...data }, index) => {
			const formattedData = actionSchema.cast(data);
			contentsStream.write(`${JSON.stringify(formattedData)}`);
			if (index !== actions.length - 1) {
				contentsStream.write(', ');
			}
		});
		contentsStream.write(']');
		contentsStream.end();

		archive.append(contentsStream, { name: 'audit.json' });

		const archiveReady = new Promise((resolve, reject) => {
			archive.on('end', resolve);
			archive.on('error', (err) => reject(err));
			archive.pipe(stream);
		});

		archive.finalize();
		await archiveReady;
		return { archive: stream, password };
	} catch (err) {
		logger.logError(err);
		throw templates.unknown;
	}
};

Audit.getAuditLogArchive = async (teamspace, username, fromDate, toDate) => {
	const actions = await getActionLog(teamspace, fromDate, toDate);
	const { archive, password } = await createAuditLogArchive(actions);
	const { customData: { email, firstName } } = await getUserByUsername(username, { 'customData.email': 1, 'customData.firstName': 1 });
	await sendEmail(emailTemplates.AUDIT_LOG_PASSWORD.name, email, { firstName, password });

	return archive;
};

module.exports = Audit;
