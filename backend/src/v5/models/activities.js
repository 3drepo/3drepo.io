/**
 *  Copyright (C) 2022 3D Repo Ltd
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

const Activities = {};
const db = require('../handler/db');
const { generateUUID } = require('../utils/helper/uuids');

const COL_NAME = 'activities';

Activities.addActivity = async (teamspace, action, executor, data) => {
	const formattedData = {
		...data,
		executor,
		action,
		_id: generateUUID(),
		timestamp: new Date(),
	};

	await db.insertOne(teamspace, COL_NAME, formattedData);
};

module.exports = Activities;
