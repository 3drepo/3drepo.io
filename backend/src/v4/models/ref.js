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
const ModelSetting = require("./modelSetting");

const Ref = {};

Ref.getRefNodes = async (account, model, branch, revision, projection) => {
	const settings = await findModelSettingById(account, model);
	if (settings.federate) {
		return findNodesByType(account, model, branch, revision, "ref", undefined, projection);
	}

	return [];
};

Ref.getSubModels = async (account, model, branch, revision, callbackProm) => {
	const settings = await ModelSetting.findModelSettingById(account, model);
	const subModelArr = [];
	if(settings.subModels) {
		for(let i = 0; i < settings.subModels.length; ++i) {
			subModelArr.push({
				account: account,
				model: settings.subModels[i]._id,
				branch: C.MASTER_BRANCH_NAME
			});
			if (callbackProm) {
				await callbackProm(account, settings.subModels[i]._id, C.MASTER_BRANCH_NAME);
			}
		}
	}

	return subModelArr;
};

module.exports = Ref;
