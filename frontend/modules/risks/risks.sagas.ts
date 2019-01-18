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

import { put, takeLatest, select, all } from 'redux-saga/effects';
import { differenceBy, pick, get, isEmpty } from 'lodash';

import * as API from '../../services/api';
import { RisksTypes, RisksActions } from './risks.redux';
import { DialogActions } from '../dialog';
import { SnackbarActions } from '../snackbar';
import { selectRisks, selectShowPins, selectActiveRiskId } from './risks.selectors';
import { Viewer } from '../../services/viewer/viewer';
import { getRiskPinColor } from '../../helpers/risks';
import { getAngularService } from '../../helpers/migration';
import { Cache } from '../../services/cache';

export function* fetchRisks({teamspace, modelId, revision}) {
	try {
		const {data} = yield API.getRisks(teamspace, modelId, revision);
		yield put(RisksActions.fetchRisksSuccess(data));
		yield put(RisksActions.showPins(data));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('get', 'risks', error));
	}
}

export function* saveRisk({ teamspace, modelId, riskData }) {
	try {
		const { data } = yield API.saveRisk(teamspace, modelId, riskData);
		yield put(RisksActions.saveRiskSuccess(data));
		yield put(SnackbarActions.show('Risk created'));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('save', 'risk', error));
	}
}

export function* updateRisk({ teamspace, modelId, riskData }) {
	try {
		const { data } = yield API.updateRisk(teamspace, modelId, riskData);
		yield put(RisksActions.saveRiskSuccess(data));
		yield put(SnackbarActions.show('Risk updated'));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'risk', error));
	}
}

export function* deleteRisks({ teamspace, modelId, risksIds }) {
	try {
		const response = yield API.deleteRisks(teamspace, modelId, risksIds);
		console.log('delete response', response);
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
	const hasViewpointGroups = !isEmpty(pick(risk.viewpoint, [
		'highlighted_group_id',
		'hidden_group_id',
		'shown_group_id'
	]));

	if (hasViewpointGroups) {
		const [hiddenGroupData, shownGroupData, highlightedGroupData] = yield all([
			getRiskGroup(risk, risk.viewpoint.hidden_group_id, revision),
			getRiskGroup(risk, risk.viewpoint.hidden_group_id, revision),
			getRiskGroup(risk, risk.viewpoint.shown_group_id, revision)
		]);

		if (hiddenGroupData) {
			this.handleHidden(hiddenGroupData.objects);
		}

		if (shownGroupData) {
			this.handleShown(shownGroupData.objects);
		}

		if (highlightedGroupData) {
			this.handleShown(highlightedGroupData.objects);
		}
	} else {
		const hasViewpointDefaultGroup = risk.viewpoint.group_id;
		const groupId = hasViewpointDefaultGroup ? risk.viewpoint.group_id : risk.group_id;
		const groupData = yield getRiskGroup(risk, groupId, revision);

		if (groupData.hiddenObjects && !risk.viewpoint.group_id) {
			groupData.hiddenObjects = null;
			Cache.add('risk.group', groupId, groupData);
		}

		this.handleTree(groupData);
	}
}

export function* showRiskDetails({ risk, revision }) {
	try {
		const TreeService = getAngularService('TreeService') as any;
		yield put(RisksActions.showPins());

		// Remove highlight from any multi objects
		Viewer.highlightObjects([]);
		TreeService.clearCurrentlySelected();

		// Reset object visibility
		if (risk.viewpoint && risk.viewpoint.hideIfc) {
			TreeService.setHideIfc(risk.viewpoint.hideIfc);
		}

		const hasHiddenOrShownGroup = risk.viewpoint.hidden_group_id || risk.viewpoint.shown_group_id;

		TreeService.showAllTreeNodes(!hasHiddenOrShownGroup);

		const hasViewpoint = risk.viewpoint;
		const hasViewpointGroup = risk.viewpoint.highlighted_group_id || risk.viewpoint.group_id;
		const hasGroup = risk.group_id;

		// Show multi objects
		if ((hasViewpoint && hasViewpointGroup) || hasGroup || hasHiddenOrShownGroup) {
			yield showMultipleGroups(risk, revision);
		}

		yield handleShowRisk(risk);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('show', 'risk details', error));
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
	// yield takeLatest(RisksTypes.SHOW_RISK_DETAILS, showRiskDetails);
}
