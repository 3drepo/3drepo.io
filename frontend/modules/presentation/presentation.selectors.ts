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
import { createSelector } from 'reselect';
import { ROUTES } from '../../constants/routes';
import { selectCurrentModel, selectCurrentModelTeamspace } from '../model';
import { selectQueryParams, selectUrlParams } from '../router/router.selectors';
import { PresentationMode } from './presentation.constants';

export const selectPresentationDomain = (state) => state.presentation;

export const selectIsPresenting = createSelector(
	selectPresentationDomain, (state) => state.isPresenting
);

export const selectJoinedPresentation = createSelector(
	selectPresentationDomain, (state) => state.joinedPresentation
);

export const selectPresentationMode = createSelector(
	selectIsPresenting, selectJoinedPresentation, (isPresenting, joinedPresentation) =>
		isPresenting ? PresentationMode.PRESENTER
			: joinedPresentation ? PresentationMode.PARTICIPANT : PresentationMode.INITIAL
);

export const selectSessionCode = createSelector(
	selectPresentationDomain, (state) => state.sessionCode
);

export const selectIsPaused = createSelector(
	selectPresentationDomain, (state) => state.isPaused
);

export const selectIsViewerManipulationEnabled = createSelector(
	selectJoinedPresentation, selectIsPaused,  (joined, paused) => !joined || paused
);

export const selectIsPresentationActive = createSelector(
	selectPresentationMode, (mode) => mode !== PresentationMode.INITIAL
);

export const selectPresentationUrl = createSelector(
	selectSessionCode, selectCurrentModelTeamspace, selectCurrentModel, (code, teamspace, modelId) =>
		`${location.protocol}//${location.hostname}${ROUTES.VIEWER}/${teamspace}/${modelId}?presenter=${code}`
);

export const selectJoinedUrlQueryPresentation = createSelector(
	selectQueryParams, selectSessionCode, selectJoinedPresentation, ( params, code, joined) =>
		params.presenter === code && joined
);
