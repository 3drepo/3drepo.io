/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { all, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import { AddFavouriteAction, DeleteDrawingAction, RemoveFavouriteAction, CreateDrawingAction, DrawingsActions, DrawingsTypes, FetchTypesAction, FetchDrawingStatsAction, FetchDrawingsAction, UpdateDrawingAction, FetchCalibrationValuesAction, UpdateCalibrationValuesAction, ApproveCalibrationValuesAction } from './drawings.redux';
import * as API from '@/v5/services/api';
import { formatMessage } from '@/v5/services/intl';
import { DialogsActions } from '../dialogs/dialogs.redux';
import { LifoQueue } from '@/v5/helpers/functions.helpers';
import { CalibrationState, DrawingStats } from './drawings.types';
import { selectDrawings, selectIsListPending } from './drawings.selectors';
import { isEqualWith } from 'lodash';
import { selectLatestActiveRevision } from './revisions/drawingRevisions.selectors';

const statsQueue = new LifoQueue<DrawingStats>(API.Drawings.fetchDrawingsStats, 30);

export function* addFavourites({ teamspace, projectId, drawingId }: AddFavouriteAction) {
	try {
		yield put(DrawingsActions.setFavouriteSuccess(projectId, drawingId, true));
		yield API.Drawings.addFavourite(teamspace, projectId, drawingId);
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'drawings.addFavourite.error', defaultMessage: 'trying to add drawing to favourites' }),
			error,
		}));
		yield put(DrawingsActions.setFavouriteSuccess(projectId, drawingId, false));
	}
}

export function* removeFavourites({ teamspace, projectId, drawingId }: RemoveFavouriteAction) {
	try {
		yield put(DrawingsActions.setFavouriteSuccess(projectId, drawingId, false));
		yield API.Drawings.removeFavourite(teamspace, projectId, drawingId);
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'drawings.removeFavourite.error', defaultMessage: 'trying to remove drawing from favourites' }),
			error,
		}));
		yield put(DrawingsActions.setFavouriteSuccess(projectId, drawingId, true));
	}
}

export function* fetchDrawings({ teamspace, projectId }: FetchDrawingsAction) {
	try {
		const { drawings } = yield API.Drawings.fetchDrawings(teamspace, projectId);
		const storedDrawings = yield select(selectDrawings);
		const isPending = yield select(selectIsListPending);

		// Only update if theres is new data
		if (isPending || !isEqualWith(storedDrawings, drawings)) {
			yield put(DrawingsActions.fetchDrawingsSuccess(projectId, drawings));
		}
		yield all(
			drawings.map(
				(drawing) => put(DrawingsActions.fetchDrawingStats(teamspace, projectId, drawing._id)),
			),
		); 
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'drawings.fetchAll.error', defaultMessage: 'trying to fetch drawings' }),
			error,
		}));
	}
}

export function* fetchCalibrationValues({ teamspace, projectId, drawingId }: FetchCalibrationValuesAction) {
	try {
		const revision = yield select(selectLatestActiveRevision, drawingId);
		const { data: calibrationValues } = yield API.DrawingRevisions.fetchCalibrationValues(teamspace, projectId, drawingId, revision._id);
		yield put(DrawingsActions.updateDrawingSuccess(projectId, drawingId, { calibrationValues }));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'drawings.fetchCalibration.error', defaultMessage: 'trying to fetch drawing calibration' }),
			error,
		}));
	}
}

export function* updateCalibrationValues({ teamspace, projectId, drawingId, calibrationValues }: UpdateCalibrationValuesAction) {
	try {
		const revision = yield select(selectLatestActiveRevision, drawingId);
		yield API.DrawingRevisions.updateCalibrationValues(teamspace, projectId, drawingId, revision._id, calibrationValues);
		yield put(DrawingsActions.updateDrawingSuccess(projectId, drawingId, { calibrationValues, calibration: CalibrationState.CALIBRATED }));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'drawings.updateCalibration.error', defaultMessage: 'trying to update drawing calibration' }),
			error,
		}));
	}
}

export function* approveCalibrationValues({ teamspace, projectId, drawingId }: ApproveCalibrationValuesAction) {
	try {
		const revision = yield select(selectLatestActiveRevision, drawingId);
		yield API.DrawingRevisions.approveCalibration(teamspace, projectId, drawingId, revision._id);
		yield put(DrawingsActions.updateDrawingSuccess(projectId, drawingId, { calibration: CalibrationState.CALIBRATED }));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'drawings.approveCalibration.error', defaultMessage: 'trying to approve drawing calibration' }),
			error,
		}));
	}
}

export function* fetchDrawingStats({ teamspace, projectId, drawingId }: FetchDrawingStatsAction) {
	try {
		const stats = yield statsQueue.enqueue(teamspace, projectId, drawingId);
		yield put(DrawingsActions.fetchDrawingStatsSuccess(projectId, drawingId, stats));

	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'drawings.fetchStats.error', defaultMessage: 'trying to fetch drawings details' }),
			error,
		}));
	}
}

export function* deleteDrawing({ teamspace, projectId, drawingId, onSuccess, onError }: DeleteDrawingAction) {
	try {
		yield API.Drawings.deleteDrawing(teamspace, projectId, drawingId);
		yield put(DrawingsActions.deleteDrawingSuccess(projectId, drawingId));
		onSuccess();
	} catch (error) {
		onError(error);
	}
}

export function* fetchTypes({ teamspace, projectId }: FetchTypesAction) {
	try {
		const { drawingCategories } = yield API.Drawings.fetchTypes(teamspace, projectId);
		yield put(DrawingsActions.fetchTypesSuccess(projectId, drawingCategories));

	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'drawings.fetchTypes.error', defaultMessage: 'trying to fetch drawing categories' }),
			error,
		}));
	}
}

export function* createDrawing({ teamspace, projectId, drawing, onSuccess, onError }: CreateDrawingAction) {
	try {
		const id = yield API.Drawings.createDrawing(teamspace, projectId, drawing);
		const newDrawing = { _id: id, ...drawing };
		yield put(DrawingsActions.createDrawingSuccess(projectId, newDrawing));

		onSuccess();
	} catch (error) {
		onError(error);
	}
}

export function* updateDrawing({ teamspace, projectId, drawingId, drawing, onSuccess, onError }: UpdateDrawingAction) {
	try {
		yield API.Drawings.updateDrawing(teamspace, projectId, drawingId, drawing);
		yield put(DrawingsActions.updateDrawingSuccess(projectId, drawingId, drawing));
		onSuccess?.();
	} catch (error) {
		onError?.(error);
	}
}

export function* resetDrawingStatsQueue() {
	statsQueue.resetQueue();
}

export default function* DrawingsSaga() {
	yield takeLatest(DrawingsTypes.ADD_FAVOURITE, addFavourites);
	yield takeLatest(DrawingsTypes.REMOVE_FAVOURITE, removeFavourites);
	yield takeEvery(DrawingsTypes.FETCH_DRAWINGS, fetchDrawings);
	yield takeEvery(DrawingsTypes.FETCH_DRAWING_STATS, fetchDrawingStats);
	yield takeEvery(DrawingsTypes.FETCH_CALIBRATION_VALUES, fetchCalibrationValues);
	yield takeEvery(DrawingsTypes.UPDATE_CALIBRATION_VALUES, updateCalibrationValues);
	yield takeEvery(DrawingsTypes.APPROVE_CALIBRATION_VALUES, approveCalibrationValues);
	yield takeLatest(DrawingsTypes.DELETE_DRAWING, deleteDrawing);
	yield takeLatest(DrawingsTypes.FETCH_TYPES, fetchTypes);
	yield takeEvery(DrawingsTypes.CREATE_DRAWING, createDrawing);
	yield takeEvery(DrawingsTypes.UPDATE_DRAWING, updateDrawing);
	yield takeEvery(DrawingsTypes.RESET_DRAWING_STATS_QUEUE, resetDrawingStatsQueue);
}