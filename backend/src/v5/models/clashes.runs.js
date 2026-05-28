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

ClashRuns.createTestRun = async (teamspace, project, plan, user) => {
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

const updateTestRun = async (teamspace, project, runId, setUpdate) => {
	await db.updateOne(teamspace, CLASH_RUNS_COL, { project, _id: runId },
		{ $set: { ...setUpdate, updatedAt: new Date() } });
};

const formatResults = (status, data) => {
	if (data?.results !== undefined) {
		return data.results;
	}

	if (status === clashRunStatus.FAILED) {
		if (data?.error) {
			return { error: data.error };
		}

		const { code, reason } = typeof data === 'string' ? { reason: data } : data ?? {};
		return { error: deleteIfUndefined({ code, reason }) };
	}

	return data;
};

ClashRuns.updateRunStatus = async (teamspace, project, runId, status, data) => {
	const shouldUpdateResults = status === clashRunStatus.FAILED || data !== undefined;
	await updateTestRun(teamspace, project, runId, deleteIfUndefined({
		status,
		results: shouldUpdateResults ? formatResults(status, data) : undefined,
	}));
};

ClashRuns.getTestRunByQuery = async (teamspace, project, query, projection, sort) => {
	const run = await db.findOne(teamspace, CLASH_RUNS_COL, { ...query, project }, projection, sort);

	if (!run) {
		throw templates.clashRunNotFound;
	}

	return run;
};

module.exports = ClashRuns;
