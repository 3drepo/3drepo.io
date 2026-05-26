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

import { selectJobsList } from '../../../../modules/jobs';
import { selectSettings } from '../../../../modules/model';
import {
	selectActiveRiskDetails,
	selectActiveRiskId,
	selectFetchingDetailsIsPending,
	selectFilteredRisks,
	selectIsRisksPending,
	selectMitigationCriteria,
	selectSearchEnabled,
	selectSelectedFilters,
	selectSelectedRisk,
	selectShowDetails,
	selectShowPins,
	selectSortByField, selectSortOrder, RisksActions
} from '../../../../modules/risks';
import { selectSettings as selectTeamspaceSettings } from '../../../../modules/teamspace';
import { Risks } from './risks.component';

const mapStateToProps = createStructuredSelector({
	modelSettings: selectSettings,
	risks: selectFilteredRisks,
	jobs: selectJobsList,
	activeRiskId: selectActiveRiskId,
	activeRiskDetails: selectActiveRiskDetails,
	showPins: selectShowPins,
	showDetails: selectShowDetails,
	searchEnabled: selectSearchEnabled,
	selectedFilters: selectSelectedFilters,
	isPending: selectIsRisksPending,
	fetchingDetailsIsPending: selectFetchingDetailsIsPending,
	sortOrder: selectSortOrder,
	selectedRisk: selectSelectedRisk,
	teamspaceSettings: selectTeamspaceSettings,
	criteria: selectMitigationCriteria,
	sortByField: selectSortByField
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	fetchRisks: RisksActions.fetchRisks,
	setState: RisksActions.setComponentState,
	setNewRisk: RisksActions.setNewRisk,
	downloadItems: RisksActions.downloadRisks,
	printItems: RisksActions.printRisks,
	setActiveRisk: RisksActions.setActiveRisk,
	showRiskDetails: RisksActions.showDetails,
	goToRisk: RisksActions.goToRisk,
	toggleShowPins: RisksActions.toggleShowPins,
	closeDetails: RisksActions.closeDetails,
	saveRisk: RisksActions.saveRisk,
	toggleSortOrder: RisksActions.toggleSortOrder,
	setFilters: RisksActions.setFilters,
	fetchMitigationCriteria: RisksActions.fetchMitigationCriteria,
	setSortBy: RisksActions.setSortBy,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Risks);
