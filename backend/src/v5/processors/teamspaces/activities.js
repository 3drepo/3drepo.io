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
const archiver = require('archiver');
archiver.registerFormat('zip-encrypted', require('archiver-zip-encrypted'));
const { templates: emailTemplates } = require('../../services/mailer/mailer.constants');
const { generateHashString } = require('../../utils/helper/strings');
const { getActivities } = require('../../models/activities');
const { getUserByUsername } = require('../../models/users');
const { sendEmail } = require('../../services/mailer');
const { uuidToString } = require('../../../v4/utils');

const Activities = {};

const createActivitiesZip = (activities) => {
	const jsonBuffer = Buffer.from(JSON.stringify(activities), 'utf8');

	try {
		const password = generateHashString();
		const file = archiver('zip-encrypted', { zlib: { level: 1 }, encryptionMethod: 'aes256', password });
		file.append(jsonBuffer, { name: 'activities.json' });
		file.finalize();
		return { file, password };
	} catch (err) {
		throw createResponseCode(templates.unknown, 'Failed to create zip file.');
	}
};

Activities.getActivitiesFile = async (teamspace, username, fromDate, toDate) => {
	const activities = await getActivities(teamspace, fromDate, toDate);
	const { file, password } = createActivitiesZip(activities.map((a) => ({ ...a, _id: uuidToString(a._id) })));

	const { customData: { email, firstName } } = await getUserByUsername(username, { 'customData.email': 1, 'customData.firstName': 1 });
	await sendEmail(emailTemplates.ACTIVITIES.name, email, { firstName, password });

	return file;
};

module.exports = Activities;
