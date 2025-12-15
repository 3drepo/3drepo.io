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

const { getAssetList } = require('../../../../../../models/bundles');

const JsonAssets = { };

JsonAssets.getRepoBundleInfo = async (teamspace, model, revision, subModels) => {
	const containerList = subModels || [{ container: model, revision }];

	const lists = await Promise.all(containerList.map((
		{ container, revision: revId }) => getAssetList(teamspace, container, revId).catch(() => undefined)));
	return { models: lists.filter((entry) => !!entry) };
};

module.exports = JsonAssets;
