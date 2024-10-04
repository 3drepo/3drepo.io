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
const { getActivities } = require('../../models/activities');
const { uuidToString } = require('../../../v4/utils');

const Activities = {};

const createActivitiesZip = (activities) => {
	const jsonBuffer = Buffer.from(JSON.stringify(activities), 'utf8');

	try {
		const file = archiver('zip', { zlib: { level: 1 } });
		file.append(jsonBuffer, { name: 'data.json' });
		file.finalize();
		return file;
	} catch (err) {
		throw createResponseCode(templates.unknown, 'Failed to create zip file.');
	}
};

Activities.getActivitiesFile = async (teamspace, from, to) => {
	const activities = await getActivities(teamspace, from, to);
	const file = createActivitiesZip(activities.map((a) => ({ ...a, _id: uuidToString(a._id) })));
	return file;
};

module.exports = Activities;
