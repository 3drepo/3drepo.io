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
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';

import { selectJobsList } from '../../../../modules/jobs';
import { selectSettings } from '../../../../modules/model';
import {
	selectActiveRiskDetails,
	selectActiveRiskId,
	selectFetchingDetailsIsPending,
	selectIsRisksPending,
	selectRisks,
	selectSearchEnabled,
	selectSelectedFilters,
	selectSelectedRisk,
	selectShowDetails,
	selectShowPins,
	selectSortOrder,
	RisksActions
} from '../../../../modules/risks';
import { selectQueryParams } from '../../../../modules/router/router.selectors';
import { Risks } from './risks.component';

const mapStateToProps = createStructuredSelector({
	modelSettings: selectSettings,
	risks: selectRisks,
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
	selectedRisk: selectSelectedRisk
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	fetchRisks: RisksActions.fetchRisks,
	setState: RisksActions.setComponentState,
	setNewRisk: RisksActions.setNewRisk,
	downloadRisks: RisksActions.downloadRisks,
	printRisks: RisksActions.printRisks,
	setActiveRisk: RisksActions.setActiveRisk,
	showRiskDetails: RisksActions.showDetails,
	goToRisk: RisksActions.goToRisk,
	toggleShowPins: RisksActions.toggleShowPins,
	subscribeOnRiskChanges: RisksActions.subscribeOnRiskChanges,
	unsubscribeOnRiskChanges: RisksActions.unsubscribeOnRiskChanges,
	closeDetails: RisksActions.closeDetails,
	saveRisk: RisksActions.saveRisk,
	toggleSortOrder: RisksActions.toggleSortOrder,
	setFilters: RisksActions.setFilters,
}, dispatch);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Risks));
