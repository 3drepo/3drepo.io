/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import { delay } from '@/v4/helpers/async';
import { mockModelPermissions } from '@/v5/store/drawings/drawings.temp';
import { fetchUsers } from './users';
import { API as api } from './default';

export const fetchModelsPermissions = async (teamspace, models) => {
	const { data: users } = await fetchUsers(teamspace);
	return { data: mockModelPermissions(models, users) };
	// TODO #4789 revert this change when backend is introduced
	// return api.get(`${teamspace}/models/permissions?models=${models.join(',')}`);
};

export const updateModelsPermissions = (teamspace, permissionsList) => {
	return delay(500, { status: 200 });
	// TODO #4789 revert this change when backend is introduced
	// return api.patch(`${teamspace}/models/permissions`, permissionsList);
};

/**
 * Create new model
 * @param teamspace
 * @param model
 */
export const createModel = (teamspace, modelData) => {
	return api.post(`${teamspace}/model`, modelData);
};

/**
 * Update model
 * @param teamspace
 * @param model
 */
export const updateModel = (teamspace, modelId, modelData) => {
	return api.put(`${teamspace}/${modelId}`, modelData);
};

/**
 * Remove model
 * @param teamspace
 * @param modelId
 */
export const removeModel = (teamspace, modelId) => {
	return api.delete(`${teamspace}/${modelId}`);
};

/**
 * Upload model file
 * @param teamspace
 * @param modelId
 * @param fileData
 */
export const uploadModelFile = (teamspace, modelId, fileData) => {
	return api.post(`${teamspace}/${modelId}/upload`, fileData);
};

/**
 * Get model settings
 * @param teamspace
 * @param modelId
 */
export const getModelSettings = (teamspace, modelId) => {
	return api.get(`${teamspace}/${modelId}.json`);
};

/**
 * Edit model settings
 * @param teamspace
 * @param modelId
 */
export const editModelSettings = (teamspace, modelId, settings) => {
	return api.put(`${teamspace}/${modelId}/settings`, settings);
};

/**
 * Get model revisions
 * @param teamspace
 * @param modelId
 */
export const getModelRevisions = (teamspace, modelId, showVoid) => {
	return api.get(`${teamspace}/${modelId}/revisions.json${showVoid ? '?showVoid' : ''}`);
};

/**
 * Set model's revision state
 * @param teamspace
 * @param modelId
 * @param revision
 * @param isVoid
 */
export const setModelRevisionState = (teamspace, modelId, revision, isVoid) => {
	return api.patch(`${teamspace}/${modelId}/revisions/${revision}`, {
		void: isVoid
	});
};

/**
 * Get sub-models revisions
 * @param teamspace
 * @param modelId
 * @param revision
 */
export const getSubModelsRevisions = (teamspace, modelId, revision) => {
	if (!revision) {
		return api.get(`${teamspace}/${modelId}/revision/master/head/subModelRevisions`);
	}
	return api.get(`${teamspace}/${modelId}/revision/${revision}/subModelRevisions`);
};

/**
 * Get model maps
 * @param teamspace
 * @param modelId
 */
export const getModelMaps = (teamspace, modelId) => {
	return api.get(`${teamspace}/${modelId}/maps`);
};

/**
 * Get model viewpoints
 * @param teamspace
 * @param modelId
 */
export const getModelViewpoints = (teamspace, modelId) => {
	return api.get(`${teamspace}/${modelId}/viewpoints`);
};

/**
 * Create model viewpoint
 * @param teamspace
 * @param modelId
 */
export const createModelViewpoint = (teamspace, modelId, view) => {
	return api.post(`${teamspace}/${modelId}/viewpoints`, view);
};

/**
 * Delete model viewpoint
 * @param teamspace
 * @param modelId
 * @param viewId
 */
export const deleteModelViewpoint = (teamspace, modelId, viewId) => {
	return api.delete(`${teamspace}/${modelId}/viewpoints/${viewId}`);
};

/**
 * Update model viewpoint name
 * @param teamspace
 * @param modelId
 * @param viewId
 * @param newName
 */
export const updateModelViewpoint = (teamspace, modelId, viewId, newName) => {
	return api.put(`${teamspace}/${modelId}/viewpoints/${viewId}`, { name: newName });
};

/**
 * Get starred models
 */
export const getStarredModels = () => {
	return api.get('starredModels');
};

/**
 * Add starred model
 * @param modelId
 */
export const addStarredModel = (model) => {
	return api.post('starredModels', model);
};

/**
 * Remove starred model
 * @param modelId
 */
export const removeStarredModel = (model) => {
	return api.delete('starredModels', model);
};

/**
 * Override starred model
 * @param starredModel
 *
 */
export const overrideStarredModel = (starredModelsByTeamspace) => {
	return api.put('starredModels', starredModelsByTeamspace);
};
