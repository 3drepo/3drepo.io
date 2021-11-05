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

import { all, put, select, take, takeLatest } from 'redux-saga/effects';
import {
	getDialogForm,
	getDialogSize,
	getDialogTitle,
	getTemplateComponent
} from '../../routes/board/board.helpers';

import { CommentsActions } from '../comments';
import { selectCurrentTeamspace } from '../currentUser';
import { DialogActions } from '../dialog';
import { IssuesActions, IssuesTypes } from '../issues';
import { JobsActions } from '../jobs';
import { selectCurrentModel, ModelActions } from '../model';
import { RisksActions, RisksTypes } from '../risks';
import { selectUrlParams } from '../router/router.selectors';
import { TeamspaceActions } from '../teamspace';
import { selectTeamspaces, TeamspacesActions } from '../teamspaces';
import { BoardActions, BoardTypes } from './board.redux';
import { selectBoardType, selectCards } from './board.selectors';

function* fetchData({ boardType, teamspace, project, modelId }) {
	try {
		yield put(BoardActions.setIsPending(true));
		const teamspaces = yield select(selectTeamspaces);
		const currentTeamspace = yield select(selectCurrentTeamspace);
		const currentModel = yield select(selectCurrentModel);

		yield put(JobsActions.fetchJobs(teamspace));
		yield put(JobsActions.getMyJob(teamspace));

		if (modelId && modelId !== currentModel) {
			yield put(ModelActions.fetchSettings(teamspace, modelId));
		}

		yield put(TeamspacesActions.fetchTeamspacesIfNecessary(currentTeamspace));

		if (!teamspaces.length) {
			yield put(TeamspaceActions.fetchSettings(teamspace));
		}

		if (teamspace && project && modelId) {
			yield put(CommentsActions.fetchUsers(teamspace));

			if (boardType === 'issues') {
				yield all([
					put(IssuesActions.fetchIssues(teamspace, modelId)),
					put(TeamspaceActions.fetchSettings(teamspace))
				]);
				yield take(IssuesTypes.FETCH_ISSUES_SUCCESS);
			} else {
				yield all([
					put(RisksActions.fetchRisks(teamspace, modelId)),
					put(RisksActions.fetchMitigationCriteria(teamspace))
				]);
				yield take(RisksTypes.FETCH_RISKS_SUCCESS);
			}
		}

		if (teamspace) {
			yield put(BoardActions.fetchDataSuccess(teamspace));
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('fetch', 'board data', error));
	}
	yield put(BoardActions.setIsPending(false));
}

function* fetchCardData({ teamspace, modelId, cardId }) {
	try {
		const boardType = yield select(selectBoardType);
		const cardData = { account: teamspace, model: modelId, _id: cardId };

		if (boardType === 'issues') {
			yield put(IssuesActions.setActiveIssue(cardData, null, true));
		} else {
			yield put(RisksActions.setActiveRisk(cardData, null, true));
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('fetch', 'card data', error));
	}
}

function* openCardDialog({ cardId, onNavigationChange, disableReset }) {
	const { teamspace, modelId } = yield select(selectUrlParams);
	const boardType = yield select(selectBoardType);

	if (cardId) {
		yield put(BoardActions.fetchCardData(boardType, teamspace, modelId, cardId));
	}

	const cards = yield select(selectCards);
	const isIssuesBoard = boardType === 'issues';
	const TemplateComponent = getTemplateComponent(isIssuesBoard);

	if (!cardId && !disableReset) {
		yield put(BoardActions.resetCardData());
	}

	const config = {
		title: getDialogTitle({ cardId, isIssuesBoard, cards, onNavigationChange }),
		template: getDialogForm(getDialogSize(cardId), TemplateComponent),
		data: {
			teamspace,
			model: modelId,
			disableViewer: true,
			horizontal: true,
		},
		DialogProps: {
			maxWidth: getDialogSize(cardId)
		}
	};

	yield put(DialogActions.showDialog(config));
}

function* resetCardData() {
	try {
		const boardType = yield select(selectBoardType);
		const resetData = boardType === 'issues' ? IssuesActions.setNewIssue : RisksActions.setNewRisk;
		yield put(resetData());
	} catch (error) {
		yield put(DialogActions.showErrorDialog('reset', 'card data', error));
	}
}

function* setFilters({ filters }) {
	try {
		const boardType = yield select(selectBoardType);

		if (boardType === 'issues') {
			yield put(IssuesActions.setFilters(filters));
		} else {
			yield put(RisksActions.setFilters(filters));
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'board filters', error));
	}
}

function* printItems({ teamspace, modelId }) {
	try {
		const boardType = yield select(selectBoardType);

		if (boardType === 'issues') {
			yield put(IssuesActions.printIssues(teamspace, modelId));
		} else {
			yield put(RisksActions.printRisks(teamspace, modelId));
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('print', 'board items', error));
	}
}

function* downloadItems({ teamspace, modelId }) {
	try {
		const boardType = yield select(selectBoardType);

		if (boardType === 'issues') {
			yield put(IssuesActions.downloadIssues(teamspace, modelId));
		} else {
			yield put(RisksActions.downloadRisks(teamspace, modelId));
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('download', 'board items', error));
	}
}

function* toggleSortOrder() {
	try {
		const boardType = yield select(selectBoardType);

		if (boardType === 'issues') {
			yield put(IssuesActions.toggleSortOrder());
		} else {
			yield put(RisksActions.toggleSortOrder());
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('toggle sort order', 'board items', error));
	}
}

function* setSortBy({field}) {
	try {
		const boardType = yield select(selectBoardType);

		if (boardType === 'issues') {
			yield put(IssuesActions.setSortBy(field));
		} else {
			yield put(RisksActions.setSortBy(field));
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set sort by', 'board items', error));
	}
}

export default function* BoardSaga() {
	yield takeLatest(BoardTypes.FETCH_DATA, fetchData);
	yield takeLatest(BoardTypes.FETCH_CARD_DATA, fetchCardData);
	yield takeLatest(BoardTypes.RESET_CARD_DATA, resetCardData);
	yield takeLatest(BoardTypes.OPEN_CARD_DIALOG, openCardDialog);
	yield takeLatest(BoardTypes.SET_FILTERS, setFilters);
	yield takeLatest(BoardTypes.PRINT_ITEMS, printItems);
	yield takeLatest(BoardTypes.DOWNLOAD_ITEMS, downloadItems);
	yield takeLatest(BoardTypes.TOGGLE_SORT_ORDER, toggleSortOrder);
	yield takeLatest(BoardTypes.SET_SORT_BY, setSortBy);
}
