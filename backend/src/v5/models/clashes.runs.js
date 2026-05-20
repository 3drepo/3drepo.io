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
const { templates } = require('../utils/responseCodes');

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

ClashRuns.completeTestRun = async (teamspace, runId, resultId) => {
	await db.updateOne(teamspace, CLASH_RUNS_COL, { _id: runId },
		{ $set: { status: CLASH_RUN_STATUS.COMPLETED, completedAt: new Date(), result: resultId } });
};

ClashRuns.getTestRunByQuery = async (teamspace, query, projection, sort) => {
	const run = await db.findOne(teamspace, CLASH_RUNS_COL, query, projection, sort);

	if (!run) {
		throw templates.testRunNotFound;
	}

	return run;
};

ClashRuns.getLastRunFromPlan = (teamspace, planId) => db.findOne(teamspace, CLASH_RUNS_COL, { 'plan._id': planId }, { sort: { createdAt: -1 } });

module.exports = ClashRuns;
