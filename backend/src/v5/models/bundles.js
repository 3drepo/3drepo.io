/**
 *  Copyright (C) 2025 3D Repo Ltd
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

const { findOne } = require('../handler/db');
const { templates } = require('../utils/responseCodes');

const Bundle = {};

const REPO_BUNDLE_COLLECTION = 'stash.repobundles';
const UNITY_BUNDLE_COLLECTION = 'stash.unity3d';

Bundle.getAssetList = async (teamspace, container, revision) => {
	const repobundle = await findOne(teamspace, `${container}.${REPO_BUNDLE_COLLECTION}`, { _id: revision }, { _id: 0 });
	if (repobundle) return repobundle;

	// legacy fallback - if repobundle list is not found, check for unity3d asset list
	const unityBundle = await findOne(teamspace, `${container}.${UNITY_BUNDLE_COLLECTION}`, { _id: revision }, { _id: 0 });

	if (unityBundle) return unityBundle;

	throw templates.fileNotFound;
};

module.exports = Bundle;
