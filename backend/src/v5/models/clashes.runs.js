/**
 *  Copyright (C) 2026 3D Repo Ltd
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

const { CLASH_RUNS_COL, CLASH_RUN_STATUS } = require('./clashes.constants');
const db = require('../handler/db');
const { generateUUID } = require('../utils/helper/uuids');

const ClashRuns = {};

ClashRuns.createTestRun = async (teamspace, plan, user) => {
	const _id = generateUUID();

	await db.insertOne(teamspace, CLASH_RUNS_COL, {
		_id,
		triggeredBy: user,
		triggeredAt: new Date(),
		status: CLASH_RUN_STATUS.PLANNED,
		plan,
	});

	return _id;
};

ClashRuns.completeTestRun = async (teamspace, runId) => {
	await db.updateOne(teamspace, CLASH_RUNS_COL, { _id: runId },
		{ $set: { status: CLASH_RUN_STATUS.COMPLETED, completedAt: new Date() } });
};

module.exports = ClashRuns;
