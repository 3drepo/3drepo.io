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

import { push } from 'connected-react-router';
import filesize from 'filesize';
import { isEmpty, isEqual, map, omit, pick } from 'lodash';
import { all, put, select, takeLatest } from 'redux-saga/effects';

import * as queryString from 'query-string';
import { CHAT_CHANNELS } from '../../constants/chat';
import { DEFAULT_PROPERTIES, PRIORITIES, STATUSES } from '../../constants/issues';
import { EXTENSION_RE } from '../../constants/resources';
import { ROUTES } from '../../constants/routes';
import {
	createAttachResourceComments,
	createRemoveResourceComment
} from '../../helpers/comments';
import { imageUrlToBase64 } from '../../helpers/imageUrlToBase64';
import { prepareIssue } from '../../helpers/issues';
import { prepareResources } from '../../helpers/resources';
import { analyticsService, EVENT_ACTIONS, EVENT_CATEGORIES } from '../../services/analytics';
import * as API from '../../services/api';
import * as Exports from '../../services/export';
import { Viewer } from '../../services/viewer/viewer';
import { BoardActions } from '../board';
import { ChatActions } from '../chat';
import { selectCurrentUser } from '../currentUser';
import { DialogActions } from '../dialog';
import { selectJobsList, selectMyJob } from '../jobs';
import { selectCurrentModel, selectCurrentModelTeamspace } from '../model';
import { selectQueryParams, selectUrlParams } from '../router/router.selectors';
import { SnackbarActions } from '../snackbar';
import { dispatch, getState } from '../store';
import { selectTopicTypes } from '../teamspace';
import { ViewpointsActions } from '../viewpoints';
import { generateViewpoint, showViewpoint } from '../viewpoints/viewpoints.sagas';
import { IssuesActions, IssuesTypes } from './issues.redux';
import {
	selectActiveIssueDetails,
	selectActiveIssueId,
	selectComponentState,
	selectFilteredIssues,
	selectIssuesMap
} from './issues.selectors';

function* fetchIssues({teamspace, modelId, revision}) {
	yield put(IssuesActions.togglePendingState(true));
	try {
		const { data } = yield API.getIssues(teamspace, modelId, revision);
		const jobs = yield select(selectJobsList);

		const preparedIssues = data.map((issue) => prepareIssue(issue, jobs));

		yield put(IssuesActions.fetchIssuesSuccess(preparedIssues));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('get', 'issues', error));
	}
	yield put(IssuesActions.togglePendingState(false));
}

function* fetchIssue({teamspace, modelId, issueId}) {
	yield put(IssuesActions.toggleDetailsPendingState(true));

	try {
		const {data} = yield API.getIssue(teamspace, modelId, issueId);
		data.resources = prepareResources(teamspace, modelId, data.resources);

		yield put(IssuesActions.fetchIssueSuccess(data));
	} catch (error) {
		yield put(IssuesActions.fetchIssueFailure());
		yield put(DialogActions.showEndpointErrorDialog('get', 'issue', error));
	}
	yield put(IssuesActions.toggleDetailsPendingState(false));
}

function* saveIssue({ teamspace, model, issueData, revision, finishSubmitting, ignoreViewer = false }) {
	yield put(IssuesActions.toggleDetailsPendingState(true));
	try {
		const userJob = yield select(selectMyJob);

		let issue = !ignoreViewer ?
			yield generateViewpoint( teamspace, model, issueData.name, !Boolean(issueData.descriptionThumbnail) ) :
			{ viewpoint: {} };

		if (issueData.descriptionThumbnail ) {
			issue.viewpoint = {
				...(issue.viewpoint || {}),
				screenshot: issueData.descriptionThumbnail
			};
		}

			// .substring(screenshot.indexOf(',') + 1);
		if (issueData.descriptionThumbnail ) {
			issue.viewpoint = {
				...(issue.viewpoint || {}),
				screenshot: issueData.descriptionThumbnail.substring(issueData.descriptionThumbnail.indexOf(',') + 1 )
			};
		}

		issue = {
			...issue,
			...omit(issueData, ['author', 'statusColor', 'roleColor', 'defaultHidden', 'viewpoint', 'descriptionThumbnail']),
			owner: issueData.author,
			rev_id: revision,
			creator_role: userJob._id,
		};

		const { data: savedIssue } = yield API.saveIssue(teamspace, model, issue);

		analyticsService.sendEvent(EVENT_CATEGORIES.ISSUE, EVENT_ACTIONS.CREATE);

		const jobs = yield select(selectJobsList);
		const preparedIssue = prepareIssue(savedIssue, jobs);

		finishSubmitting();

		if (!ignoreViewer) {
			yield put(IssuesActions.goToIssue(savedIssue));
		} else {
			yield put(DialogActions.hideDialog());
		}
		yield put(IssuesActions.saveIssueSuccess(preparedIssue));
		yield put(SnackbarActions.show('Issue created'));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('save', 'issue', error));
	}
	yield put(IssuesActions.toggleDetailsPendingState(false));
}

function* updateActiveIssue({ issueData }) {
	try {
		const { _id, rev_id, model, account, position } = yield select(selectActiveIssueDetails);
		const { data: updatedIssue } = yield API.updateIssue(account, model, _id, rev_id, issueData);
		yield analyticsService.sendEvent(EVENT_CATEGORIES.ISSUE, EVENT_ACTIONS.EDIT);

		const jobs = yield select(selectJobsList);
		const preparedIssue = prepareIssue(updatedIssue, jobs);

		yield put(IssuesActions.setComponentState({ savedPin: position }));
		yield put(IssuesActions.saveIssueSuccess(preparedIssue));
		yield put(SnackbarActions.show('Issue updated'));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('update', 'issue', error));
	}
}

function* updateBoardIssue({ teamspace, modelId, issueData }) {
	try {
		const { _id, ...changedData } = issueData;
		const { data: updatedIssue } = yield API.updateIssue(teamspace, modelId, _id, null, changedData);
		const jobs = yield select(selectJobsList);
		const preparedIssue = prepareIssue(updatedIssue, jobs);

		yield put(IssuesActions.saveIssueSuccess(preparedIssue));
		yield put(SnackbarActions.show('Issue updated'));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('update', 'board issue', error));
	}
}

function* updateNewIssue({ newIssue }) {
	try {
		const jobs = yield select(selectJobsList);
		const preparedIssue = prepareIssue(newIssue, jobs);
		yield put(IssuesActions.setComponentState({ newIssue: preparedIssue }));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'new issue', error));
	}
}

function* postComment({ issueData, ignoreViewer, finishSubmitting }) {
	yield put(IssuesActions.togglePostCommentPendingState(true));
	try {
		const { _id, model, account } = yield select(selectActiveIssueDetails);
		const { viewpoint } = !ignoreViewer ?  yield generateViewpoint( account, model, '', false) : {viewpoint: {}};

		issueData.viewpoint = {
			...viewpoint,
			... issueData.viewpoint
		};

		if (isEmpty(issueData.viewpoint) || isEqual(issueData.viewpoint, { screenshot: '' }) ) {
			delete issueData.viewpoint;
		}

		const { data: comment } = yield API.addIssueComment(account, model, _id, issueData);
		finishSubmitting();
		yield put(IssuesActions.createCommentSuccess(comment, _id));
		yield put(SnackbarActions.show('Issue comment added'));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('post', 'issue comment', error));
	}
	yield put(IssuesActions.togglePostCommentPendingState(false));
}

function* removeComment({ issueData }) {
	try {
		const { guid } = issueData;
		const { _id, model, account } = yield select(selectActiveIssueDetails);

		yield API.deleteIssueComment(account, model, _id, guid);
		yield put(IssuesActions.deleteCommentSuccess(guid, _id));
		yield put(SnackbarActions.show('Comment removed'));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('remove', 'comment', error));
	}
}

export function* downloadIssues({ teamspace, modelId }) {
	try {
		const filteredIssues = yield select(selectFilteredIssues);
		const issueNumbers = map(filteredIssues, 'number').join(',');
		yield Exports.exportIssuesToJSON(teamspace, modelId, issueNumbers);
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('download', 'json', error));
	}
}

function* exportBcf({ teamspace, modelId }) {
	try {
		const filteredIssues = yield select(selectFilteredIssues);
		const issuesIds = map(filteredIssues, 'number').join(',');
		Exports.exportBCF(teamspace, modelId, issuesIds);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('export', 'BCF', error));
	}
}

function* importBcf({ teamspace, modelId, file, revision }) {
	yield put(IssuesActions.toggleIsImportingBcf(true));

	try {
		yield API.importBCF(teamspace, modelId, file, revision);
		yield put(IssuesActions.fetchIssues(teamspace, modelId, revision));
		yield put(SnackbarActions.show('BCF file uploaded'));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('import', 'BCF', error));
	}

	yield put(IssuesActions.toggleIsImportingBcf(false));
}

function* printIssues({ teamspace, modelId }) {
	try {
		const filteredIssues = yield select(selectFilteredIssues);
		const issueNumbers = map(filteredIssues, 'number').join(',');
		Exports.printIssues(teamspace, modelId, issueNumbers);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('print', 'issue', error));
	}
}

function* setActiveIssue({ issue, revision, ignoreViewer = false }) {
	try {
		const activeIssueId = yield select(selectActiveIssueId);
		const issuesMap = yield select(selectIssuesMap);

		if (issuesMap[activeIssueId]) {
			const {account , model } = issuesMap[activeIssueId];
			yield put(IssuesActions.unsubscribeOnIssueCommentsChanges(account, model, activeIssueId));
		}

		if (issue) {
			const {account , model, _id} = issue;
			yield put(IssuesActions.subscribeOnIssueCommentsChanges(account, model, _id));
		}

		yield all([
			!ignoreViewer ? put(ViewpointsActions.showViewpoint(issue?.account, issue?.model, issue)) : null,
			put(IssuesActions.setComponentState({ activeIssue: issue._id, expandDetails: true }))
		]);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'issue as active', error));
	}
}

function* goToIssue({ issue }) {
	const { teamspace, model, revision } = yield select(selectUrlParams);
	let queryParams =  yield select(selectQueryParams);

	const issueId = (issue || {})._id;
	const path = [ROUTES.VIEWER, teamspace, model, revision].filter(Boolean).join('/');

	queryParams = issueId ?  {... queryParams, issueId} : omit(queryParams, 'issueId');
	let query = queryString.stringify(queryParams);
	if (query) {
		query = '?' + query;
	}

	yield put(push(`${path}${query}`));
}

function* showDetails({ revision, issueId }) {
	try {
		const issuesMap = yield select(selectIssuesMap);
		const issue = issuesMap[issueId];

		yield put(IssuesActions.setActiveIssue(issue, revision));
		yield put(IssuesActions.setComponentState({ showDetails: true, savedPin: issue.position }));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('display', 'issue details', error));
	}
}

function* closeDetails() {
	try {
		const activeIssue = yield select(selectActiveIssueDetails);
		const componentState = yield select(selectComponentState);

		if (componentState.showDetails) {
			if (!isEqual(activeIssue.position, componentState.savedPin)) {
				yield put(IssuesActions.updateSelectedIssuePin(componentState.savedPin));
			}

			yield put(IssuesActions.setComponentState({ showDetails: false, savedPin: null }));
		}

	} catch (error) {
		yield put(DialogActions.showErrorDialog('close', 'issue details', error));
	}
}

const onUpdateEvent = (updatedIssue) => {
	const jobs = selectJobsList(getState());

	if ([STATUSES.CLOSED, STATUSES.VOID].includes(updatedIssue.status)) {
		dispatch(IssuesActions.showCloseInfo(updatedIssue._id));
		setTimeout(() => {
			dispatch(IssuesActions.saveIssueSuccess(prepareIssue(updatedIssue, jobs)));
		}, 5000);
		setTimeout(() => {
			dispatch(IssuesActions.hideCloseInfo(updatedIssue._id));
		}, 6000);
	} else {
		dispatch(IssuesActions.saveIssueSuccess(prepareIssue(updatedIssue, jobs)));
	}
};

const onCreateEvent = (createdIssue) => {
	const jobs = selectJobsList(getState());
	dispatch(IssuesActions.saveIssueSuccess(prepareIssue(createdIssue[0], jobs)));
};

const onResourcesCreated = (resources) => {
	resources = resources.filter((r) => r.issueIds );
	if (!resources.length) {
		return;
	}
	const currentState = getState();
	const teamspace = selectCurrentModelTeamspace(currentState);
	const model = selectCurrentModel(currentState);
	const issueId =  resources[0].issueIds[0];
	dispatch(IssuesActions.attachResourcesSuccess(prepareResources(teamspace, model, resources), issueId));
};

const onResourceDeleted = (resource) => {
	if (!resource.issueIds) {
		return;
	}

	dispatch(IssuesActions.removeResourceSuccess(resource, resource.issueIds[0]));
};

function* subscribeOnIssueChanges({ teamspace, modelId }) {
	yield put(ChatActions.callChannelActions(CHAT_CHANNELS.ISSUES, teamspace, modelId, {
		subscribeToUpdated: onUpdateEvent,
		subscribeToCreated: onCreateEvent
	}));
	yield put(ChatActions.callChannelActions(CHAT_CHANNELS.RESOURCES, teamspace, modelId, {
		subscribeToCreated: onResourcesCreated,
		subscribeToDeleted: onResourceDeleted
	}));
}

function* unsubscribeOnIssueChanges({ teamspace, modelId }) {
	yield put(ChatActions.callChannelActions(CHAT_CHANNELS.ISSUES, teamspace, modelId, {
		unsubscribeFromUpdated: onUpdateEvent,
		unsubscribeFromCreated: onCreateEvent
	}));
	yield put(ChatActions.callChannelActions(CHAT_CHANNELS.RESOURCES, teamspace, modelId, {
		unsubscribeFromCreated: onResourcesCreated,
		unsubscribeFromDeleted: onResourceDeleted
	}));
}

const onUpdateCommentEvent = (updatedComment) => {
	const issueId = selectActiveIssueId(getState());
	dispatch(IssuesActions.updateCommentSuccess(updatedComment, issueId));
};

const onCreateCommentEvent = (createdComment) => {
	const issueId = selectActiveIssueId(getState());
	dispatch(IssuesActions.createCommentSuccess(createdComment, issueId));
};

const onDeleteCommentEvent = (deletedComment) => {
	const issueId = selectActiveIssueId(getState());
	dispatch(IssuesActions.deleteCommentSuccess(deletedComment.guid, issueId));
};

function* subscribeOnIssueCommentsChanges({ teamspace, modelId, issueId }) {
	yield put(ChatActions.callCommentsChannelActions(CHAT_CHANNELS.ISSUES, teamspace, modelId, issueId, {
		subscribeToCreated: onCreateCommentEvent,
		subscribeToUpdated: onUpdateCommentEvent,
		subscribeToDeleted: onDeleteCommentEvent
	}));
}

function* unsubscribeOnIssueCommentsChanges({ teamspace, modelId, issueId }) {
	yield put(ChatActions.callCommentsChannelActions(CHAT_CHANNELS.ISSUES, teamspace, modelId, issueId, {
		unsubscribeFromCreated: onCreateCommentEvent,
		unsubscribeFromUpdated: onUpdateCommentEvent,
		unsubscribeFromDeleted: onDeleteCommentEvent
	}));
}

export function* cloneIssue({ dialogId }) {
	const activeIssue = yield select(selectActiveIssueDetails);
	const jobs = yield select(selectJobsList);
	const currentUser = yield select(selectCurrentUser);
	const clonedProperties = omit(activeIssue, [
		'_id',
		'rev_id',
		'number',
		'owner',
		'comments',
		'created',
		'creator_role',
		'lastUpdated',
		'resources',
		'thumbnail',
		'viewpoint',
		'priority_last_changed',
		'status_last_changed',
	]);

	if (activeIssue.descriptionThumbnail) {
		const base64Image = yield imageUrlToBase64(activeIssue.descriptionThumbnail);
		clonedProperties.descriptionThumbnail = `data:image/png;base64,${base64Image}`;
	}

	try {
		const newIssue = prepareIssue({
			...clonedProperties,
			owner: currentUser.username,
			clone: true,
		}, jobs);

		if (dialogId) {
			yield put(DialogActions.hideDialog(dialogId));
			yield put(BoardActions.openCardDialog(null, null, true));
		}

		yield put(IssuesActions.setComponentState({
			showDetails: true,
			activeIssue: null,
			newIssue
		}));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('prepare', 'clone issue', error));
	}
}
export function* setNewIssue() {
	const jobs = yield select(selectJobsList);
	const currentUser = yield select(selectCurrentUser);
	const topicTypes: any[] = yield select(selectTopicTypes);
	const topicType =  topicTypes.length > 0 ? (topicTypes.find((t) => t === DEFAULT_PROPERTIES.TOPIC_TYPE) ?
		DEFAULT_PROPERTIES.TOPIC_TYPE : topicTypes[0]) : undefined;

	try {
		const newIssue = prepareIssue({
			name: 'Untitled Issue',
			assigned_roles: [],
			status: STATUSES.OPEN,
			priority: PRIORITIES.NONE,
			topic_type: topicType,
			viewpoint: {},
			owner: currentUser.username
		}, jobs);

		yield put(IssuesActions.setComponentState({
			showDetails: true,
			activeIssue: null,
			newIssue
		}));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('prepare', 'new issue', error));
	}
}

function* setFilters({ filters }) {
	try {
		yield put(IssuesActions.setComponentState({ selectedFilters: filters }));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'filters', error));
	}
}

function* toggleSubmodelsIssues({ showSubmodelIssues }) {
	try {
		yield put(IssuesActions.setComponentState({ showSubmodelIssues }));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('toggle', 'submodels issues', error));
	}
}

export function* removeResource({ resource }) {
	try {
		const teamspace = yield select(selectCurrentModelTeamspace);
		const issueId = (yield select(selectActiveIssueDetails))._id;
		const model  = yield select(selectCurrentModel);
		const username = (yield select(selectCurrentUser)).username;

		yield API.removeResourceFromIssue(teamspace, model, issueId, resource._id);
		yield put(IssuesActions.removeResourceSuccess(resource, issueId));
		yield put(IssuesActions.createCommentSuccess(createRemoveResourceComment(username, resource), issueId));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('remove', 'resource', error));
	}
}

export function* attachFileResources({ files }) {
	const names =  files.map((file) => file.name);
	files = files.map((file) => file.file);

	const timeStamp = Date.now();

	const tempResources = files.map((f, i) => (
		{
			_id: timeStamp + i,
			name: names[i] + (f.name.match(EXTENSION_RE) || ['', ''])[0].toLowerCase(),
			uploading: true,
			progress: 0,
			size: 0,
			originalSize: f.size
		})
		);

	const resourceIds = tempResources.map((resource) => resource._id);
	const teamspace = yield select(selectCurrentModelTeamspace);
	const issueId = (yield select(selectActiveIssueDetails))._id;

	try {
		const model  = yield select(selectCurrentModel);
		const username = (yield select(selectCurrentUser)).username;

		yield put(IssuesActions.attachResourcesSuccess( prepareResources(teamspace, model, tempResources), issueId));

		const { data } = yield API.attachFileResourcesToIssue(teamspace, model, issueId, names, files, (progress) => {
			const updates = tempResources.map((r) => (
				{
					progress: progress * 100,
					size : filesize(r.originalSize * progress, {round: 0}).replace(' ', '')
				}
				));

			dispatch(IssuesActions.updateResourcesSuccess(resourceIds, updates, issueId));
		});

		const resources = prepareResources(teamspace, model, data, { uploading: false});

		yield put(IssuesActions.updateResourcesSuccess(resourceIds, resources, issueId));
		yield put(IssuesActions.createCommentsSuccess(createAttachResourceComments(username, data), issueId));
	} catch (error) {
		for (let i = 0; i < resourceIds.length; ++i) {
			yield put(IssuesActions.removeResourceSuccess({_id: resourceIds[i]}, issueId));
		}
		yield put(DialogActions.showEndpointErrorDialog('attach', 'resource', error));
	}
}

const sanitiseURL = (link: string) => {
	try {
		const testURL = new URL(link);
		return link;
	} catch (_) {
		return `http://${link}`;
	}
};

export function* attachLinkResources({ links }) {
	try {
		const teamspace = yield select(selectCurrentModelTeamspace);
		const issueId = (yield select(selectActiveIssueDetails))._id;
		const model = yield select(selectCurrentModel);
		const names = links.map((link) => link.name);
		const urls = links.map((link) => sanitiseURL(link.link));
		const username = (yield select(selectCurrentUser)).username;

		const {data} = yield API.attachLinkResourcesToIssue(teamspace, model, issueId, names, urls);
		const resources = prepareResources(teamspace, model, data);
		yield put(IssuesActions.attachResourcesSuccess(resources, issueId));
		yield put(IssuesActions.createCommentsSuccess(createAttachResourceComments(username, data), issueId));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('remove', 'resource', error));
	}
}

export function * updateActiveIssueViewpoint({screenshot}) {
	const { model, account } = yield select(selectActiveIssueDetails);
	let { viewpoint } = yield generateViewpoint(account, model, '', false);

	if (screenshot) {
		viewpoint = {...viewpoint, screenshot};
	}

	yield put(IssuesActions.updateActiveIssue({viewpoint}));
}

export default function* IssuesSaga() {
	yield takeLatest(IssuesTypes.FETCH_ISSUES, fetchIssues);
	yield takeLatest(IssuesTypes.FETCH_ISSUE, fetchIssue);
	yield takeLatest(IssuesTypes.SAVE_ISSUE, saveIssue);
	yield takeLatest(IssuesTypes.UPDATE_ACTIVE_ISSUE, updateActiveIssue);
	yield takeLatest(IssuesTypes.POST_COMMENT, postComment);
	yield takeLatest(IssuesTypes.REMOVE_COMMENT, removeComment);
	yield takeLatest(IssuesTypes.DOWNLOAD_ISSUES, downloadIssues);
	yield takeLatest(IssuesTypes.PRINT_ISSUES, printIssues);
	yield takeLatest(IssuesTypes.SET_ACTIVE_ISSUE, setActiveIssue);
	yield takeLatest(IssuesTypes.SHOW_DETAILS, showDetails);
	yield takeLatest(IssuesTypes.CLOSE_DETAILS, closeDetails);
	yield takeLatest(IssuesTypes.SUBSCRIBE_ON_ISSUE_CHANGES, subscribeOnIssueChanges);
	yield takeLatest(IssuesTypes.UNSUBSCRIBE_ON_ISSUE_CHANGES, unsubscribeOnIssueChanges);
	yield takeLatest(IssuesTypes.SET_NEW_ISSUE, setNewIssue);
	yield takeLatest(IssuesTypes.CLONE_ISSUE, cloneIssue);
	yield takeLatest(IssuesTypes.EXPORT_BCF, exportBcf);
	yield takeLatest(IssuesTypes.IMPORT_BCF, importBcf);
	yield takeLatest(IssuesTypes.SUBSCRIBE_ON_ISSUE_COMMENTS_CHANGES, subscribeOnIssueCommentsChanges);
	yield takeLatest(IssuesTypes.UNSUBSCRIBE_ON_ISSUE_COMMENTS_CHANGES, unsubscribeOnIssueCommentsChanges);
	yield takeLatest(IssuesTypes.UPDATE_NEW_ISSUE, updateNewIssue);
	yield takeLatest(IssuesTypes.SET_FILTERS, setFilters);
	yield takeLatest(IssuesTypes.TOGGLE_SUBMODELS_ISSUES, toggleSubmodelsIssues);
	yield takeLatest(IssuesTypes.REMOVE_RESOURCE, removeResource);
	yield takeLatest(IssuesTypes.ATTACH_FILE_RESOURCES, attachFileResources);
	yield takeLatest(IssuesTypes.ATTACH_LINK_RESOURCES, attachLinkResources);
	yield takeLatest(IssuesTypes.GO_TO_ISSUE, goToIssue);
	yield takeLatest(IssuesTypes.UPDATE_BOARD_ISSUE, updateBoardIssue);
	yield takeLatest(IssuesTypes.UPDATE_ACTIVE_ISSUE_VIEWPOINT, updateActiveIssueViewpoint);
}
