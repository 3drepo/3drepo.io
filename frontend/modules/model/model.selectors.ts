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

import { pick } from 'lodash';
import { createSelector } from 'reselect';
import { getActiveRevisions } from '../../helpers/revisions';
import { selectUrlParams } from '../router/router.selectors';

export const selectModelDomain = (state) => state.model;

export const selectSettings = createSelector(
	selectModelDomain, (state) => state.settings
);

export const selectPermissions = createSelector(
	selectSettings, (state) => state.permissions
);

export const selectGISCoordinates = createSelector(
	selectSettings, (settings) => pick(settings, ['surveyPoints', 'angleFromNorth'])
);

export const selectHasGISCoordinates = createSelector(
	selectGISCoordinates, (coordinates) => (coordinates.surveyPoints || []).length > 0
);

export const selectRevisions = createSelector(
	selectModelDomain, (state) => state.revisions
);

export const selectCurrentRevision = createSelector(
	selectRevisions, selectUrlParams, (revisions, params) => {
		const paramRevision = (params || {}).revision ?
			revisions.find((revision) => revision.tag === params.revision ||  revision._id === params.revision)
			: null;

		return paramRevision || getActiveRevisions(revisions)[0];
	}
);

export const selectCurrentRevisionId = createSelector(
	selectCurrentRevision, (revision = {}) => revision.tag || revision._id
);

export const selectIsPending = createSelector(
	selectModelDomain, (state) => state.isPending
);

export const selectIsModelUploading = createSelector(
	selectModelDomain, (state) => state.isModelUploading
);

export const selectPendingRevision = createSelector(
	selectModelDomain, (state) => state.pendingRevision
);

export const selectUploadStatus = createSelector(
	selectModelDomain, (state) => state.uploadStatus
);

export const selectMaps = createSelector(
	selectModelDomain, (state) => state.maps
);

export const selectCurrentModel = createSelector(
	selectSettings, (state) => state.model
);

export const selectCurrentModelName = createSelector(
	selectSettings, (state) => state.name
);

export const selectDefaultView = createSelector(
	selectSettings, (state) => state.defaultView
);

export const selectDefaultLegend = createSelector(
	selectSettings, (state) => state.defaultLegend
);

export const selectMetaKeys = createSelector(
	selectModelDomain, (state) => state.metaKeys
);

export const selectMetaKeysExist = createSelector(
	selectModelDomain, (state) => Boolean(state.metaKeys.length)
);

export const selectIsFederation = createSelector(
	selectSettings, (state) =>  Boolean(state.federate)
);

export const selectSettingsProperties = createSelector(
	selectSettings, (state) => state.properties
);

export const selectUnit = createSelector(
	selectSettingsProperties, (state) => state.unit
);

export const selectCurrentModelTeamspace = createSelector(
	selectSettings, (state) => state.account
);

export const selectSubModels = createSelector(
		selectSettings, (state) => state.subModels
);
