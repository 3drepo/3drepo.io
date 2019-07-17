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

import { all, put, select, takeLatest } from 'redux-saga/effects';
import { differenceBy, isEmpty, omit, pick, map, groupBy } from 'lodash';
import * as filesize from 'filesize';
import * as API from '../../services/api';
import * as Exports from '../../services/export';
import { getAngularService, dispatch, getState, runAngularViewerTransition } from '../../helpers/migration';
import { getIssuePinColor, prepareIssue } from '../../helpers/issues';
import { prepareComments, prepareComment, createAttachResourceComments,
	createRemoveResourceComment} from '../../helpers/comments';
import { Cache } from '../../services/cache';
import { Viewer } from '../../services/viewer/viewer';
import { PRIORITIES, STATUSES, DEFAULT_PROPERTIES } from '../../constants/issues';
import { PIN_COLORS } from '../../styles';
import { DialogActions } from '../dialog';
import { SnackbarActions } from '../snackbar';
import { selectJobsList, selectMyJob } from '../jobs';
import { selectCurrentUser, selectCurrentTeamspace } from '../currentUser';
import {
	selectActiveIssueId,
	selectIssues,
	selectShowPins,
	selectIssuesMap,
	selectActiveIssueDetails,
	selectFilteredIssues
} from './issues.selectors';
import { IssuesTypes, IssuesActions } from './issues.redux';
import { NEW_PIN_ID } from '../../constants/viewer';
import { selectTopicTypes, selectCurrentModel, selectCurrentModelTeamspace } from '../model';
import { prepareResources } from '../../helpers/resources';
import { EXTENSION_RE } from '../../constants/resources';

export function* fetchIssues({teamspace, modelId, revision}) {
	yield put(IssuesActions.togglePendingState(true));
	try {
		const { data } = yield API.getIssues(teamspace, modelId, revision);
		const jobs = yield select(selectJobsList);

		const preparedIssues = data.map((issue) => prepareIssue(issue, jobs));

		yield put(IssuesActions.fetchIssuesSuccess(preparedIssues));
		yield put(IssuesActions.renderPins());
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('get', 'issues', error));
	}
	yield put(IssuesActions.togglePendingState(false));
}

export function* fetchIssue({teamspace, modelId, issueId}) {
	yield put(IssuesActions.toggleDetailsPendingState(true));

	try {
		const {data} = yield API.getIssue(teamspace, modelId, issueId);
		data.comments = yield prepareComments(data.comments);
		data.resources = prepareResources(teamspace, modelId, data.resources);
		yield put(IssuesActions.fetchIssueSuccess(data));
	} catch (error) {
		yield put(IssuesActions.fetchIssueFailure());
		yield put(DialogActions.showEndpointErrorDialog('get', 'issue', error));
	}
	yield put(IssuesActions.toggleDetailsPendingState(false));
}

const createGroupData = (name, nodes) => {
	const groupData = {
		name,
		color: [255, 0, 0],
		objects: nodes,
		isIssueGroup: true
	};

	return nodes.length === 0 ? null : groupData;
};

const createGroup = (issue, objectInfo, teamspace, model, revision) => {
	const highlightedGroupData = createGroupData(issue.name, objectInfo.highlightedNodes);
	const hiddenGroupData = createGroupData(issue.name, objectInfo.hiddenNodes);

	return Promise.all([
		highlightedGroupData && API.createGroup(teamspace, model, revision, highlightedGroupData),
		hiddenGroupData && API.createGroup(teamspace, model, revision, hiddenGroupData)
	]);
};

const toggleIssuePin = (issue, selected = true) => {
	if (issue && issue.position && issue.position.length > 0 && issue._id) {
		Viewer.changePinColor({
			id: issue._id,
			colours: getIssuePinColor(issue.status, issue.priority, selected)
		});
	}
};

function* updateIssuePin({issue}) {
	yield Viewer.removePin({ id: issue._id });
	if (issue && issue.position && issue.position.length > 0 && issue._id) {
		const { _id } = yield select(selectActiveIssueDetails);

		const isSelectedPin = _id && issue._id === _id;
		const pinColor = isSelectedPin ? PIN_COLORS.YELLOW : PIN_COLORS.BLUE;

		Viewer.addPin({
			id: issue._id,
			type: 'issue',
			account: issue.account,
			model: issue.model,
			pickedPos: issue.position,
			pickedNorm: issue.norm,
			colours: pinColor,
			viewpoint: issue.viewpoint
		});
	}
}

export function* saveIssue({ teamspace, model, issueData, revision, finishSubmitting }) {
	try {
		const pinData = Viewer.getPinData();
		yield Viewer.setPinDropMode(false);
		const myJob = yield select(selectMyJob);

		const [viewpoint, objectInfo, screenshot, userJob] = yield all([
			Viewer.getCurrentViewpoint({ teamspace, model }),
			Viewer.getObjectsStatus(),
			issueData.descriptionThumbnail || Viewer.getScreenshot(),
			myJob
		]);

		const TreeService = getAngularService('TreeService') as any;
		const AnalyticService = getAngularService('AnalyticService') as any;

		viewpoint.hideIfc = TreeService.getHideIfc();

		issueData.rev_id = revision;

		if (objectInfo.highlightedNodes.length > 0 || objectInfo.hiddenNodes.length > 0) {
			const [highlightedGroup, hiddenGroup] = yield createGroup(issueData, objectInfo, teamspace, model, revision);

			if (highlightedGroup) {
				viewpoint.highlighted_group_id = highlightedGroup.data._id;
			}

			if (hiddenGroup) {
				viewpoint.hidden_group_id = hiddenGroup.data._id;
			}
		}

		viewpoint.screenshot = screenshot.substring(screenshot.indexOf(',') + 1);

		const issue = {
			...omit(issueData, ['author', 'statusColor']),
			owner: issueData.author,
			rev_id: revision,
			objectId: null,
			creator_role: userJob._id,
			viewpoint,
			pickedPos: null,
			pickedNorm: null,
			scale: 1.0
		};

		if (pinData !== null) {
			issue.pickedPos = pinData.pickedPos;
			issue.pickedNorm = pinData.pickedNorm;
			Viewer.setPin(null);
		}

		const { data: savedIssue } = yield API.saveIssue(teamspace, model, issue);

		AnalyticService.sendEvent({
			eventCategory: 'Issue',
			eventAction: 'create'
		});

		const jobs = yield select(selectJobsList);
		const preparedIssue = prepareIssue(savedIssue, jobs);

		finishSubmitting();

		yield put(IssuesActions.showDetails(teamspace, model, revision, savedIssue));
		yield put(IssuesActions.saveIssueSuccess(preparedIssue));
		yield put(SnackbarActions.show('Issue created'));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('save', 'issue', error));
	}
}

export function* updateIssue({ teamspace, modelId, issueData }) {
	try {
		const { _id, rev_id } = yield select(selectActiveIssueDetails);
		const { data: updatedIssue } = yield API.updateIssue(teamspace, modelId, _id, rev_id, issueData );
		const AnalyticService = getAngularService('AnalyticService') as any;
		yield AnalyticService.sendEvent({
			eventCategory: 'Issue',
			eventAction: 'edit'
		});

		toggleIssuePin(issueData, true);
		const jobs = yield select(selectJobsList);
		const preparedIssue = prepareIssue(updatedIssue, jobs);
		preparedIssue.comments = yield prepareComments(preparedIssue.comments);

		yield put(IssuesActions.saveIssueSuccess(preparedIssue));
		yield put(IssuesActions.renderPins());
		yield put(SnackbarActions.show('Issue updated'));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('update', 'issue', error));
	}
}

export function* updateNewIssue({ newIssue }) {
	try {
		const jobs = yield select(selectJobsList);
		const preparedIssue = prepareIssue(newIssue, jobs);

		const pinData = yield Viewer.getPinData();
		if (pinData) {
			yield put(IssuesActions.showNewPin(preparedIssue, pinData));
		}
		yield put(IssuesActions.setComponentState({ newIssue: preparedIssue }));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'new issue', error));
	}
}

export function* postComment({ teamspace, modelId, issueData, finishSubmitting }) {
	try {
		const { _id } = yield select(selectActiveIssueDetails);
		const { data: comment } = yield API.addIssueComment(teamspace, modelId, _id, issueData);
		const preparedComment = yield prepareComment(comment);

		finishSubmitting();
		yield put(IssuesActions.createCommentSuccess(preparedComment, _id));
		yield put(SnackbarActions.show('Issue comment added'));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('post', 'issue comment', error));
	}
}

export function* removeComment({ teamspace, modelId, issueData }) {
	try {
		const { _id, guid } = issueData;
		yield API.deleteIssueComment(teamspace, modelId, _id, guid);
		yield put(IssuesActions.deleteCommentSuccess(guid, _id));
		yield put(SnackbarActions.show('Comment removed'));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('remove', 'comment', error));
	}
}

export function* renderPins() {
	try {
		const filteredIssues = yield select(selectFilteredIssues);
		const issuesList = yield select(selectIssues);
		const shouldShowPins = yield select(selectShowPins);
		const invisibleIssues = issuesList.length !== filteredIssues.length
			? differenceBy(issuesList, filteredIssues, '_id')
			: [];

		const activeIssueId = yield select(selectActiveIssueId);
		const removePins = (issues) => issues.forEach((issue) => {
			Viewer.removePin({ id: issue._id });
		});

		yield removePins(!shouldShowPins ? issuesList : invisibleIssues);

		if (shouldShowPins) {
			for (let index = 0; index < filteredIssues.length; index++) {
				const issue = filteredIssues[index];

				const pinPosition = issue.position && issue.position.length;

				if (pinPosition) {
					const isSelectedPin = activeIssueId && issue._id === activeIssueId;
					const pinColor = getIssuePinColor(issue.status, issue.priority, isSelectedPin);

					Viewer.addPin({
						id: issue._id,
						type: 'issue',
						account: issue.account,
						model: issue.model,
						pickedPos: issue.position,
						pickedNorm: issue.norm,
						colours: pinColor,
						viewpoint: issue.viewpoint
					});
				}
			}
		}

		yield Viewer.removePin({ id: NEW_PIN_ID });
	} catch (error) {
		yield put(DialogActions.showErrorDialog('show', 'pins', error));
	}
}

export function* downloadIssues({ teamspace, modelId }) {
	try {
		const filteredIssues = yield select(selectFilteredIssues);
		const issuesIds = map(filteredIssues, '_id').join(',');
		yield Exports.exportIssuesToJSON(teamspace, modelId, issuesIds);
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('download', 'json', error));
	}
}

export function* exportBcf({ teamspace, modelId }) {
	try {

		const filteredIssues = yield select(selectFilteredIssues);
		const issuesIds = map(filteredIssues, '_id').join(',');
		Exports.exportBCF(teamspace, modelId, issuesIds);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('export', 'BCF', error));
	}
}

export function* importBcf({ teamspace, modelId, file, revision }) {
	yield put(IssuesActions.toggleIsImportingBcf(true));

	try {
		yield API.importBCF(teamspace, modelId, file, revision);
		yield put(IssuesActions.fetchIssues(teamspace, modelId, revision));
		yield put(SnackbarActions.show('BCF file uploaded'));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('import', 'BCF', error));
	}

	yield put(IssuesActions.toggleIsImportingBcf(false));
}

export function* printIssues({ teamspace, modelId }) {
	try {
		const filteredIssues = yield select(selectFilteredIssues);
		const issuesIds = map(filteredIssues, '_id').join(',');
		Exports.printIssues(teamspace, modelId, issuesIds);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('print', 'issue', error));
	}
}

const getIssueGroup = async (issue, groupId, revision) => {
	if (!groupId) {
		return null;
	}

	const cachedGroup = Cache.get('issue.group', groupId);
	if (cachedGroup) {
		return cachedGroup;
	}

	const { data } = await API.getGroup(issue.account, issue.model, groupId, revision);

	if (data.hiddenObjects && !issue.viewpoint.group_id) {
		data.hiddenObjects = null;
	}

	Cache.add('issue.group', groupId, data);
	return data;
};

const showMultipleGroups = async (issue, revision) => {
	const TreeService = getAngularService('TreeService') as any;

	const hasViewpointGroups = !isEmpty(pick(issue.viewpoint, [
		'highlighted_group_id',
		'hidden_group_id',
		'shown_group_id'
	]));

	let objects = {} as { hidden: any[], shown: any[], objects: any[] };

	if (hasViewpointGroups) {
		const [highlightedGroupData, hiddenGroupData, shownGroupData] = await Promise.all([
			getIssueGroup(issue, issue.viewpoint.highlighted_group_id, revision),
			getIssueGroup(issue, issue.viewpoint.hidden_group_id, revision),
			getIssueGroup(issue, issue.viewpoint.shown_group_id, revision)
		]) as any;

		if (hiddenGroupData) {
			objects.hidden = hiddenGroupData.objects;
		}

		if (shownGroupData) {
			objects.shown = shownGroupData.objects;
		}

		if (highlightedGroupData) {
			objects.objects = highlightedGroupData.objects;
		}
	} else {
		const hasViewpointDefaultGroup = issue.viewpoint.group_id;
		const groupId = hasViewpointDefaultGroup ? issue.viewpoint.group_id : issue.group_id;
		const groupData = await getIssueGroup(issue, groupId, revision);

		if (groupData.hiddenObjects && !issue.viewpoint.group_id) {
			groupData.hiddenObjects = null;
			Cache.add('issue.group', groupId, groupData);
		}

		objects = groupData;
	}

	if (objects.hidden) {
		TreeService.hideNodesBySharedIds(objects.hidden);
	}

	if (objects.shown) {
		TreeService.isolateNodesBySharedIds(objects.shown);
	}

	if (objects.objects && objects.objects.length > 0) {
		TreeService.selectedIndex = undefined;
		await TreeService.selectNodesBySharedIds(objects.objects);
		window.dispatchEvent(new Event('resize'));
	}
};

export function* focusOnIssue({ issue, revision }) {
	try {
		yield Viewer.isViewerReady();
		yield put(IssuesActions.renderPins());
		const TreeService = getAngularService('TreeService') as any;

		// Remove highlight from any multi objects
		Viewer.highlightObjects([]);
		TreeService.clearCurrentlySelected();

		const hasViewpoint = issue.viewpoint;
		const hasHiddenOrShownGroup = hasViewpoint && (issue.viewpoint.hidden_group_id || issue.viewpoint.shown_group_id);

		// Reset object visibility
		if (hasViewpoint && issue.viewpoint.hideIfc) {
			TreeService.setHideIfc(issue.viewpoint.hideIfc);
		}
		TreeService.showAllTreeNodes(!hasHiddenOrShownGroup);

		const hasViewpointGroup = hasViewpoint && (issue.viewpoint.highlighted_group_id || issue.viewpoint.group_id);
		const hasGroup = issue.group_id;

		if (hasViewpointGroup || hasGroup || hasHiddenOrShownGroup) {
			yield showMultipleGroups(issue, revision);
		}

		const { account, model, viewpoint } = issue;
		if (viewpoint) {
			if (viewpoint.position && viewpoint.position.length > 0) {
				Viewer.setCamera({ ...viewpoint, account, model });
			}

			yield Viewer.updateClippingPlanes({
				clippingPlanes: viewpoint.clippingPlanes,
				account,
				model
			});
		} else {
			yield Viewer.goToDefaultViewpoint();
		}

	} catch (error) {
		yield put(DialogActions.showErrorDialog('focus', 'issue', error));
	}
}

export function* setActiveIssue({ issue, revision }) {
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
			yield put(IssuesActions.fetchIssue(account , model, _id));
		}

		if (activeIssueId !== issue._id) {
			if (activeIssueId) {
				toggleIssuePin(issuesMap[activeIssueId], false);
			}
			toggleIssuePin(issue, true);
		}
		yield all([
			put(IssuesActions.focusOnIssue(issue, revision)),
			put(IssuesActions.setComponentState({ activeIssue: issue._id, expandDetails: true }))
		]);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'issue as active', error));
	}
}

export function* showDetails({ teamspace, model, revision, issue }) {
	try {
		runAngularViewerTransition({
			account: teamspace,
			model,
			revision,
			issueId: issue._id
		});

		yield put(IssuesActions.setActiveIssue(issue, revision));
		yield put(IssuesActions.setComponentState({ showDetails: true }));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('display', 'issue details', error));
	}
}

export function* closeDetails({ teamspace, model, revision }) {
	try {
		const activeIssue = yield select(selectActiveIssueDetails);
		yield Viewer.removePin({ id: NEW_PIN_ID });

		if (activeIssue) {
			runAngularViewerTransition({
				account: teamspace,
				model,
				revision,
				issueId: null
			});
		}

		yield put(IssuesActions.setComponentState({ showDetails: false }));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('close', 'issue details', error));
	}
}

export function* showNewPin({ issue, pinData }) {
	try {
		Viewer.removePin({ id: pinData.id });
		Viewer.setPin(null);

		const data = {
			...pinData,
			account: issue.account,
			model: issue.model,
			colours: PIN_COLORS.SUNGLOW,
			type: 'issue'
		};

		Viewer.addPin(data);
		Viewer.setPin(data);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('display', 'pin', error));
	}
}

export function* toggleShowPins({ showPins }) {
	try {
		yield put(IssuesActions.setComponentState({ showPins }));
		yield put(IssuesActions.renderPins());
	} catch (error) {
		yield put(DialogActions.showErrorDialog('toggle', 'pins', error));
	}
}

const onUpdateEvent = (updatedIssue) => {
	const jobs = selectJobsList(getState());
	if (updatedIssue.comments) {
		updatedIssue.comments = prepareComments(updatedIssue.comments);
	}

	dispatch(IssuesActions.updateIssuePin(updatedIssue));

	if (updatedIssue.status === STATUSES.CLOSED) {

		dispatch(IssuesActions.showCloseInfo(updatedIssue._id));
		setTimeout(() => {
			dispatch(IssuesActions.saveIssueSuccess(prepareIssue(updatedIssue, jobs)));
		}, 5000);
	} else {
		dispatch(IssuesActions.saveIssueSuccess(prepareIssue(updatedIssue, jobs)));
	}
};

const onCreateEvent = (createdIssue) => {
	const jobs = selectJobsList(getState());
	dispatch(IssuesActions.saveIssueSuccess(prepareIssue(createdIssue[0], jobs)));
	dispatch(IssuesActions.updateIssuePin(createdIssue[0]));
};

const onResourcesCreated = (resources) => {
	resources = resources.filter((r) => r.issueIds );
	if (!resources.length) {
		return;
	}
	const currentState = getState();
	const teamspace = selectCurrentTeamspace(currentState);
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

const getIssuesChannel = (teamspace, modelId) => {
	const ChatService = getAngularService('ChatService') as any;
	return ChatService.getChannel(teamspace, modelId).issues;
};

const getResourcesChannel = (teamspace, modelId) => {
	const ChatService = getAngularService('ChatService') as any;
	return ChatService.getChannel(teamspace, modelId).resources;
};

export function* subscribeOnIssueChanges({ teamspace, modelId }) {
	const issuesChatEvents = getIssuesChannel(teamspace, modelId);
	issuesChatEvents.subscribeToUpdated(onUpdateEvent, this);
	issuesChatEvents.subscribeToCreated(onCreateEvent, this);
	const resourcesChatEvents = getResourcesChannel(teamspace, modelId);
	resourcesChatEvents.subscribeToCreated(onResourcesCreated, this);
	resourcesChatEvents.subscribeToDeleted(onResourceDeleted, this);
}

export function* unsubscribeOnIssueChanges({ teamspace, modelId }) {
	const issuesChatEvents = getIssuesChannel(teamspace, modelId);
	issuesChatEvents.unsubscribeFromUpdated(onUpdateEvent);
	issuesChatEvents.unsubscribeFromCreated(onCreateEvent);

	const resourcesChatEvents = getResourcesChannel(teamspace, modelId);
	resourcesChatEvents.unsubscribeFromCreated(onResourcesCreated);
	resourcesChatEvents.unsubscribeFromDeleted(onResourceDeleted);
}

const getCommentsChannel = (teamspace, modelId, issueId) => {
	const issuesCommentsChatevents = getIssuesChannel(teamspace, modelId);
	return issuesCommentsChatevents.getCommentsChatEvents(issueId);
};

const onUpdateCommentEvent = (updatedComment) => {
	const issueId = selectActiveIssueId(getState());
	dispatch(IssuesActions.updateCommentSuccess(updatedComment, issueId));
};

const onCreateCommentEvent = (createdComment) => {
	const preparedComment = prepareComment(createdComment);
	const issueId = selectActiveIssueId(getState());
	dispatch(IssuesActions.createCommentSuccess(preparedComment, issueId));
};

const onDeleteCommentEvent = (deletedComment) => {
	const issueId = selectActiveIssueId(getState());
	dispatch(IssuesActions.deleteCommentSuccess(deletedComment.guid, issueId));
};

export function* subscribeOnIssueCommentsChanges({ teamspace, modelId, issueId }) {
	const commentsChatEvents = getCommentsChannel(teamspace, modelId, issueId);
	commentsChatEvents.subscribeToCreated(onCreateCommentEvent, this);
	commentsChatEvents.subscribeToUpdated(onUpdateCommentEvent, this);
	commentsChatEvents.subscribeToDeleted(onDeleteCommentEvent, this);
}

export function* unsubscribeOnIssueCommentsChanges({ teamspace, modelId, issueId }) {
	const commentsChatEvents = getCommentsChannel(teamspace, modelId, issueId);
	commentsChatEvents.unsubscribeFromCreated(onCreateCommentEvent, this);
	commentsChatEvents.unsubscribeFromUpdated(onUpdateCommentEvent, this);
	commentsChatEvents.unsubscribeFromDeleted(onDeleteCommentEvent, this);
}

export function* setNewIssue() {
	const activeIssue = yield select(selectActiveIssueDetails);
	const issues = yield select(selectIssues);
	const jobs = yield select(selectJobsList);
	const currentUser = yield select(selectCurrentUser);
	const topicTypes: any[] = yield select(selectTopicTypes);

	const topicType =  topicTypes.find((t) => t.value ===  DEFAULT_PROPERTIES.TOPIC_TYPE) ?
						DEFAULT_PROPERTIES.TOPIC_TYPE : topicTypes[0].value;

	try {
		if (activeIssue) {
			toggleIssuePin(activeIssue, false);
		}

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

export function* setFilters({ filters }) {
	try {
		yield put(IssuesActions.setComponentState({ selectedFilters: filters }));
		yield put(IssuesActions.renderPins());
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'filters', error));
	}
}

export function* toggleSubmodelsIssues({ showSubmodelIssues }) {
	try {
		yield put(IssuesActions.setComponentState({ showSubmodelIssues }));
		yield put(IssuesActions.renderPins());
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

		yield API.removeResource(teamspace, model, issueId, resource._id);
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

		const { data } = yield API.attachFileResources(teamspace, model, issueId, names, files, (progress) => {
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

export function* attachLinkResources({ links }) {
	try {
		const teamspace = yield select(selectCurrentModelTeamspace);
		const issueId = (yield select(selectActiveIssueDetails))._id;
		const model = yield select(selectCurrentModel);
		const names = links.map((link) => link.name);
		const urls = links.map((link) => link.link);
		const username = (yield select(selectCurrentUser)).username;

		const {data} = yield API.attachLinkResources(teamspace, model, issueId, names, urls);
		const resources = prepareResources(teamspace, model, data);
		yield put(IssuesActions.attachResourcesSuccess(resources, issueId));
		yield put(IssuesActions.createCommentsSuccess(createAttachResourceComments(username, data), issueId));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('remove', 'resource', error));
	}
}

export default function* IssuesSaga() {
	yield takeLatest(IssuesTypes.FETCH_ISSUES, fetchIssues);
	yield takeLatest(IssuesTypes.FETCH_ISSUE, fetchIssue);
	yield takeLatest(IssuesTypes.SAVE_ISSUE, saveIssue);
	yield takeLatest(IssuesTypes.UPDATE_ISSUE, updateIssue);
	yield takeLatest(IssuesTypes.POST_COMMENT, postComment);
	yield takeLatest(IssuesTypes.REMOVE_COMMENT, removeComment);
	yield takeLatest(IssuesTypes.RENDER_PINS, renderPins);
	yield takeLatest(IssuesTypes.DOWNLOAD_ISSUES, downloadIssues);
	yield takeLatest(IssuesTypes.PRINT_ISSUES, printIssues);
	yield takeLatest(IssuesTypes.SET_ACTIVE_ISSUE, setActiveIssue);
	yield takeLatest(IssuesTypes.SHOW_DETAILS, showDetails);
	yield takeLatest(IssuesTypes.CLOSE_DETAILS, closeDetails);
	yield takeLatest(IssuesTypes.SHOW_NEW_PIN, showNewPin);
	yield takeLatest(IssuesTypes.SUBSCRIBE_ON_ISSUE_CHANGES, subscribeOnIssueChanges);
	yield takeLatest(IssuesTypes.UNSUBSCRIBE_ON_ISSUE_CHANGES, unsubscribeOnIssueChanges);
	yield takeLatest(IssuesTypes.FOCUS_ON_ISSUE, focusOnIssue);
	yield takeLatest(IssuesTypes.SET_NEW_ISSUE, setNewIssue);
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
	yield takeLatest(IssuesTypes.UPDATE_ISSUE_PIN, updateIssuePin);
}
