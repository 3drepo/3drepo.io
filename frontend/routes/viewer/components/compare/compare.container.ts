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
	selectCompareModels,
	selectRenderingType,
	selectSortType,
	selectSortOrder
} from '../../../../modules/compare';

const mapStateToProps = createStructuredSelector({
	activeTab: selectActiveTab,
	compareModels: selectCompareModels,
	renderingType: selectRenderingType,
	sortType: selectSortType,
	sortOrder: selectSortOrder
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	setComponentState: CompareActions.setComponentState,
	getCompareModels: CompareActions.getCompareModels,
	onRenderingTypeChange: CompareActions.onRenderingTypeChange,
	setSortType: CompareActions.setSortType
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Compare);
