/**
 *  Copyright (C) 2021 3D Repo Ltd
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

"use strict";
const { findModelSettingById } = require("./modelSetting");
const { findNodesByType } = require("./scene");
const C = require("../constants");
const utils = require("../utils");

const Ref = {};

Ref.getRefNodes = async (account, model, branch, revision, projection) => {
	const settings = await findModelSettingById(account, model);
	if (settings.federate) {
		return findNodesByType(account, model, branch, revision, "ref", undefined, projection);
	}

	return [];
};

Ref.getSubModels = async (account, model, branch, revision, callbackProm) => {
	const refs = await Ref.getRefNodes(account, model, branch, revision, {owner: 1, project: 1, _rid: 1});
	const subModelArr = [];
	for(let i = 0; i < refs.length; ++i) {
		const {owner, project, _rid} = refs[i];
		let refBranch, refRev;
		if (utils.uuidToString(_rid) === C.MASTER_BRANCH) {
			refBranch = C.MASTER_BRANCH_NAME;
		} else {
			refRev = utils.uuidToString(_rid);
		}
		subModelArr.push({
			account: owner,
			model: project,
			branch: refBranch,
			revision: refRev
		});
		if (callbackProm) {
			await callbackProm(owner, project, refBranch, refRev);
		}

	}

	return subModelArr;
};

module.exports = Ref;
