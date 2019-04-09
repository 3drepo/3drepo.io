/**
 *  Copyright (C) 2019 3D Repo Ltd
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
import { differenceBy, isEmpty, omit, pick, map } from 'lodash';

import * as API from '../../services/api';
import * as Exports from '../../services/export';
import { getAngularService, dispatch, getState, runAngularViewerTransition } from '../../helpers/migration';
import { getRiskPinColor, prepareRisk } from '../../helpers/risks';
import { prepareComments, prepareComment } from '../../helpers/comments';
import { Cache } from '../../services/cache';
import { Viewer } from '../../services/viewer/viewer';
import { RISK_LEVELS } from '../../constants/risks';
import { DialogActions } from '../dialog';
import { SnackbarActions } from '../snackbar';
import { selectJobsList, selectMyJob } from '../jobs';
import { selectCurrentUser } from '../currentUser';
import {
	selectActiveRiskId,
	selectRisks,
	selectShowPins,
	selectRisksMap,
	selectActiveRiskDetails,
	selectFilteredRisks
} from './risks.selectors';
import { RisksActions, RisksTypes } from './risks.redux';

export function* fetchRisks({teamspace, modelId, revision}) {
	yield put(RisksActions.togglePendingState(true));
	try {
		const {data} = yield API.getRisks(teamspace, modelId, revision);
		const jobs = yield select(selectJobsList);

		const preparedRisks = data.map((risk) => prepareRisk(risk, jobs));

		yield put(RisksActions.fetchRisksSuccess(preparedRisks));
		yield put(RisksActions.renderPins());
	} catch (error) {
		yield put(DialogActions.showErrorDialog('get', 'risks', error));
	}
	yield put(RisksActions.togglePendingState(false));
}

export function* fetchRisk({teamspace, modelId, riskId}) {
	yield put(RisksActions.toggleDetailsPendingState(true));

	try {
		const {data} = yield API.getRisk(teamspace, modelId, riskId);
		data.comments = yield prepareComments(data.comments);
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

const toggleRiskPin = (risk, selected = true) => {
	if (risk && risk.position && risk.position.length > 0 && risk._id) {
		Viewer.changePinColor({
			id: risk._id,
			colours: getRiskPinColor(risk.overall_level_of_risk, selected)
		});
	}
};

export function* saveRisk({ teamspace, model, riskData, revision }) {
	try {
		yield Viewer.setPinDropMode(false);
		const myJob = yield select(selectMyJob);

		const [viewpoint, objectInfo, screenshot, userJob] = yield all([
			Viewer.getCurrentViewpoint({ teamspace, model }),
			Viewer.getObjectsStatus(),
			riskData.descriptionThumbnail || Viewer.getScreenshot(),
			myJob
		]);

		const TreeService = getAngularService('TreeService') as any;
		const AnalyticService = getAngularService('AnalyticService') as any;

		viewpoint.hideIfc = TreeService.getHideIfc();

		riskData.rev_id = revision;

		if (objectInfo.highlightedNodes.length > 0 || objectInfo.hiddenNodes.length > 0) {
			const [highlightedGroup, hiddenGroup] = yield createGroup(riskData, objectInfo, teamspace, model, revision);

			if (highlightedGroup) {
				viewpoint.highlighted_group_id = highlightedGroup.data._id;
			}

			if (hiddenGroup) {
				viewpoint.hidden_group_id = hiddenGroup.data._id;
			}
		}

		viewpoint.screenshot = screenshot.substring(screenshot.indexOf(',') + 1);

		const risk = {
			...omit(riskData, ['author', 'statusColor']),
			owner: riskData.author,
			rev_id: revision,
			objectId: null,
			creator_role: userJob._id,
			viewpoint,
			pickedPos: null,
			pickedNorm: null,
			scale: 1.0
		};

		const pinData = Viewer.getPinData();
		if (pinData !== null) {
			risk.pickedPos = pinData.pickedPos;
			risk.pickedNorm = pinData.pickedNorm;
		}

		const { data: savedRisk } = yield API.saveRisk(teamspace, model, risk);

		AnalyticService.sendEvent({
			eventCategory: 'Risk',
			eventAction: 'create'
		});

		const jobs = yield select(selectJobsList);
		const preparedRisk = prepareRisk(savedRisk, jobs);

		yield put(RisksActions.showDetails(teamspace, model, revision, preparedRisk));
		yield put(RisksActions.saveRiskSuccess(preparedRisk));
		yield put(SnackbarActions.show('Risk created'));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('save', 'risk', error));
	}
}

export function* updateRisk({ teamspace, modelId, riskData }) {
	try {
		const { data: updatedRisk } = yield API.updateRisk(teamspace, modelId, riskData);
		const AnalyticService = getAngularService('AnalyticService') as any;
		yield AnalyticService.sendEvent({
			eventCategory: 'Risk',
			eventAction: 'edit'
		});

		toggleRiskPin(riskData, true);
		const jobs = yield select(selectJobsList);
		const preparedRisk = prepareRisk(updatedRisk, jobs);
		preparedRisk.comments = yield prepareComments(preparedRisk.comments);

		yield put(RisksActions.saveRiskSuccess(preparedRisk));
		yield put(RisksActions.renderPins());
		yield put(SnackbarActions.show('Risk updated'));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'risk', error));
	}
}

export function* updateNewRisk({ newRisk }) {
	try {
		const jobs = yield select(selectJobsList);
		const preparedRisk = prepareRisk(newRisk, jobs);

		const pinData = yield Viewer.getPinData();
		if (pinData) {
			yield put(RisksActions.showNewPin(preparedRisk, pinData));
		}
		yield put(RisksActions.setComponentState({ newRisk: preparedRisk }));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'new risk', error));
	}
}

export function* postComment({ teamspace, modelId, riskData }) {
	try {
		const { data: comment } = yield API.updateRisk(teamspace, modelId, riskData);
		const preparedComment = yield prepareComment(comment);

		yield put(RisksActions.createCommentSuccess(preparedComment, riskData._id));
		yield put(SnackbarActions.show('Risk comment added'));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('post', 'risk comment', error));
	}
}

export function* removeComment({ teamspace, modelId, riskData }) {
	try {
		const { commentIndex, _id, rev_id, guid } = riskData;
		const commentData = {
			comment: '',
			delete: true,
			commentIndex,
			_id,
			rev_id
		};

		yield API.updateRisk(teamspace, modelId, commentData);
		yield put(RisksActions.deleteCommentSuccess(guid));
		yield put(SnackbarActions.show('Comment removed'));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('remove', 'comment', error));
	}
}

export function* renderPins() {
	try {
		const filteredRisks = yield select(selectFilteredRisks);
		const risksList = yield select(selectRisks);
		const shouldShowPins = yield select(selectShowPins);
		const invisibleRisks = risksList.length !== filteredRisks.length
			? differenceBy(risksList, filteredRisks, '_id')
			: [] ;

		const activeRiskId = yield select(selectActiveRiskId);
		const removePins = (risks) => risks.forEach((risk) => {
			Viewer.removePin({ id: risk._id });
		});

		yield removePins(!shouldShowPins ? risksList : invisibleRisks);

		if (shouldShowPins) {
			for (let index = 0; index < filteredRisks.length; index++) {
				const risk = filteredRisks[index];

				const pinPosition = risk.position && risk.position.length;

				if (pinPosition) {
					const levelOfRisk = (risk.overall_level_of_risk !== undefined) ? risk.overall_level_of_risk : 4;
					const isSelectedPin = activeRiskId && risk._id === activeRiskId;
					const pinColor = getRiskPinColor(levelOfRisk, isSelectedPin);
					Viewer.addPin({
						id: risk._id,
						type: 'risk',
						account: risk.account,
						model: risk.model,
						pickedPos: risk.position,
						pickedNorm: risk.norm,
						colours: pinColor,
						viewpoint: risk.viewpoint
					});
				}
			}
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('show', 'pins', error));
	}
}

export function* downloadRisks({ teamspace, modelId }) {
	try {
		const filteredRisks = yield select(selectFilteredRisks);
		const risksIds = map(filteredRisks, '_id').join(',');
		yield Exports.exportRisksToJSON(teamspace, modelId, risksIds);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'risk', error));
	}
}

export function* printRisks({ teamspace, modelId }) {
	try {
		const filteredRisks = yield select(selectFilteredRisks);
		const risksIds = map(filteredRisks, '_id').join(',');
		Exports.printRisks(teamspace, modelId, risksIds);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'risk', error));
	}
}

const getRiskGroup = async (risk, groupId, revision) => {
	if (!groupId) {
		return null;
	}

	const cachedGroup = Cache.get('risk.group', groupId);
	if (cachedGroup) {
		return cachedGroup;
	}

	const { data } = await API.getGroup(risk.account, risk.model, groupId, revision);

	if (data.hiddenObjects && !risk.viewpoint.group_id) {
		data.hiddenObjects = null;
	}

	Cache.add('risk.group', groupId, data);
	return data;
};

const showMultipleGroups = async (risk, revision) => {
	const TreeService = getAngularService('TreeService') as any;

	const hasViewpointGroups = !isEmpty(pick(risk.viewpoint, [
		'highlighted_group_id',
		'hidden_group_id',
		'shown_group_id'
	]));

	let objects = {} as { hidden: any[], shown: any[], objects: any[] };

	if (hasViewpointGroups) {
		const [highlightedGroupData, hiddenGroupData, shownGroupData] = await Promise.all([
			getRiskGroup(risk, risk.viewpoint.highlighted_group_id, revision),
			getRiskGroup(risk, risk.viewpoint.hidden_group_id, revision),
			getRiskGroup(risk, risk.viewpoint.shown_group_id, revision)
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
		const hasViewpointDefaultGroup = risk.viewpoint.group_id;
		const groupId = hasViewpointDefaultGroup ? risk.viewpoint.group_id : risk.group_id;
		const groupData = await getRiskGroup(risk, groupId, revision);

		if (groupData.hiddenObjects && !risk.viewpoint.group_id) {
			groupData.hiddenObjects = null;
			Cache.add('risk.group', groupId, groupData);
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

export function* focusOnRisk({ risk, revision }) {
	try {
		yield Viewer.isViewerReady();
		yield put(RisksActions.renderPins());
		const TreeService = getAngularService('TreeService') as any;

		// Remove highlight from any multi objects
		Viewer.highlightObjects([]);
		TreeService.clearCurrentlySelected();

		const hasViewpoint = risk.viewpoint;
		const hasHiddenOrShownGroup = hasViewpoint && (risk.viewpoint.hidden_group_id || risk.viewpoint.shown_group_id);

		// Reset object visibility
		if (hasViewpoint && risk.viewpoint.hideIfc) {
			TreeService.setHideIfc(risk.viewpoint.hideIfc);
		}
		TreeService.showAllTreeNodes(!hasHiddenOrShownGroup);

		const hasViewpointGroup = hasViewpoint && (risk.viewpoint.highlighted_group_id || risk.viewpoint.group_id);
		const hasGroup = risk.group_id;

		if (hasViewpointGroup || hasGroup || hasHiddenOrShownGroup) {
			yield showMultipleGroups(risk, revision);
		}

		const { account, model, viewpoint } = risk;
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
		yield put(DialogActions.showErrorDialog('focus', 'risk', error));
	}
}

export function* setActiveRisk({ risk, revision }) {
	try {
		const activeRiskId = yield select(selectActiveRiskId);
		const risksMap = yield select(selectRisksMap);

		if (activeRiskId !== risk._id) {
			if (activeRiskId) {
				toggleRiskPin(risksMap[activeRiskId], false);
			}
			toggleRiskPin(risk, true);
		}
		yield all([
			put(RisksActions.focusOnRisk(risk, revision)),
			put(RisksActions.setComponentState({ activeRisk: risk._id, expandDetails: true }))
		]);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'risk as active', error));
	}
}

export function* showDetails({ teamspace, model, revision, risk }) {
	try {
		runAngularViewerTransition({
			account: teamspace,
			model,
			revision,
			riskId: risk._id
		});

		yield put(RisksActions.setActiveRisk(risk, revision));
		yield put(RisksActions.setComponentState({ showDetails: true }));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('display', 'risk details', error));
	}
}

export function* closeDetails({ teamspace, model, revision }) {
	try {
		const activeRisk = yield select(selectActiveRiskDetails);
		if (activeRisk) {
			runAngularViewerTransition({
				account: teamspace,
				model,
				revision,
				riskId: null,
				noSet: true
			});
		}

		yield put(RisksActions.setComponentState({ showDetails: false }));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('close', 'risk details', error));
	}
}

export function* showNewPin({ risk, pinData }) {
	try {
		Viewer.removePin({ id: pinData.id });
		Viewer.setPin(null);

		const data = {
			...pinData,
			account: risk.account,
			model: risk.model,
			colours: getRiskPinColor(risk.overall_level_of_risk, true),
			type: 'risk'
		};

		Viewer.addPin(data);
		Viewer.setPin(data);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('display', 'pin', error));
	}
}

export function* toggleShowPins({ showPins }) {
	try {
		yield put(RisksActions.setComponentState({ showPins }));
		yield put(RisksActions.renderPins());
	} catch (error) {
		yield put(DialogActions.showErrorDialog('toggle', 'pins', error));
	}
}

const onUpdateEvent = (updatedRisk) => {
	const jobs = selectJobsList(getState());
	if (updatedRisk.status === RISK_LEVELS.AGREED_FULLY) {
		dispatch(RisksActions.showCloseInfo(updatedRisk._id));
		setTimeout(() => {
			dispatch(RisksActions.saveRiskSuccess(prepareRisk(updatedRisk, jobs)));
		}, 5000);
	} else {
		dispatch(RisksActions.saveRiskSuccess(prepareRisk(updatedRisk, jobs)));
	}
};

const onCreateEvent = (createdRisk) => {
	const jobs = selectJobsList(getState());
	dispatch(RisksActions.saveRiskSuccess(prepareRisk(createdRisk[0], jobs)));
};

const getRisksChannel = (teamspace, modelId) => {
	const ChatService = getAngularService('ChatService') as any;
	return ChatService.getChannel(teamspace, modelId).risks;
};

export function* subscribeOnRiskChanges({ teamspace, modelId }) {
	const risksNotifications = getRisksChannel(teamspace, modelId);
	risksNotifications.subscribeToUpdated(onUpdateEvent, this);
	risksNotifications.subscribeToCreated(onCreateEvent, this);
}

export function* unsubscribeOnRiskChanges({ teamspace, modelId }) {
	const risksNotifications = getRisksChannel(teamspace, modelId);
	risksNotifications.unsubscribeFromUpdated(onUpdateEvent);
	risksNotifications.unsubscribeFromCreated(onCreateEvent);
}

const getCommentsChannel = (teamspace, modelId, riskId) => {
	const risksNotifications = getRisksChannel(teamspace, modelId);
	return risksNotifications.getCommentsChatEvents(riskId);
};

const onUpdateCommentEvent = (updatedComment) => {
	const riskId = selectActiveRiskId(getState());
	dispatch(RisksActions.updateCommentSuccess(updatedComment, riskId));
};

const onCreateCommentEvent = (createdComment) => {
	const preparedComment = prepareComment(createdComment);
	const riskId = selectActiveRiskId(getState());
	dispatch(RisksActions.createCommentSuccess(preparedComment, riskId));
};

const onDeleteCommentEvent = (deletedComment) => {
	const riskId = selectActiveRiskId(getState());
	dispatch(RisksActions.deleteCommentSuccess(deletedComment.guid, riskId));
};

export function* subscribeOnRiskCommentsChanges({ teamspace, modelId, riskId }) {
	const commentsNotifications = getCommentsChannel(teamspace, modelId, riskId);
	commentsNotifications.subscribeToCreated(onCreateCommentEvent, this);
	commentsNotifications.subscribeToUpdated(onUpdateCommentEvent, this);
	commentsNotifications.subscribeToDeleted(onDeleteCommentEvent, this);
}

export function* unsubscribeOnRiskCommentsChanges({ teamspace, modelId, riskId }) {
	const commentsNotifications = getCommentsChannel(teamspace, modelId, riskId);
	commentsNotifications.unsubscribeFromCreated(onCreateCommentEvent, this);
	commentsNotifications.unsubscribeFromUpdated(onUpdateCommentEvent, this);
	commentsNotifications.unsubscribeFromDeleted(onDeleteCommentEvent, this);
}

export function* setNewRisk() {
	const risks = yield select(selectRisks);
	const jobs = yield select(selectJobsList);
	const currentUser = yield select(selectCurrentUser);
	const riskNumber = risks.length + 1;

	try {
		const newRisk = prepareRisk({
			name: `Untitled risk ${riskNumber}`,
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
			owner: currentUser.username
		}, jobs);

		yield put(RisksActions.setComponentState({
			showDetails: true,
			activeRisk: null,
			newRisk
		}));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('prepare', 'new risk', error));
	}
}

export function* setFilters({ filters }) {
	try {
		yield put(RisksActions.setComponentState({ selectedFilters: filters }));
		yield put(RisksActions.renderPins());
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'filters', error));
	}
}

export default function* RisksSaga() {
	yield takeLatest(RisksTypes.FETCH_RISKS, fetchRisks);
	yield takeLatest(RisksTypes.FETCH_RISK, fetchRisk);
	yield takeLatest(RisksTypes.SAVE_RISK, saveRisk);
	yield takeLatest(RisksTypes.UPDATE_RISK, updateRisk);
	yield takeLatest(RisksTypes.POST_COMMENT, postComment);
	yield takeLatest(RisksTypes.REMOVE_COMMENT, removeComment);
	yield takeLatest(RisksTypes.RENDER_PINS, renderPins);
	yield takeLatest(RisksTypes.DOWNLOAD_RISKS, downloadRisks);
	yield takeLatest(RisksTypes.PRINT_RISKS, printRisks);
	yield takeLatest(RisksTypes.SET_ACTIVE_RISK, setActiveRisk);
	yield takeLatest(RisksTypes.SHOW_DETAILS, showDetails);
	yield takeLatest(RisksTypes.CLOSE_DETAILS, closeDetails);
	yield takeLatest(RisksTypes.SHOW_NEW_PIN, showNewPin);
	yield takeLatest(RisksTypes.TOGGLE_SHOW_PINS, toggleShowPins);
	yield takeLatest(RisksTypes.SUBSCRIBE_ON_RISK_CHANGES, subscribeOnRiskChanges);
	yield takeLatest(RisksTypes.UNSUBSCRIBE_ON_RISK_CHANGES, unsubscribeOnRiskChanges);
	yield takeLatest(RisksTypes.FOCUS_ON_RISK, focusOnRisk);
	yield takeLatest(RisksTypes.SET_NEW_RISK, setNewRisk);
	yield takeLatest(RisksTypes.SUBSCRIBE_ON_RISK_COMMENTS_CHANGES, subscribeOnRiskCommentsChanges);
	yield takeLatest(RisksTypes.UNSUBSCRIBE_ON_RISK_COMMENTS_CHANGES, unsubscribeOnRiskCommentsChanges);
	yield takeLatest(RisksTypes.UPDATE_NEW_RISK, updateNewRisk);
	yield takeLatest(RisksTypes.SET_FILTERS, setFilters);
}
