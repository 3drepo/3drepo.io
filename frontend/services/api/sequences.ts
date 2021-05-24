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
const HEAD = 'master/head';

export const getSequence = (teamspace, modelId, sequenceId): Promise<any> => {
	return api.get(`${teamspace}/${modelId}/sequences/${sequenceId}`);
};

/**
 * Get sequences list
 *
 * @param teamspace
 * @returns {*|promise}
 */
export const getSequenceList = (teamspace, modelId, revision?): Promise<any> => {
	if (revision) {
		return api.get(`${teamspace}/${modelId}/sequences/?rev_id=${revision}`);
	}
	return api.get(`${teamspace}/${modelId}/sequences`);
};

export const patchSequence = (teamspace, modelId, sequenceId, newName): Promise<any> => {
	return api.patch(`${teamspace}/${modelId}/sequences/${sequenceId}`, { name: newName });
};

export const getSequenceState = (teamspace, modelId, sequenceId, stateId): Promise<any> => {
	return api.get(`${teamspace}/${modelId}/sequences/${sequenceId}/state/${stateId}`);
};

export const getSequenceActivityDetail = (teamspace, modelId, sequenceId, activityId): Promise<any> => {
	// tslint:disable-next-line:max-line-length
	return api.get(`${teamspace}/${modelId}/sequences/${sequenceId}/activities/${activityId}`);
};

export const getSequenceActivities = (teamspace, modelId, sequenceId): Promise<any> => {
	return api.get(`${teamspace}/${modelId}/sequences/${sequenceId}/activities`);
};

export const getSequenceLegend = (teamspace, modelId, sequenceId): Promise<any> => {
	return api.get(`${teamspace}/${modelId}/sequences/${sequenceId}/legend`);
};

export const putSequenceLegend = (teamspace, modelId, sequenceId, legendItems): Promise<any> => {
	return api.put(`${teamspace}/${modelId}/sequences/${sequenceId}/legend`, legendItems);
};

export const deleteSequenceLegend = (teamspace, modelId, sequenceId): Promise<any> => {
	return api.delete(`${teamspace}/${modelId}/sequences/${sequenceId}/legend`);
};
