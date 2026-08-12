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
		await db.createIndices(teamspace, CLASH_RUNS_COL, [
			{ key: { project: 1, 'plan._id': 1, updatedAt: -1 }, background: true },
			{ key: { project: 1, 'plan._id': 1, triggeredAt: -1 }, background: true },
		]);
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

ClashRuns.getClashRunById = (teamspace, project, runId, projection) => ClashRuns.getClashRunByQuery(
	teamspace, project, { _id: runId }, projection);

ClashRuns.getLatestRunByPlan = (teamspace, project, planId, projection) => ClashRuns.getClashRunByQuery(
	teamspace, project, { 'plan._id': planId }, projection, { triggeredAt: -1 });

ClashRuns.getClashRunsByPlan = (teamspace, project, planId, projection) => db.find(
	teamspace,
	CLASH_RUNS_COL,
	{ project, 'plan._id': planId },
	projection,
	{ triggeredAt: -1 },
);

const deleteRunsByQuery = async (teamspace, project, query = {}) => {
	const runs = await db.find(teamspace, CLASH_RUNS_COL, { project, ...query }, { _id: 1 });
	const runIds = runs.map(({ _id }) => _id);

	if (runIds.length) {
		await db.deleteMany(teamspace, CLASH_RUNS_COL, { project, _id: { $in: runIds } });
	}

	return runIds;
};

ClashRuns.deleteRunsByPlan = (teamspace, project, planId) => deleteRunsByQuery(
	teamspace, project, { 'plan._id': planId });

ClashRuns.deleteRunsByProject = (teamspace, project) => deleteRunsByQuery(teamspace, project);

module.exports = ClashRuns;
