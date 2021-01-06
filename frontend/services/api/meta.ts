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
 * Get model metadata
 * @param teamspace
 * @param modelId
 * @param metadataId
 */
export const getMetadata = (teamspace, modelId, metadataId) => {
	return api.get(`${teamspace}/${modelId}/meta/${metadataId}.json`);
};

/**
 * Get meta keys
 * @param teamspace
 * @param modelId
 */
export const getMetaKeys = (teamspace, modelId) => {
	return api.get(`${teamspace}/${modelId}/meta/keys`);
};

/**
 * Get starred meta
 */
export const getStarredMeta = () => {
	return api.get('starredMeta');
};

/**
 * Add starred meta
 * @param metaRecordKey
 */
export const addStarredMeta = (metaRecordKey) => {
	return api.post('starredMeta', { tag: metaRecordKey });
};

/**
 * Remove starred meta
 * @param metaRecordKey
 */
export const removeStarredMeta = (metaRecordKey) => {
	return api.delete('starredMeta', { tag: metaRecordKey });
};

/**
 * Override starred meta
 * @param starredMeta
 */
export const overrideStarredMeta = (starredMeta) => {
	return api.put('starredMeta', starredMeta);
};

/**
 * Get mesh IDs by query
 * @param teamspace
 * @param modelId
 * @param rules
 * @param revision
 */
export const getMeshIDsByQuery = (teamspace, modelId, rules, revision = 'master/head') => {
	return api.post(`${teamspace}/${modelId}/revision/${revision}/meta/rules?meshids=true`, rules);
};
