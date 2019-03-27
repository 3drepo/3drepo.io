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

import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import { connect } from '../../../../helpers/migration';

import { Toolbar } from './toolbar.component';
import {
	ViewerActions,
	selectNavigationMode,
	selectHelicopterSpeed,
	selectIsFocusMode,
	selectClippingMode,
	selectIsClipEdit,
	selectClipNumber,
	selectIsMetadataVisible,
	selectMeasureState
} from '../../../../modules/viewer';
import { TreeActions } from '../../../../modules/tree';

const mapStateToProps = createStructuredSelector({
	navigationMode: selectNavigationMode,
	helicopterSpeed: selectHelicopterSpeed,
	isFocusMode: selectIsFocusMode,
	clippingMode: selectClippingMode,
	isClipEdit: selectIsClipEdit,
	clipNumber: selectClipNumber,
	isMetadataVisible: selectIsMetadataVisible,
	measureState: selectMeasureState
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	initialiseToolbar: ViewerActions.initialiseToolbar,
	goToExtent: ViewerActions.goToExtent,
	setNavigationMode: ViewerActions.setNavigationMode,
	resetHelicopterSpeed: ViewerActions.resetHelicopterSpeed,
	increaseHelicopterSpeed: ViewerActions.increaseHelicopterSpeed,
	decreaseHelicopterSpeed: ViewerActions.decreaseHelicopterSpeed,
	showAllNodes: TreeActions.showAllNodes,
	hideSelectedNodes: TreeActions.hideSelectedNodes,
	isolateSelectedNodes: TreeActions.isolateSelectedNodes,
	setIsFocusMode: ViewerActions.setIsFocusMode,
	setClippingMode: ViewerActions.setClippingMode,
	toggleClipEdit: ViewerActions.toggleClipEdit,
	setMetadataVisibility: ViewerActions.setMetadataVisibility,
	setMeasureVisibility: ViewerActions.setMeasureVisibility,
	deactivateMeasure: ViewerActions.deactivateMeasure
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);
