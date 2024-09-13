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

import { formatFilenameDate } from '@/v5/helpers/intl.helper';
import { API as api } from './default';

const triggerDownloadWithJSON = (data, filename) => {
	const content = JSON.stringify(data, null, 2);
	const a = document.createElement('a');
	const file = new Blob([content]);
	a.href = URL.createObjectURL(file);
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}

/**
 * Download JSON file
 * @param panelName
 * @param modelName
 * @param endpoint
 */
export const downloadJSON = (panelName, modelName, endpoint) => {
	const timestamp = formatFilenameDate(Date.now());
	return api.get(endpoint).then((res) => triggerDownloadWithJSON(res.data, `${modelName}_${timestamp}_${panelName}.json`));
};

export const downloadJSONHttpPost = (panelName, modelName, endpoint, payload) => {
	const timestamp = formatFilenameDate(Date.now());
	return api.post(endpoint, payload).then(({data}) => triggerDownloadWithJSON(data, `${modelName}_${timestamp}_${panelName}.json`));
}

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
