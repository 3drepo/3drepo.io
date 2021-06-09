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
import { isEmpty, isEqual, map, omit } from 'lodash';
import * as queryString from 'query-string';
import { all, put, select, takeLatest } from 'redux-saga/effects';

import { CHAT_CHANNELS } from '../../constants/chat';
import { RISK_DEFAULT_HIDDEN_LEVELS } from '../../constants/risks';
import { ROUTES } from '../../constants/routes';
import {
	createAttachResourceComments,
	createRemoveResourceComment
} from '../../helpers/comments';

import { EXTENSION_RE } from '../../constants/resources';
import { imageUrlToBase64 } from '../../helpers/imageUrlToBase64';
import { prepareResources } from '../../helpers/resources';
import { SuggestedTreatmentsDialog } from '../../routes/components/dialogContainer/components';
import * as API from '../../services/api';
import * as Exports from '../../services/export';
import { BoardActions } from '../board';
import { ChatActions } from '../chat';
import { selectCurrentUser } from '../currentUser';
import { DialogActions } from '../dialog';
import { selectMyJob } from '../jobs';
import { selectCurrentModel, selectCurrentModelTeamspace } from '../model';
import { selectQueryParams, selectUrlParams } from '../router/router.selectors';
import { selectSelectedStartingDate, SequencesActions } from '../sequences';
import { SnackbarActions } from '../snackbar';
import { dispatch, getState } from '../store';
import { TreeActions } from '../tree';
import { ViewpointsActions } from '../viewpoints';
import { generateViewpoint } from '../viewpoints/viewpoints.sagas';
import { RisksActions, RisksTypes } from './risks.redux';
import {
	selectActiveRiskDetails,
	selectActiveRiskId,
	selectComponentState,
	selectFilteredRisks,
	selectRisksMap
} from './risks.selectors';

function* fetchRisks({teamspace, modelId, revision}) {
	yield put(RisksActions.togglePendingState(true));
	try {
		const {data} = yield API.getRisks(teamspace, modelId, revision);
		yield put(RisksActions.fetchRisksSuccess(data));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('get', 'risks', error));
	}
	yield put(RisksActions.togglePendingState(false));
}

function* fetchRisk({teamspace, modelId, riskId}) {
	yield put(RisksActions.toggleDetailsPendingState(true));

	try {
		const {data} = yield API.getRisk(teamspace, modelId, riskId);
		data.resources = prepareResources(teamspace, modelId, data.resources);
		yield put(RisksActions.fetchMitigationCriteria(teamspace));
		yield put(RisksActions.fetchRiskSuccess(data));
	} catch (error) {
		yield put(RisksActions.fetchRiskFailure());
		yield put(DialogActions.showErrorDialog('get', 'risk', error));
	}
	yield put(RisksActions.toggleDetailsPendingState(false));
}

const createGroupData = (name, nodes) => {
	const groupData = {
		name,
		color: [255, 0, 0],
		objects: nodes,
		isRiskGroup: true
	};

	return nodes.length === 0 ? null : groupData;
};

const createGroup = (risk, objectInfo, teamspace, model, revision) => {
	const highlightedGroupData = createGroupData(risk.name, objectInfo.highlightedNodes);
	const hiddenGroupData = createGroupData(risk.name, objectInfo.hiddenNodes);

	return Promise.all([
		highlightedGroupData && API.createGroup(teamspace, model, revision, highlightedGroupData),
		hiddenGroupData && API.createGroup(teamspace, model, revision, hiddenGroupData)
	]);
};

function* saveRisk({ teamspace, model, riskData, revision, finishSubmitting, ignoreViewer = false  }) {
	yield put(RisksActions.toggleDetailsPendingState(true));
	try {
		const userJob = yield select(selectMyJob);

		let risk = !ignoreViewer ?
			yield generateViewpoint( teamspace, model, riskData.name, !Boolean(riskData.descriptionThumbnail) ) :
			{ viewpoint: {} };

			// .substring(screenshot.indexOf(',') + 1);
		if (riskData.descriptionThumbnail ) {
			risk.viewpoint = {
				...(risk.viewpoint || {}),
				screenshot: riskData.descriptionThumbnail
			};
		}

		risk = {
			...risk,
			...omit(riskData, ['author', 'statusColor', 'roleColor', 'defaultHidden', 'viewpoint', 'descriptionThumbnail']),
			owner: riskData.author,
			rev_id: revision,
			creator_role: userJob._id
		};

		const { data: savedRisk } = yield API.saveRisk(teamspace, model, risk);

		yield put(ViewpointsActions.cacheGroupsFromViewpoint(savedRisk.viewpoint, risk.viewpoint));

		finishSubmitting();
		yield put(RisksActions.setComponentState({ activeRisk: savedRisk._id }));
		yield put(RisksActions.saveRiskSuccess(savedRisk));

		if (!ignoreViewer) {
			yield put(RisksActions.showDetails(revision, savedRisk._id));
			yield put(RisksActions.goToRisk(savedRisk));
		} else {
			yield put(DialogActions.hideDialog());
		}

		yield put(SnackbarActions.show('Risk created'));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('save', 'risk', error));
	}
	yield put(RisksActions.toggleDetailsPendingState(false));
}

function* updateRisk({ teamspace, modelId, riskData }) {
	try {
		const { _id, rev_id, position } = yield select(selectActiveRiskDetails);
		let { data: updatedRisk } = yield API.updateRisk(teamspace, modelId, _id, rev_id, riskData);
		updatedRisk.resources = prepareResources(teamspace, modelId, updatedRisk.resources);

		updatedRisk = {...updatedRisk, ...riskData};

		yield put(RisksActions.setComponentState({ savedPin: position }));
		yield put(RisksActions.saveRiskSuccess(updatedRisk));
		yield put(SnackbarActions.show('Risk updated'));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('update', 'risk', error));
	}
}

function* updateBoardRisk({ teamspace, modelId, riskData }) {
	try {
		const { _id, ...changedData } = riskData;
		const { data: updatedRisk } = yield API.updateRisk(teamspace, modelId, _id, null, changedData);
		yield put(RisksActions.saveRiskSuccess(updatedRisk));
		yield put(SnackbarActions.show('Risk updated'));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('update', 'board risk', error));
	}
}

function* updateNewRisk({ newRisk }) {
	try {
		yield put(RisksActions.setComponentState({ newRisk }));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'new risk', error));
	}
}

function* postComment({ teamspace, modelId, riskData, ignoreViewer, finishSubmitting }) {
	yield put(RisksActions.togglePostCommentPendingState(true));
	try {
		const { _id, account, model } = yield select(selectActiveRiskDetails);
		const { viewpoint } = !ignoreViewer ?  yield generateViewpoint( account, model, '', false) : {viewpoint: {}};

		riskData.viewpoint = {
			...viewpoint,
			... riskData.viewpoint
		};

		if (isEmpty(riskData.viewpoint) || isEqual(riskData.viewpoint, { screenshot: '' }) ) {
			delete riskData.viewpoint;
		}

		const { data: comment } = yield API.addRiskComment(teamspace, modelId, _id, riskData);

		if (comment.viewpoint) {
			yield put(ViewpointsActions.cacheGroupsFromViewpoint(comment.viewpoint, riskData.viewpoint));
		}

		finishSubmitting();
		yield put(RisksActions.createCommentSuccess(comment, riskData._id));
		yield put(SnackbarActions.show('Risk comment added'));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('post', 'risk comment', error));
	}
	yield put(RisksActions.togglePostCommentPendingState(false));
}

function* removeComment({ teamspace, modelId, riskData }) {
	try {
		const { _id, guid } = riskData;
		yield API.deleteRiskComment(teamspace, modelId, _id, guid);
		yield put(RisksActions.deleteCommentSuccess(guid, _id));
		yield put(SnackbarActions.show('Comment removed'));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('remove', 'comment', error));
	}

}

function* downloadRisks({ teamspace, modelId }) {
	try {
		const filteredRisks = yield select(selectFilteredRisks);
		const riskNumbers = map(filteredRisks, 'number').join(',');
		yield Exports.exportRisksToJSON(teamspace, modelId, riskNumbers);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'risk', error));
	}
}

function* printRisks({ teamspace, modelId }) {
	try {
		const filteredRisks = yield select(selectFilteredRisks);
		const riskNumbers = map(filteredRisks, 'number').join(',');
		Exports.printRisks(teamspace, modelId, riskNumbers);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'risk', error));
	}
}

function* setActiveRisk({ risk, revision, ignoreViewer = false }) {
	try {
		if (risk) {
			yield all([
				!ignoreViewer ? put(ViewpointsActions.showViewpoint(risk?.account, risk?.model, risk)) : null,
				put(RisksActions.setComponentState({ activeRisk: risk._id, expandDetails: true }))
			]);
		} else {
			yield put(RisksActions.setComponentState({ activeRisk: null }));
			yield put(TreeActions.clearCurrentlySelected());
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'risk as active', error));
	}
}

function* goToRisk({ risk }) {
	const {teamspace, model, revision} = yield select(selectUrlParams);
	let queryParams =  yield select(selectQueryParams);

	const riskId = (risk || {})._id;
	const path = [ROUTES.VIEWER, teamspace, model, revision].filter(Boolean).join('/');

	queryParams = riskId ?  {... queryParams, riskId} : omit(queryParams, 'riskId');
	let query = queryString.stringify(queryParams);
	if (query) {
		query = '?' + query;
	}

	yield put(push(`${path}${query}`));
}

function* showDetails({ revision, riskId }) {
	try {
		const risksMap = yield select(selectRisksMap);
		const risk = risksMap[riskId];

		yield put(RisksActions.setActiveRisk(risk, revision));
		yield put(RisksActions.setComponentState({ showDetails: true, savedPin: risk.position }));

		if (risk.sequence_start) {
			yield put(SequencesActions.setSelectedDate(risk.sequence_start));
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('display', 'risk details', error));
	}
}

function* closeDetails() {
	try {
		const activeRisk = yield select(selectActiveRiskDetails);
		const componentState = yield select(selectComponentState);

		if (componentState.showDetails) {
			if (!isEqual(activeRisk.position, componentState.savedPin)) {
				yield put(RisksActions.updateSelectedRiskPin(componentState.savedPin));
			}

			yield put(RisksActions.setComponentState({ showDetails: false, savedPin: null }));
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('close', 'risk details', error));
	}
}

const onUpdateEvent = (updatedRisk) => {
	if (RISK_DEFAULT_HIDDEN_LEVELS.includes(updatedRisk.mitigation_status)) {
		dispatch(RisksActions.showCloseInfo(updatedRisk._id));
		setTimeout(() => {
			dispatch(RisksActions.saveRiskSuccess(updatedRisk, false));
		}, 5000);
		setTimeout(() => {
			dispatch(RisksActions.hideCloseInfo(updatedRisk._id));
		}, 6000);
	} else {
		dispatch(RisksActions.saveRiskSuccess(updatedRisk, false));
	}
};

const onCreateEvent = (createdRisk) => {
	dispatch(RisksActions.saveRiskSuccess(createdRisk[0], false));
};

function* subscribeOnRiskChanges({ teamspace, modelId }) {
	yield put(ChatActions.callChannelActions(CHAT_CHANNELS.RISKS, teamspace, modelId, {
		subscribeToUpdated: onUpdateEvent,
		subscribeToCreated: onCreateEvent
	}));
}

function* unsubscribeOnRiskChanges({ teamspace, modelId }) {
	yield put(ChatActions.callChannelActions(CHAT_CHANNELS.RISKS, teamspace, modelId, {
		unsubscribeFromUpdated: onUpdateEvent,
		unsubscribeFromCreated: onCreateEvent
	}));
}

const onUpdateCommentEvent = (updatedComment) => {
	const riskId = selectActiveRiskId(getState());
	dispatch(RisksActions.updateCommentSuccess(updatedComment, riskId));
};

const onCreateCommentEvent = (createdComment) => {
	const riskId = selectActiveRiskId(getState());
	dispatch(RisksActions.createCommentSuccess(createdComment, riskId));
};

const onDeleteCommentEvent = (deletedComment) => {
	const riskId = selectActiveRiskId(getState());
	dispatch(RisksActions.deleteCommentSuccess(deletedComment.guid, riskId));
};

function* subscribeOnRiskCommentsChanges({ teamspace, modelId, riskId }) {
	yield put(ChatActions.callCommentsChannelActions(CHAT_CHANNELS.RISKS, teamspace, modelId, riskId, {
		subscribeToCreated: onCreateCommentEvent,
		subscribeToUpdated: onUpdateCommentEvent,
		subscribeToDeleted: onDeleteCommentEvent
	}));
}

function* unsubscribeOnRiskCommentsChanges({ teamspace, modelId, riskId }) {
	yield put(ChatActions.callCommentsChannelActions(CHAT_CHANNELS.RISKS, teamspace, modelId, riskId, {
		unsubscribeFromCreated: onCreateCommentEvent,
		unsubscribeFromUpdated: onUpdateCommentEvent,
		unsubscribeFromDeleted: onDeleteCommentEvent
	}));
}

function* cloneRisk({ dialogId }) {
	const activeRisk = yield select(selectActiveRiskDetails);
	const currentUser = yield select(selectCurrentUser);
	const clonedProperties = omit(activeRisk, [
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

	if (activeRisk.descriptionThumbnail) {
		const base64Image = yield imageUrlToBase64(activeRisk.descriptionThumbnail);
		clonedProperties.descriptionThumbnail = `data:image/png;base64,${base64Image}`;
	}

	try {
		const newRisk = {
			...clonedProperties,
			owner: currentUser.username,
			clone: true,
		};

		if (dialogId) {
			yield put(DialogActions.hideDialog(dialogId));
			yield put(BoardActions.openCardDialog(null, null, true));
		}

		yield put(RisksActions.setComponentState({
			showDetails: true,
			activeRisk: null,
			newRisk
		}));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('prepare', 'clone risk', error));
	}
}

function* setNewRisk() {
	const currentUser = yield select(selectCurrentUser);

	// tslint:disable-next-line: variable-name
	let sequence_start = yield select(selectSelectedStartingDate);

	if (sequence_start) {
		sequence_start = sequence_start.valueOf();
	}

	try {
		const newRisk = {
			name: 'Untitled risk',
			associated_activity: '',
			assigned_roles: [],
			category: '',
			comments: [],
			safetibase_id: '',
			likelihood: 0,
			consequence: 0,
			level_of_risk: 0,
			overall_level_of_risk: 0,
			residual_likelihood: -1,
			residual_consequence: -1,
			residual_level_of_risk: -1,
			mitigation_status: '',
			mitigation_desc: '',
			residual_risk: '',
			viewpoint: {},
			owner: currentUser.username,
			sequence_start
		};

		yield put(RisksActions.setComponentState({
			showDetails: true,
			activeRisk: null,
			newRisk
		}));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('prepare', 'new risk', error));
	}
}

function* setFilters({ filters }) {
	try {
		yield put(RisksActions.setComponentState({ selectedFilters: filters }));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'filters', error));
	}
}

export function* removeResource({ resource }) {
	try {
		const teamspace = yield select(selectCurrentModelTeamspace);
		const issueId = (yield select(selectActiveRiskDetails))._id;
		const model  = yield select(selectCurrentModel);
		const username = (yield select(selectCurrentUser)).username;

		yield API.removeResourceFromRisk(teamspace, model, issueId, resource._id);
		yield put(RisksActions.removeResourceSuccess(resource, issueId));
		yield put(RisksActions.createCommentSuccess(createRemoveResourceComment(username, resource), issueId));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('remove', 'resource', error));
	}
}

export function* attachFileResources({ files }) {
	const names = files.map((file) => file.name);
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
		}
	));

	const resourceIds = tempResources.map((resource) => resource._id);
	const teamspace = yield select(selectCurrentModelTeamspace);
	const issueId = (yield select(selectActiveRiskDetails))._id;

	try {
		const model  = yield select(selectCurrentModel);
		const username = (yield select(selectCurrentUser)).username;

		yield put(RisksActions.attachResourcesSuccess( prepareResources(teamspace, model, tempResources), issueId));

		const { data } = yield API.attachFileResourcesToRisk(teamspace, model, issueId, names, files, (progress) => {
			const updates = tempResources.map((r) => (
				{
					progress: progress * 100,
					size : filesize(r.originalSize * progress, {round: 0}).replace(' ', '')
				}
				));

			dispatch(RisksActions.updateResourcesSuccess(resourceIds, updates, issueId));
		});

		const resources = prepareResources(teamspace, model, data, { uploading: false});

		yield put(RisksActions.updateResourcesSuccess(resourceIds, resources, issueId));

		const comments = createAttachResourceComments(username, data);

		yield all(comments.map((c) => put(RisksActions.createCommentSuccess(c, issueId))));
	} catch (error) {
		for (let i = 0; i < resourceIds.length; ++i) {
			yield put(RisksActions.removeResourceSuccess({_id: resourceIds[i]}, issueId));
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
		const issueId = (yield select(selectActiveRiskDetails))._id;
		const model = yield select(selectCurrentModel);
		const names = links.map((link) => link.name);
		const urls = links.map((link) => sanitiseURL(link.link));
		const username = (yield select(selectCurrentUser)).username;

		const {data} = yield API.attachLinkResourcesToRisk(teamspace, model, issueId, names, urls);
		const resources = prepareResources(teamspace, model, data);
		yield put(RisksActions.attachResourcesSuccess(resources, issueId));

		const comments = createAttachResourceComments(username, data);
		yield all(comments.map((c) => put(RisksActions.createCommentSuccess(c, issueId))));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('remove', 'resource', error));
	}
}

function* fetchMitigationCriteria({ teamspace }) {
	try {
		const {data} = yield API.getMitigationCriteria(teamspace);
		yield put(RisksActions.fetchMitigationCriteriaSuccess(data, teamspace));
	} catch (error) {
		yield put(RisksActions.fetchMitigationCriteriaFailure());
		yield put(DialogActions.showErrorDialog('get', 'mitigation criteria', error));
	}
}

function* showMitigationSuggestions({conditions, setFieldValue}) {
	try {
		const teamspace = yield select(selectCurrentModelTeamspace);
		const { data } = yield API.getMitigationSuggestions(teamspace, conditions);

		const config = {
			title: 'Suggested Treatments',
			template: SuggestedTreatmentsDialog,
			data: {
				setFieldValue,
				suggestions: data,
			}
		};
		yield put(DialogActions.showDialog(config));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('post', 'mitigation suggestions', error));
	}
}

export function * updateActiveRiskViewpoint({screenshot}) {
	const { model, account } = yield select(selectActiveRiskDetails);
	let { viewpoint } = yield generateViewpoint(account, model, '', false);

	if (screenshot) {
		viewpoint = {...viewpoint, screenshot};
	}

	yield put(RisksActions.updateRisk(account, model, {viewpoint}));
}

export default function* RisksSaga() {
	yield takeLatest(RisksTypes.FETCH_RISKS, fetchRisks);
	yield takeLatest(RisksTypes.FETCH_RISK, fetchRisk);
	yield takeLatest(RisksTypes.SAVE_RISK, saveRisk);
	yield takeLatest(RisksTypes.UPDATE_RISK, updateRisk);
	yield takeLatest(RisksTypes.POST_COMMENT, postComment);
	yield takeLatest(RisksTypes.REMOVE_COMMENT, removeComment);
	yield takeLatest(RisksTypes.DOWNLOAD_RISKS, downloadRisks);
	yield takeLatest(RisksTypes.PRINT_RISKS, printRisks);
	yield takeLatest(RisksTypes.SET_ACTIVE_RISK, setActiveRisk);
	yield takeLatest(RisksTypes.SHOW_DETAILS, showDetails);
	yield takeLatest(RisksTypes.CLOSE_DETAILS, closeDetails);
	yield takeLatest(RisksTypes.SUBSCRIBE_ON_RISK_CHANGES, subscribeOnRiskChanges);
	yield takeLatest(RisksTypes.UNSUBSCRIBE_ON_RISK_CHANGES, unsubscribeOnRiskChanges);
	yield takeLatest(RisksTypes.SET_NEW_RISK, setNewRisk);
	yield takeLatest(RisksTypes.CLONE_RISK, cloneRisk);
	yield takeLatest(RisksTypes.SUBSCRIBE_ON_RISK_COMMENTS_CHANGES, subscribeOnRiskCommentsChanges);
	yield takeLatest(RisksTypes.UNSUBSCRIBE_ON_RISK_COMMENTS_CHANGES, unsubscribeOnRiskCommentsChanges);
	yield takeLatest(RisksTypes.UPDATE_NEW_RISK, updateNewRisk);
	yield takeLatest(RisksTypes.SET_FILTERS, setFilters);
	yield takeLatest(RisksTypes.GO_TO_RISK, goToRisk);
	yield takeLatest(RisksTypes.UPDATE_BOARD_RISK, updateBoardRisk);
	yield takeLatest(RisksTypes.REMOVE_RESOURCE, removeResource);
	yield takeLatest(RisksTypes.ATTACH_FILE_RESOURCES, attachFileResources);
	yield takeLatest(RisksTypes.ATTACH_LINK_RESOURCES, attachLinkResources);
	yield takeLatest(RisksTypes.FETCH_MITIGATION_CRITERIA, fetchMitigationCriteria);
	yield takeLatest(RisksTypes.SHOW_MITIGATION_SUGGESTIONS, showMitigationSuggestions);
	yield takeLatest(RisksTypes.UPDATE_ACTIVE_RISK_VIEWPOINT, updateActiveRiskViewpoint);
}
