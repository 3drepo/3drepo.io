/**
 *  Copyright (C) 2019 3D Repo Ltd
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

import { Compare } from './compare.component';
import {
	CompareActions,
	selectActiveTab,
	selectFilteredCompareModels,
	selectRenderingType,
	selectSortType,
	selectSortOrder,
	selectIsCompareActive,
	selectIsPending,
	selectIsCompareButtonDisabled,
	selectSelectedModelsMap,
	selectIsCompareProcessed
} from '../../../../modules/compare';
import { selectIsFederation } from '../../../../modules/model';
import { selectIsModelLoaded } from '../../../../modules/viewer';

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
	isCompareProcessed: selectIsCompareProcessed
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	toggleCompare: CompareActions.toggleCompare,
	setComponentState: CompareActions.setComponentState,
	onRenderingTypeChange: CompareActions.onRenderingTypeChange,
	onTabChange: CompareActions.setActiveTab,
	setSortType: CompareActions.setSortType,
	setTargetModel: CompareActions.setTargetModel,
	setTargetRevision: CompareActions.setTargetRevision
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Compare);
