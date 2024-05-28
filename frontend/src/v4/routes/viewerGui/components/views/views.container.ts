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

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';

import { ViewerGuiActions } from '@/v4/modules/viewerGui';
import { selectSettings, ModelActions } from '../../../../modules/model';
import { selectIsAdmin, selectIsCommenter } from '../../../../modules/model/permissions.selectors';
import {
	selectActiveViewpoint,
	selectEditMode,
	selectIsPending,
	selectNewViewpoint,
	selectSearchEnabled,
	selectSearchQuery,
	selectSortOrder,
	selectViewpointsList,
	ViewpointsActions,
} from '../../../../modules/viewpoints';
import { Views } from './views.component';

const mapStateToProps = createStructuredSelector({
	viewpoints: selectViewpointsList,
	newViewpoint: selectNewViewpoint,
	activeViewpoint: selectActiveViewpoint,
	isPending: selectIsPending,
	isAdmin: selectIsAdmin,
	editMode: selectEditMode,
	searchQuery: selectSearchQuery,
	searchEnabled: selectSearchEnabled,
	isCommenter: selectIsCommenter,
	modelSettings: selectSettings,
	sortOrder: selectSortOrder,
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	fetchViewpoints: ViewpointsActions.fetchViewpoints,
	prepareNewViewpoint: ViewpointsActions.prepareNewViewpoint,
	createViewpoint: ViewpointsActions.createViewpoint,
	updateViewpoint: ViewpointsActions.updateViewpoint,
	deleteViewpoint: ViewpointsActions.deleteViewpoint,
	toggleSortOrder: ViewpointsActions.toggleSortOrder,
	subscribeOnViewpointChanges: ViewpointsActions.subscribeOnViewpointChanges,
	unsubscribeOnViewpointChanges: ViewpointsActions.unsubscribeOnViewpointChanges,
	setActiveViewpoint: ViewpointsActions.setActiveViewpoint,
	setNewViewpoint: ViewpointsActions.setNewViewpoint,
	setDefaultViewpoint: ViewpointsActions.setDefaultViewpoint,
	clearDefaultViewpoint: ViewpointsActions.clearDefaultViewpoint,
	setSearchQuery: ViewpointsActions.setSearchQuery,
	setState: ViewpointsActions.setComponentState,
	shareViewpointLink: ViewpointsActions.shareViewpointLink,
	showPreset: ViewpointsActions.showPreset,
	fetchModelSettings: ModelActions.fetchSettings,
	setClippingMode: ViewerGuiActions.setClippingMode,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Views);
