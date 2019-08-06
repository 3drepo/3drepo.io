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

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import { selectIsCommenter } from '../../../../modules/model/permissions.selectors';
import {
	selectActiveViewpoint,
	selectEditMode,
	selectIsPending,
	selectNewViewpoint,
	selectSearchEnabled,
	selectSearchQuery,
	selectViewpointsList,
	ViewpointsActions
} from './../../../../modules/viewpoints';
import { Views } from './views.component';

const mapStateToProps = createStructuredSelector({
	viewpoints: selectViewpointsList,
	newViewpoint: selectNewViewpoint,
	activeViewpoint: selectActiveViewpoint,
	isPending: selectIsPending,
	editMode: selectEditMode,
	searchQuery: selectSearchQuery,
	searchEnabled: selectSearchEnabled,
	isCommenter: selectIsCommenter
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	fetchViewpoints: ViewpointsActions.fetchViewpoints,
	prepareNewViewpoint: ViewpointsActions.prepareNewViewpoint,
	createViewpoint: ViewpointsActions.createViewpoint,
	updateViewpoint: ViewpointsActions.updateViewpoint,
	deleteViewpoint: ViewpointsActions.deleteViewpoint,
	subscribeOnViewpointChanges: ViewpointsActions.subscribeOnViewpointChanges,
	unsubscribeOnViewpointChanges: ViewpointsActions.unsubscribeOnViewpointChanges,
	showViewpoint: ViewpointsActions.showViewpoint,
	setNewViewpoint: ViewpointsActions.setNewViewpoint,
	setSearchQuery: ViewpointsActions.setSearchQuery,
	setState: ViewpointsActions.setComponentState
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Views);
