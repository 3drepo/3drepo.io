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
const db = require('../handler/db');
const { generateUUID } = require('../utils/helper/uuids');

const CALIBRATIONS_COL = 'drawings.calibrations';

const Calibrations = {};

Calibrations.addCalibration = async (teamspace, project, drawing, revision, createdBy, calibration) => {
	const formattedData = {
		_id: generateUUID(),
		project,
		drawing,
		rev_id: revision,
		createdAt: new Date(),
		createdBy,
		...calibration,
	};

	await db.insertOne(teamspace, CALIBRATIONS_COL, formattedData);
};

Calibrations.getCalibration = (teamspace, project, drawing, revision, projection) => db.findOne(
	teamspace, CALIBRATIONS_COL, { drawing, rev_id: revision, project },
	projection, { createdAt: -1 });

Calibrations.deleteCalibrations = (teamspace, project, drawing) => db.deleteMany(
	teamspace, CALIBRATIONS_COL, { project, drawing });

Calibrations.getCalibrationForMultipleRevisions = (teamspace, revIds, projection) => {
	const formattedProjection = {};

	for (const key in projection) {
		if (projection[key] === 1) {
			formattedProjection[`latestCalibration.${key}`] = 1;
		}
	}

	return db.aggregate(
		teamspace, CALIBRATIONS_COL, [
			{ $match: { rev_id: { $in: revIds } } },
			{ $sort: { createdAt: -1 } },
			{ $group: { _id: '$rev_id', latestCalibration: { $first: '$$ROOT' } } },
			{ $project: { _id: 1, 'latestCalibration._id': 0 } },
			{ $project: { _id: 1, ...formattedProjection } },
		]);
};

module.exports = Calibrations;
