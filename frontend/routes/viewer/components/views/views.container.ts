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
import { createStructuredSelector } from 'reselect';
import { connect, addRouting } from '../../../../helpers/migration';
import { ViewpointsActions, selectViewpointsItems, selectIsPending } from './../../../../modules/viewpoints';
import { Views } from './views.component';

const mapStateToProps = createStructuredSelector({
	viewpoints: selectViewpointsItems,
	isPending: selectIsPending
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	fetchViewpoints: ViewpointsActions.fetchViewpoints,
	createViewpoint: ViewpointsActions.createViewpoint,
	deleteViewpoint: ViewpointsActions.deleteViewpoint,
	subscribeOnViewpointChanges: ViewpointsActions.subscribeOnViewpointChanges,
	unsubscribeOnViewpointChanges: ViewpointsActions.unsubscribeOnViewpointChanges
}, dispatch);

export default addRouting(withRouter(connect(mapStateToProps, mapDispatchToProps)(Views)));
