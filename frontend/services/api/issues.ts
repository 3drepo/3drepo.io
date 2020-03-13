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
 * Get issue
 * @param teamspace
 * @param modelId
 * @param issueId
 */
export const getIssue = (teamspace, modelId, issueId) => {
	return api.get(`${teamspace}/${modelId}/issues/${issueId}`);
};

/**
 * Save issue
 * @param teamspace
 * @param modelId
 * @param issue
 */
export const saveIssue = (teamspace, modelId, issue) => {
	if (issue.rev_id) {
		return api.post(`${teamspace}/${modelId}/revision/${issue.rev_id}/issues`, issue);
	}
	return api.post(`${teamspace}/${modelId}/issues`, issue);
};

/**
 * Update issue
 * @param teamspace
 * @param modelId
 * @param id
 * @param revId
 * @param issue
 */
export const updateIssue = (teamspace, modelId, id, revId, issue) => {
	if (issue.rev_id) {
		return api.patch(`${teamspace}/${modelId}/revision/${revId}/issues/${id}`, issue);
	}
	return api.patch(`${teamspace}/${modelId}/issues/${id}`, issue);
};

/**
 * Get issues list
 * @param teamspace
 * @param modelId
 * @param revision
 */
export const getIssues = (teamspace, modelId, revision?) => {
	const mainPath = `${teamspace}/${modelId}`;
	if (revision) {
		return api.get(`${mainPath}/revision/${revision}/issues`);
	}
	return api.get(`${mainPath}/issues`);
};

/**
 * Import BCF
 * @param teamspace
 * @param modelId
 * @param file
 * @param revision
 */
export const importBCF = (teamspace, modelId, file, revision?) => {
	const mainPath = `${teamspace}/${modelId}`;
	const formData = new FormData();
	formData.append('file', file);

	if (revision) {
		return api.post(`${mainPath}/revision/${revision}/issues`, formData);
	}
	return api.post(`${mainPath}/issues.bcfzip`, formData);
};

/**
 * Post a comment for issues
 * @param teamspace the teamspace
 * @param modelId the model id for the model which contains the issue
 * @param id the issue id
 * @param comment the comment that the user wants to post with
 * the format of the comment:
 * {
 *    "created":1562583557497,
 *    "owner":"teamSpace1",
 *    "comment":"ffff",
 *    "viewpoint":{...}
 * }
 *
 */
export const addIssueComment = (teamspace, modelId, id, comment) => {
	return api.post(`${teamspace}/${modelId}/issues/${id}/comments`, comment);
};

/**
 * Deletes a comment from issues
 * @param teamspace the teamspace
 * @param modelId the model id for the model which contains the issue
 * @param id the issue id
 * @param guid the comment id to be deleted
 */
export const deleteIssueComment = (teamspace, modelId, id, guid) => {
	return api.delete(`${teamspace}/${modelId}/issues/${id}/comments`, {guid});
};

/**
 * Remove resource from issue
 * @param teamspace
 * @param modelId
 * @param issueId
 * @param resourceId
 */
export const removeResourceFromIssue = (teamspace, modelId, issueId, resourceId ) => {
	return api.delete(`${teamspace}/${modelId}/issues/${issueId}/resources`, {_id: resourceId});
};

/**
 * Attach resources to issue
 * @param teamspace
 * @param modelId
 * @param issueId
 * @param names
 * @param files
 */
// tslint:disable-next-line:max-line-length
export const attachFileResourcesToIssue = (teamspace, modelId, issueId, names: any[], files: any[], percentageCallback ) => {
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

	return api.post(`${teamspace}/${modelId}/issues/${issueId}/resources`, formData, { ...headers, ...progressHook });
};

/**
 * Attach resources to issue
 * @param teamspace
 * @param modelId
 * @param issueId
 * @param names
 * @param urls
 */
export const attachLinkResourcesToIssue = (teamspace, modelId, issueId, names: any[], urls: any[] ) => {
	return api.post(`${teamspace}/${modelId}/issues/${issueId}/resources`, {names, urls});
};
