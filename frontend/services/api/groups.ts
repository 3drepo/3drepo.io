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

import { splitValuesIfNecessary } from '../../helpers/requests';
import api from './';

/**
 * Get groups list
 * @param teamspace
 * @param modelId
 * @param groupId
 * @param revision
 */

export const getGroups = (teamspace, modelId, revision?) => {
	const query = 'noIssues=true&noRisks=true&noViews=true&noSequences=true';
	if (revision) {
		return api.get(`${teamspace}/${modelId}/revision/${revision}/groups/?${query}`);
	}
	return api.get(`${teamspace}/${modelId}/revision/master/head/groups/?${query}`);
};

/**
 * Get group data
 * @param teamspace
 * @param modelId
 * @param groupId
 * @param revision
 */
export const getGroup = (teamspace, modelId, groupId, revision?) => {
	if (revision) {
		return api.get(`${teamspace}/${modelId}/revision/${revision}/groups/${groupId}`);
	}
	return api.get(`${teamspace}/${modelId}/revision/master/head/groups/${groupId}`);
};

/**
 * Add new group
 * @param teamspace
 * @param modelId
 * @param group
 */
export const createGroup = (teamspace, modelId, revision, group) => {
	if (revision) {
		return api.post(`${teamspace}/${modelId}/revision/${revision}/groups`, group);
	}
	return api.post(`${teamspace}/${modelId}/revision/master/head/groups`, group);
};

/**
 * Update group
 * @param teamspace
 * @param modelId
 * @param groupId
 * @param group
 */
export const updateGroup = (teamspace, modelId, revision, groupId, group) => {
	if (revision) {
		return api.put(`${teamspace}/${modelId}/revision/${revision}/groups/${groupId}`, group);
	}
	return api.put(`${teamspace}/${modelId}/revision/master/head/groups/${groupId}`, group);
};

/**
 * Delete groups
 * @param teamspace
 * @param modelId
 * @param groups
 */
export const deleteGroups = (teamspace, modelId, groups) => {
	const GROUPS_IDS_ARGUMENT_INDICATION = '?ids=';
	const apiPath = `${teamspace}/${modelId}/groups/${GROUPS_IDS_ARGUMENT_INDICATION}`;
	const groupsChunks = splitValuesIfNecessary(`${apiPath}${groups}`, GROUPS_IDS_ARGUMENT_INDICATION);

	return Promise.all(groupsChunks.map((ids) => api.delete(`${apiPath}${ids}`)));
};
