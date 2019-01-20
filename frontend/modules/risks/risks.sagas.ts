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

import { differenceBy, isEmpty, omit, pick } from 'lodash';
import { all, put, select, takeLatest } from 'redux-saga/effects';

import * as API from '../../services/api';
import { getAngularService, history } from '../../helpers/migration';
import { getRiskPinColor } from '../../helpers/risks';
import { Cache } from '../../services/cache';
import { Viewer } from '../../services/viewer/viewer';
import { PIN_COLORS } from '../../styles';
import { DialogActions } from '../dialog';
import { SnackbarActions } from '../snackbar';
import { RisksActions, RisksTypes } from './risks.redux';
import { selectActiveRiskId, selectRisks, selectShowPins } from './risks.selectors';

export function* fetchRisks({teamspace, modelId, revision}) {
	yield put(RisksActions.togglePendingState(true));
	try {
		const {data} = yield API.getRisks(teamspace, modelId, revision);
		yield put(RisksActions.fetchRisksSuccess(data));
		yield put(RisksActions.showPins(data));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('get', 'risks', error));
	}
	yield put(RisksActions.togglePendingState(false));
}

const createGroupData = (name, nodes) => {
	const groupData = {
		name,
		color: [255, 0, 0],
		objects: nodes
	};

	return nodes.length === 0 ? null : groupData;
};

const createGroup = async (risk, objectInfo) => {
	// Create a group of selected objects
	const highlightedGroupData = createGroupData(risk.name, objectInfo.highlightedNodes);
	// Create a group of hidden objects
	const hiddenGroupData = createGroupData(risk.name, objectInfo.hiddenNodes);

	return await all([
		highlightedGroupData || API.createGroup(risk.account, risk.model, highlightedGroupData),
		hiddenGroupData || API.createGroup(risk.account, risk.model, hiddenGroupData)
	]);
};

export function* saveRisk({ teamspace, model, riskData, revision }) {
	try {
		const [viewpoint, objectInfo, screenshot, userJob] = yield all([
			Viewer.getCurrentViewpoint({ teamspace, model }),
			Viewer.getObjectsStatus({ teamspace, model }),
			riskData.screenshot || Viewer.getScreenshot(),
			API.getMyJob(teamspace)
		]);

		const TreeService = getAngularService('TreeService') as any;
		const AnalyticService = getAngularService('AnalyticService') as any;

		viewpoint.hideIfc = TreeService.getHideIfc();

		riskData.rev_id = revision;

		if (objectInfo.highlightedNodes.length > 0 || objectInfo.hiddenNodes.length > 0) {
			const [highlightedGroup, hiddenGroup] = yield createGroup(riskData, objectInfo);

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
			creator_role: userJob.data._id,
			viewpoint,
			pickedPos: null,
			pickedNorm: null,
			scale: 1.0
		};

		// Pin data
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

		yield put(RisksActions.saveRiskSuccess(savedRisk));
		yield put(RisksActions.showDetails(savedRisk, [], revision));
		Viewer.setPinDropMode(false);

		yield put(SnackbarActions.show('Risk created'));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('save', 'risk', error));
	}
}

export function* updateRisk({ teamspace, modelId, riskData }) {
	try {
		const { data } = yield API.updateRisk(teamspace, modelId, riskData);

		const AnalyticService = getAngularService('AnalyticService') as any;
		yield AnalyticService.sendEvent({
			eventCategory: 'Risk',
			eventAction: 'edit'
		});
		yield put(RisksActions.saveRiskSuccess(data));
		yield put(SnackbarActions.show('Risk updated'));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'risk', error));
	}
}

export function* deleteRisks({ teamspace, modelId, risksIds }) {
	try {
		yield API.deleteRisks(teamspace, modelId, risksIds);
		yield put(RisksActions.deleteRisksSuccess(risksIds));
		yield put(SnackbarActions.show('Risk deleted'));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('delete', 'risk', error));
	}
}

export function* showPins({ filteredRisks }) {
	try {
		const risksList = yield select(selectRisks);
		const shouldShowPins = yield select(selectShowPins);
		const invisibleRisks = risksList.length !== filteredRisks.length
			? differenceBy(risksList, filteredRisks, '_id')
			: [] ;
		const activeRiskId = yield select(selectActiveRiskId);

		const removePins = (risks) => risks.forEach((risk) => {
			Viewer.removePin({ id: risk._id });
		});

		if (shouldShowPins) {
			for (let index = 0; index < filteredRisks.length; index++) {
				const risk = filteredRisks[index];

				const pinPosition = risk.position && risk.position.length;

				if (pinPosition) {
					const levelOfRisk = (risk.level_of_risk !== undefined) ? risk.level_of_risk : 4;
					const isSelectedPin = activeRiskId && risk._id === activeRiskId;
					const pinColor = getRiskPinColor(levelOfRisk, isSelectedPin);

					yield Viewer.addPin({
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
		yield removePins(!shouldShowPins ? risksList : invisibleRisks);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('show', 'pins', error));
	}
}

export function* downloadRisks({ teamspace, modelId }) {
	try {
		const endpoint = `${teamspace}/${modelId}/risks.json`;
		const modelName = Viewer.viewer && Viewer.viewer.settings ? Viewer.viewer.settings.name : '';
		yield API.downloadJSON('risks', modelName, endpoint);

	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'risk', error));
	}
}

export function* printRisks({ teamspace, modelId, risksIds }) {
	try {
		const printEndpoint = `${teamspace}/${modelId}/risks.html?ids=${risksIds}`;
		const printUrl = `${ClientConfig.apiUrls.all[0]}/${printEndpoint}`;
		window.open(printUrl, '_blank');
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'risk', error));
	}
}

export function* getRiskGroup(risk, groupId, revision): any {
	if (!groupId) {
		return null;
	}

	const cachedGroup = Cache.get('risk.group', groupId);
	if (cachedGroup) {
		return cachedGroup;
	}

	const { data } = yield API.getGroup(risk.account, risk.model, groupId, revision);

	if (data.hiddenObjects && !risk.viewpoint.group_id) {
		data.hiddenObjects = null;
	}

	Cache.add('risk.group', groupId, data);
	return data;
}

export function* showMultipleGroups(risk, revision) {
	const TreeService = getAngularService('TreeService') as any;

	const hasViewpointGroups = !isEmpty(pick(risk.viewpoint, [
		'highlighted_group_id',
		'hidden_group_id',
		'shown_group_id'
	]));

	let objects = {} as { hidden: any[], shown: any[], objects: any[] };

	if (hasViewpointGroups) {
		const [hiddenGroupData, shownGroupData, highlightedGroupData] = yield all([
			getRiskGroup(risk, risk.viewpoint.hidden_group_id, revision),
			getRiskGroup(risk, risk.viewpoint.hidden_group_id, revision),
			getRiskGroup(risk, risk.viewpoint.shown_group_id, revision)
		]);

		if (hiddenGroupData) {
			objects.hidden = hiddenGroupData.objects;
		}

		if (shownGroupData) {
			objects.shown = hiddenGroupData.objects;
		}

		if (highlightedGroupData) {
			objects.objects = hiddenGroupData.objects;
		}
	} else {
		const hasViewpointDefaultGroup = risk.viewpoint.group_id;
		const groupId = hasViewpointDefaultGroup ? risk.viewpoint.group_id : risk.group_id;
		const groupData = yield getRiskGroup(risk, groupId, revision);

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
		yield TreeService.selectNodesBySharedIds(objects.objects);
		window.dispatchEvent(new Event('resize'));
	}
}

const focusOnRisk = async (risk) => {
	const { account, model, viewpoint } = risk;
	if (viewpoint) {
		if (viewpoint.position && viewpoint.position.length > 0) {
			Viewer.setCamera({ ...viewpoint, account, model });
		}

		await Viewer.updateClippingPlanes({
			clippingPlanes: viewpoint.clippingPlanes,
			account,
			model
		});
	} else {
		await Viewer.goToDefaultViewpoint();
	}
};

export function* renderRisk(risk, filteredRisks, revision) {
	try {
		const TreeService = getAngularService('TreeService') as any;
		yield put(RisksActions.showPins(filteredRisks));

		// Remove highlight from any multi objects
		Viewer.highlightObjects([]);
		TreeService.clearCurrentlySelected();

		const hasViewpoint = risk.viewpoint;
		const hasHiddenOrShownGroup = hasViewpoint && (risk.viewpoint.hidden_group_id || risk.viewpoint.shown_group_id);
		// Reset object visibility
		if (hasViewpoint) {
			if (risk.viewpoint.hideIfc) {
				TreeService.setHideIfc(risk.viewpoint.hideIfc);
			}

			TreeService.showAllTreeNodes(!hasHiddenOrShownGroup);
		}

		const hasViewpointGroup = hasViewpoint && (risk.viewpoint.highlighted_group_id || risk.viewpoint.group_id);
		const hasGroup = risk.group_id;

		if (hasViewpointGroup || hasGroup || hasHiddenOrShownGroup) {
			yield showMultipleGroups(risk, revision);
		}

		yield focusOnRisk(risk);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('render', 'risk', error));
	}
}

export function* setActiveRisk({ risk }) {
	try {
		yield all([
			focusOnRisk(risk),
			put(RisksActions.setComponentState({ activeRisk: risk._id, expandDetails: true }))
		]);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'risk as active', error));
	}
}

export function* showDetails({ risk, filteredRisks, revision }) {
	try {
		const activeRiskId = select(selectActiveRiskId);

		if (activeRiskId !== risk._id) {
			if (risk.position && risk.position.length > 0 && risk._id) {
				Viewer.changePinColor({
					id: risk._id,
					colours: PIN_COLORS.BLUE
				});
			}
			yield put(RisksActions.setActiveRisk(risk));
		}

		yield all([
			renderRisk(risk, filteredRisks, revision),
			put(RisksActions.setComponentState({ showDetails: true }))
		]);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('display', 'risk details', error));
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
			colours: getRiskPinColor(risk.level_of_risk, true),
			type: 'risk'
		};

		Viewer.addPin(data);
		Viewer.setPin(data);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('display', 'pin', error));
	}
}

export default function* RisksSaga() {
	yield takeLatest(RisksTypes.FETCH_RISKS, fetchRisks);
	yield takeLatest(RisksTypes.SAVE_RISK, saveRisk);
	yield takeLatest(RisksTypes.UPDATE_RISK, updateRisk);
	yield takeLatest(RisksTypes.DELETE_RISKS, deleteRisks);
	yield takeLatest(RisksTypes.SHOW_PINS, showPins);
	yield takeLatest(RisksTypes.DOWNLOAD_RISKS, downloadRisks);
	yield takeLatest(RisksTypes.PRINT_RISKS, printRisks);
	yield takeLatest(RisksTypes.SET_ACTIVE_RISK, setActiveRisk);
	yield takeLatest(RisksTypes.SHOW_DETAILS, showDetails);
	yield takeLatest(RisksTypes.SHOW_NEW_PIN, showNewPin);

}
