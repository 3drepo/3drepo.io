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
	selectActiveTab,
	selectCanTestForClash,
	selectFilteredCompareModels,
	selectIsCompareActive,
	selectIsCompareButtonDisabled,
	selectIsCompareProcessed,
	selectIsPending,
	selectRenderingType,
	selectSelectedModelsMap,
	selectSortOrder,
	selectSortType,
	CompareActions
} from '../../../../modules/compare';
import { selectIsFederation } from '../../../../modules/model';
import { selectIsModelLoaded } from '../../../../modules/viewerGui';
import { Compare } from './compare.component';

const mapStateToProps = createStructuredSelector({
	activeTab: selectActiveTab,
	compareModels: selectFilteredCompareModels,
	renderingType: selectRenderingType,
	sortType: selectSortType,
	sortOrder: selectSortOrder,
	isActive: selectIsCompareActive,
	isPending: selectIsPending,
	isFederation: selectIsFederation,
	isModelLoaded: selectIsModelLoaded,
	compareDisabled: selectIsCompareButtonDisabled,
	selectedItemsMap: selectSelectedModelsMap,
	isCompareProcessed: selectIsCompareProcessed,
	canTestForClash: selectCanTestForClash,
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	toggleCompare: CompareActions.toggleCompare,
	setComponentState: CompareActions.setComponentState,
	onRenderingTypeChange: CompareActions.onRenderingTypeChange,
	onTabChange: CompareActions.setActiveTab,
	setSortType: CompareActions.setSortType,
	setTargetModel: CompareActions.setTargetModel,
	setTargetRevision: CompareActions.setTargetRevision,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Compare);
