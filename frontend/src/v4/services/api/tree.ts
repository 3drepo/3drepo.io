/**
 *  Copyright (C) 2019 3D Repo Ltd
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

import api from './';

/**
 * Get full model/federation tree
 * @param teamspace
 * @param modelId
 * @param revision
 */
export const getFullTree = (teamspace, modelId, revision?) => {
	return api.get(`${teamspace}/${modelId}/revision/${revision || 'master/head'}/fulltree.json`);
};

/**
 * Get map of models and meshes ids
 * @param teamspace
 * @param modelId
 * @param revision
 */
export const getIdToMeshesMap = (teamspace, modelId, revision?) => {
	return api.get(`${teamspace}/${modelId}/revision/${revision || 'master/head'}/idToMeshes.json`);
};

/**
 * Get map of models and meshes ids
 * @param teamspace
 * @param modelId
 * @param revision
 */
export const getTreePath = (teamspace, modelId, revision?) => {
	return api.get(`${teamspace}/${modelId}/revision/${revision || 'master/head'}/tree_path.json`);
};
