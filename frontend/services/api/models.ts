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

import api from './';

/**
 * Return project details
 * @param teamspace
 * @param model
 */
export const fetchModelPermissions = (teamspace, model) => {
	return api.get(`${teamspace}/${model}/permissions`);
};

export const fetchModelsPermissions = (teamspace, models) => {
	return api.get(`${teamspace}/models/permissions?models=${models.join(',')}`);
};

export const updateModelsPermissions = (teamspace, permissionsList) => {
	return api.post(`${teamspace}/models/permissions`, permissionsList);
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
export const getModelRevisions = (teamspace, modelId) => {
	return api.get(`${teamspace}/${modelId}/revisions.json`);
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
 * Get model maps
 * @param teamspace
 * @param modelId
 */
export const getModelViewpoints = (teamspace, modelId) => {
	return api.get(`${teamspace}/${modelId}/viewpoints`);
};
