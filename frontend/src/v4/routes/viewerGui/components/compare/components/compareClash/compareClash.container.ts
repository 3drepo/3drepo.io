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

import {
	selectIsAllSelected,
	selectSelectedFilters,
	selectSelectedModelsMap,
	selectTargetClashModels,
	CompareActions
} from '../../../../../../modules/compare';
import { CompareClash } from './compareClash.component';

const mapStateToProps = createStructuredSelector({
	selectedItemsMap: selectSelectedModelsMap,
	selectedFilters: selectSelectedFilters,
	isAllSelected: selectIsAllSelected,
	targetModels: selectTargetClashModels
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	setComponentState: CompareActions.setComponentState,
	setTargetModel: CompareActions.setTargetModel,
	setTargetRevision: CompareActions.setTargetRevision
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(CompareClash) as any;
