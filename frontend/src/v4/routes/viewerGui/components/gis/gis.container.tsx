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

import { selectUrlParams } from '@/v4/modules/router/router.selectors';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import { selectGisLayers, GisActions } from '../../../../modules/gis';
import { selectHasGISCoordinates, selectIsPending, selectMaps,
	selectSettings, ModelActions } from '../../../../modules/model';
import { Gis } from './gis.component';

const mapStateToProps = createStructuredSelector({
	settings: selectSettings,
	isPending: selectIsPending,
	mapsProviders: selectMaps,
	visibleLayers: selectGisLayers,
	hasGISCoordinates: selectHasGISCoordinates,
	urlParams: selectUrlParams,
	modelSettings: selectSettings,
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	fetchModelMaps: ModelActions.fetchMaps,
	updateModelSettings: ModelActions.updateSettings,
	addVisibleLayer: GisActions.addLayer,
	removeVisibleLayer: GisActions.removeLayer,
	resetVisibleLayers: GisActions.resetLayers,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Gis);
