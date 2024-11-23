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

const DbConstants = require('../handler/db.constants');
const db = require('../handler/db');
const responseCodes = require('../utils/responseCodes');
const uuidHelper = require('../utils/helper/uuids');

const History = {};

const getCollName = (model) => `${model}.history`;

const findOne = async (account, model, query, projection, sort) => {
	const result = await db.findOne(account, getCollName(model), query, projection, sort);
	return result;
};

History.findByUID = async (account, model, revId, projection) => {
	const proj = projection || {};
	const result = await findOne(account, model, { _id: uuidHelper.stringToUUID(revId) }, proj);
	return result;
};

History.findByTag = async (account, model, tag, projection = {}) => {
	const result = await findOne(account, model, { tag, incomplete: { $exists: false } }, projection);
	return result;
};

// get the head of a branch
// FIXME: findByBranch and listByBranch seem to be doing similar things
// FIXME: maybe findByBranch can just take the 1st elem of listByBranch
History.findByBranch = async (account, model, branch, projection, showVoid = false) => {
	const query = { incomplete: { $exists: false } };

	if (!showVoid) {
		query.void = { $ne: true };
	}

	const proj = projection || {};

	if (!branch || branch === DbConstants.MASTER_BRANCH_NAME) {
		query.shared_id = uuidHelper.stringToUUID(DbConstants.MASTER_BRANCH);
	} else {
		query.shared_id = uuidHelper.stringToUUID(branch);
	}

	const sort = { timestamp: -1 };

	const res = await findOne(
		account,
		model,
		query,
		proj,
		sort,
	);

	return res;
};

History.getHistory = async (account, model, branch, revId, projection) => {
	let history;

	if (revId) {
		if (uuidHelper.isUUIDObject(revId) || uuidHelper.isUUID(revId)) {
			history = await History.findByUID(account, model, uuidHelper.stringToUUID(revId), projection);
		} else {
			history = await History.findByTag(account, model, revId, projection);
		}
	} else if (branch) {
		history = await History.findByBranch(account, model, branch, projection);
	}

	if (!history) {
		throw responseCodes.INVALID_TAG_NAME;
	}

	return history;
};

module.exports = History;
