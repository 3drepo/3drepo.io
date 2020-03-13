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
 * Get risk
 * @param teamspace
 * @param modelId
 * @param revision
 */
export const getRisk = (teamspace, modelId, riskId) => {
	return api.get(`${teamspace}/${modelId}/risks/${riskId}`);
};

/**
 * Save risk
 * @param teamspace
 * @param modelId
 * @param risk
 */
export const saveRisk = (teamspace, modelId, risk) => {
	if (risk.rev_id) {
		return api.post(`${teamspace}/${modelId}/revision/${risk.rev_id}/risks`, risk);
	}
	return api.post(`${teamspace}/${modelId}/risks`, risk);
};

/**
 * Update risk
 * @param teamspace
 * @param modelId
 * @param risk
 */
export const updateRisk = (teamspace, modelId, id, revId, risk) => {
	if (risk.rev_id) {
		return api.patch(`${teamspace}/${modelId}/revision/${revId}/risks/${id}`, risk);
	}
	return api.patch(`${teamspace}/${modelId}/risks/${id}`, risk);
};

/**
 * Get risks list
 * @param teamspace
 * @param modelId
 * @param revision
 */
export const getRisks = (teamspace, modelId, revision?) => {
	if (revision) {
		return api.get(`${teamspace}/${modelId}/revision/${revision}/risks`);
	}
	return api.get(`${teamspace}/${modelId}/risks`);
};

/**
 * Delete risks
 * @param teamspace
 * @param modelId
 * @param risksIds
 */
export const deleteRisks = (teamspace, modelId, risksIds) => {
	return api.delete(`${teamspace}/${modelId}/risks/?ids=${risksIds}`);
};

/**
 * Post a comment for risks
 * @param teamspace the teamspace
 * @param modelId the model id for the model which contains the risk
 * @param id the risks id
 * @param comment the message in the comment that the user wants to post
 */
export const addRiskComment = (teamspace, modelId, id, comment) => {
	return api.post(`${teamspace}/${modelId}/risks/${id}/comments`, comment);
};

/**
 * Deletes a comment from risks
 * @param teamspace the teamspace
 * @param modelId the model id for the model which contains the risk
 * @param id the risk id
 * @param guid the comment id to be deleted
 */
export const deleteRiskComment = (teamspace, modelId, id, guid) => {
	return api.delete(`${teamspace}/${modelId}/risks/${id}/comments`, {guid});
};

/**
 * Remove resource from issue
 * @param teamspace
 * @param modelId
 * @param riskId
 * @param resourceId
 */
export const removeResourceFromRisk = (teamspace, modelId, riskId, resourceId ) => {
	return api.delete(`${teamspace}/${modelId}/risks/${riskId}/resources`, {_id: resourceId});
};

/**
 * Attach resources to issue
 * @param teamspace
 * @param modelId
 * @param riskId
 * @param names
 * @param files
 */
// tslint:disable-next-line:max-line-length
export const attachFileResourcesToRisk = (teamspace, modelId, riskId, names: any[], files: any[], percentageCallback ) => {
	const headers = { headers: { 'Content-Type': 'multipart/form-data' }};
	const formData = new FormData();
	files.forEach((f) => formData.append('file', f));
	names.forEach((n) => formData.append('names', n));
	const progressHook = {
		onUploadProgress: (progressEvent) => {
			const percentCompleted = progressEvent.loaded / progressEvent.total;
			percentageCallback(percentCompleted);
		}
	};

	return api.post(`${teamspace}/${modelId}/risks/${riskId}/resources`, formData, { ...headers, ...progressHook });
};

/**
 * Attach resources to issue
 * @param teamspace
 * @param modelId
 * @param riskId
 * @param names
 * @param urls
 */
export const attachLinkResourcesToRisk = (teamspace, modelId, riskId, names: any[], urls: any[] ) => {
	return api.post(`${teamspace}/${modelId}/risks/${riskId}/resources`, {names, urls});
};

/**
 * Get mitigation criteria
 * @param teamspace
 */
export const getMitigationCriteria  = (teamspace) => {
	return api.get(`${teamspace}/mitigations/criteria`);
};

/**
 * Get mitigation criteria
 * @param teamspace
 * @param conditions
 */
export const getMitigationSuggestions  = (teamspace, conditions) => {
	return api.post(`${teamspace}/mitigations`, {...conditions});
};
