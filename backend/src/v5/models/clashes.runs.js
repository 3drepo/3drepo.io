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

const { CLASH_RUNS_COL, clashRunStatus } = require('./clashes.constants');
const db = require('../handler/db');
const { deleteIfUndefined } = require('../utils/helper/objects');
const { generateUUID } = require('../utils/helper/uuids');
const { logger } = require('../utils/logger');
const { templates } = require('../utils/responseCodes');

const ClashRuns = {};

const ensureIndexExists = async (teamspace) => {
	try {
		await db.createIndex(teamspace, CLASH_RUNS_COL,
			{ project: 1, 'plan._id': 1, updatedAt: -1 }, { runInBackground: true });
	} catch (err) {
		logger.logError(`Failed to create index for clash runs in teamspace ${teamspace}: ${err.message}`);
	}
};

ClashRuns.createClashRun = async (teamspace, project, plan, user) => {
	await ensureIndexExists(teamspace);
	const _id = generateUUID();
	const timestamp = new Date();

	await db.insertOne(teamspace, CLASH_RUNS_COL, {
		_id,
		project,
		triggeredBy: user,
		triggeredAt: timestamp,
		updatedAt: timestamp,
		status: clashRunStatus.PLANNED,
		plan,
	});

	return _id;
};

const updateClashRun = async (teamspace, project, runId, setUpdate) => {
	await db.updateOne(teamspace, CLASH_RUNS_COL, { project, _id: runId },
		{ $set: { ...setUpdate, updatedAt: new Date() } });
};

ClashRuns.updateRunStatus = async (teamspace, project, runId, status, results) => {
	await updateClashRun(teamspace, project, runId, deleteIfUndefined({
		status,
		results,
	}));
};

ClashRuns.getClashRunByQuery = async (teamspace, project, query, projection, sort) => {
	const run = await db.findOne(teamspace, CLASH_RUNS_COL, { ...query, project }, projection, sort);

	if (!run) {
		throw templates.clashRunNotFound;
	}

	return run;
};

ClashRuns.getLastRunFromPlan = (teamspace, planId) => db.findOne(teamspace, CLASH_RUNS_COL, { 'plan._id': planId }, { sort: { createdAt: -1 } });

ClashRuns.getRunsByPlanId = (teamspace, planId) => db.find(
	teamspace, CLASH_RUNS_COL,
	{ 'plan._id': planId },
	{ plan: 0 },
	{ triggeredAt: -1 },
);

module.exports = ClashRuns;
