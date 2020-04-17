/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import axios from 'axios';
import api from './';

/**
 * Get teamspace
 * @param teamspace
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
 * Get teamspace settings
 * @param teamspace
 */
export const fetchTeamspaceSettings = (teamspace) => {
	return api.get(`${teamspace}/settings`);
};

/**
 * Edit teamspace settings
 * @param teamspace
 * @param settings
 */
export const editTeamspaceSettings = (teamspace, settings) => {
	return api.patch(`${teamspace}/settings`, settings);
};

/**
 * Edit treatments file
 * @param teamspace
 * @param file
 */
export const uploadTreatmentsFile = (teamspace, file) => {
	const formData = new FormData();
	formData.append('file', file);
	return api.post(`${teamspace}/settings/mitigations.csv`, formData);
};
