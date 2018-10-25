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
 * Get users
 * @param teamspace
 * @param searchText
 */
export const fetchTeamspace = (teamspace) => {
	return api.get(`${teamspace}.json`);
};

/**
 * Get quota info
 * @param teamspace
 */
export const getQuotaInfo = (teamspace) => {
	return api.get(`${teamspace}/quota`);
};

/**
 * Get model settings
 * @param teamspace
 * @param modelId
 */
export const getModelSettings = (teamspace, modelId) => {
	return api.get(`${teamspace}/${modelId}`);
};

/**
 * Edit model settings
 * @param teamspace
 * @param modelId
 */
export const editModelSettings = (teamspace, modelId) => {
	return api.put(`${teamspace}/${modelId}`);
};
