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

/**
 * Get sequences list
 *
 * @param teamspace
 * @returns {*|promise}
 */
export const getSequences = (teamspace, modelId, revision): Promise<any> => {
	return api.get(`${teamspace}/${modelId}/revision/${revision || HEAD}/sequences`);
};

export const patchSequence = (teamspace, modelId, revision, sequenceId, newName): Promise<any> => {
	return api.patch(`${teamspace}/${modelId}/revision/${revision || HEAD}/sequences/${sequenceId}`, { name: newName });
};

export const getSequenceState = (teamspace, modelId, revision, sequenceId, stateId): Promise<any> => {
	return api.get(`${teamspace}/${modelId}/revision/${revision || HEAD}/sequences/${sequenceId}/state/${stateId}`);
};

export const getSequenceActivityDetail = (teamspace, modelId, revision, sequenceId, activityId): Promise<any> => {
	// tslint:disable-next-line:max-line-length
	return api.get(`${teamspace}/${modelId}/revision/${revision || HEAD}/sequences/${sequenceId}/activities/${activityId}`);
};

export const getSequenceActivities = (teamspace, modelId, revision, sequenceId): Promise<any> => {
	return api.get(`${teamspace}/${modelId}/revision/${revision || HEAD}/sequences/${sequenceId}/activities`);
};
