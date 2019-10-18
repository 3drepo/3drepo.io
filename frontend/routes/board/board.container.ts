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
	selectBoardType, selectFilterProp, selectIsPending, selectLanes, selectSearchEnabled,
	BoardActions
} from '../../modules/board';
import { DialogActions } from '../../modules/dialog';
import { selectSelectedFilters as selectSelectedIssueFilters, IssuesActions } from '../../modules/issues';
import { selectJobsList } from '../../modules/jobs';
import { selectTopicTypes } from '../../modules/model';
import { selectSelectedFilters as selectSelectedRiskFilters, RisksActions } from '../../modules/risks';
import { selectTeamspaces } from '../../modules/teamspaces';
import { Board } from './board.component';

const mapStateToProps = createStructuredSelector({
	teamspaces: selectTeamspaces,
	lanes: selectLanes,
	isPending: selectIsPending,
	filterProp: selectFilterProp,
	bpardType: selectBoardType,
	searchEnabled: selectSearchEnabled,
	topicTypes: selectTopicTypes,
	jobs: selectJobsList,
	selectedIssueFilters: selectSelectedIssueFilters,
	selectedRisksFilters: selectSelectedRiskFilters
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	fetchData: BoardActions.fetchData,
	fetchCardData: BoardActions.fetchCardData,
	setFilterProp: BoardActions.setFilterProp,
	setBoardType: BoardActions.setBoardType,
	showDialog: DialogActions.showDialog,
	updateIssue: IssuesActions.updateBoardIssue,
	updateRisk: RisksActions.updateBoardRisk,
	toggleSearchEnabled: BoardActions.toggleSearchEnabled,
	setIssuesFilters: IssuesActions.setFilters,
	setRisksFilters: RisksActions.setFilters
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Board);
