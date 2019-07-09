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

import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from '../../../../helpers/migration';
import { createStructuredSelector } from 'reselect';
import { ModelActions, selectSettings, selectIsPending, selectMaps } from './../../../../modules/model';
import { GisActions, selectIsInitialisedMap, selectVisibleSources } from './../../../../modules/gis';
import { Gis } from './gis.component';

const mapStateToProps = createStructuredSelector({
	settings: selectSettings,
	isPending: selectIsPending,
	mapsProviders: selectMaps,
	isInitialisedMap: selectIsInitialisedMap,
	visibleSources: selectVisibleSources
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	fetchModelMaps: ModelActions.fetchMaps,
	updateModelSettings: ModelActions.updateSettings,
	initialiseMap: GisActions.initialiseMap,
	addSource: GisActions.addSource,
	removeSource: GisActions.removeSource,
	resetSources: GisActions.resetSources,
	resetMap: GisActions.resetMap
}, dispatch);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Gis));
