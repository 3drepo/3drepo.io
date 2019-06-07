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

import api from '.';
import { formatDate } from '../formatting/formatDate';

/**
 * Download JSON file
 * @param panelName
 * @param modelName
 * @param endpoint
 */
export const downloadJSON = (panelName, modelName, endpoint) => {
	const timestamp = formatDate(Date.now(), 'DD_MM_YYYY_HH_mm_ss');

	return api.get(endpoint).then((res) => {
		const content = JSON.stringify(res.data, null, 2);
		const a = document.createElement('a');
		const file = new Blob([content]);
		a.href = URL.createObjectURL(file);
		a.download = `${modelName}_${timestamp}_${panelName}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	});
};

/**
 * Edit helicopter speed
 * @param teamspace
 * @param modelId
 * @param speed
 */
export const editHelicopterSpeed = (teamspace, modelId, speed) => {
	return api.put(`${teamspace}/${modelId}/settings/heliSpeed`, {heliSpeed: speed});
};

/**
 * Get helicopter speed
 * @param teamspace
 * @param modelId
 */
export const getHelicopterSpeed = (teamspace, modelId) => {
	return api.get(`${teamspace}/${modelId}/settings/heliSpeed`);
};
