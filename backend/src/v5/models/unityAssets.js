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

const FilesManager = require('../services/filesManager');

const UnityAssets = {};

UnityAssets.getRepoBundle = function (account, model, id) {
	const bundleFileName = `${id}`;
	const collection = `${model}.stash.repobundles.ref`;
	return FilesManager.getFileAsStream(account, collection, bundleFileName);
};

UnityAssets.getUnityBundle = function(account, model, id) {
	const bundleFileName = `${id}.unity3d`;
	const collection = `${model}.stash.unity3d.ref`;
	return FilesManager.getFileAsStream(account, collection, bundleFileName);
};

module.exports = UnityAssets;
