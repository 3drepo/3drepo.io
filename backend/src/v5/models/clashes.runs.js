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

module.exports = ClashRuns;
