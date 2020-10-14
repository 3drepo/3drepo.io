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

import {
	selectClippingMode,
	selectClipNumber,
	selectHelicopterSpeed,
	selectIsClipEdit,
	selectIsCoordViewActive,
	selectIsFocusMode,
	selectIsMetadataVisible,
	selectNavigationMode,
	selectProjectionMode,
	ViewerGuiActions
} from '../../../../modules/viewerGui';
import { Toolbar } from './toolbar.component';

import { TreeActions } from '../../../../modules/tree';

import { selectIsActive, BimActions } from '../../../../modules/bim';
import { GroupsActions } from '../../../../modules/groups';
import { selectMetaKeysExist } from '../../../../modules/model';

const mapStateToProps = createStructuredSelector({
	projectionMode: selectProjectionMode,
	navigationMode: selectNavigationMode,
	helicopterSpeed: selectHelicopterSpeed,
	isFocusMode: selectIsFocusMode,
	clippingMode: selectClippingMode,
	isClipEdit: selectIsClipEdit,
	clipNumber: selectClipNumber,
	isMetadataVisible: selectIsMetadataVisible,
	isMetadataActive: selectIsActive,
	coordViewActive: selectIsCoordViewActive,
	metaKeysExist: selectMetaKeysExist
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	initialiseToolbar: ViewerGuiActions.initialiseToolbar,
	goToExtent: ViewerGuiActions.goToExtent,
	setNavigationMode: ViewerGuiActions.setNavigationMode,
	resetHelicopterSpeed: ViewerGuiActions.resetHelicopterSpeed,
	increaseHelicopterSpeed: ViewerGuiActions.increaseHelicopterSpeed,
	decreaseHelicopterSpeed: ViewerGuiActions.decreaseHelicopterSpeed,
	setIsFocusMode: ViewerGuiActions.setIsFocusMode,
	setClippingMode: ViewerGuiActions.setClippingMode,
	setClipEdit: ViewerGuiActions.setClipEdit,
	stopListenOnNumClip: ViewerGuiActions.stopListenOnNumClip,
	setMeasureVisibility: ViewerGuiActions.setMeasureVisibility,
	setCoordView: ViewerGuiActions.setCoordView,
	setPanelVisibility: ViewerGuiActions.setPanelVisibility,
	setProjectionMode: ViewerGuiActions.setProjectionMode,
	setMetadataActive: BimActions.setIsActive,
	showAllNodes: TreeActions.showAllNodes,
	hideSelectedNodes: TreeActions.hideSelectedNodes,
	isolateSelectedNodes: TreeActions.isolateSelectedNodes,
	clearColorOverrides: GroupsActions.clearColorOverrides
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);
