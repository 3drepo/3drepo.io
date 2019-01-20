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

import { Risks } from './risks.component';
import {
	RisksActions,
	selectRisks,
	selectActiveRiskId,
	selectActiveRiskDetails,
	selectShowDetails,
	selectSearchEnabled,
	selectSelectedFilters,
	selectShowPins,
	selectIsRisksPending
} from '../../../../modules/risks';
import { selectJobsList } from '../../../../modules/jobs';
import { selectSettings } from '../../../../modules/model';

const mapStateToProps = createStructuredSelector({
	modelSettings: selectSettings,
	risks: selectRisks,
	jobs: selectJobsList,
	activeRiskId: selectActiveRiskId,
	activeRiskDetails: selectActiveRiskDetails,
	areShowedPins: selectShowPins,
	showDetails: selectShowDetails,
	searchEnabled: selectSearchEnabled,
	setState: RisksActions.setComponentState,
	selectedFilters: selectSelectedFilters,
	isPending: selectIsRisksPending
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	fetchRisks: RisksActions.fetchRisks,
	setState: RisksActions.setComponentState,
	setNewRisk: RisksActions.setNewRisk,
	deleteRisks: RisksActions.deleteRisks,
	downloadRisks: RisksActions.downloadRisks,
	printRisks: RisksActions.printRisks,
	setActiveRisk: RisksActions.setActiveRisk,
	showRiskDetails: RisksActions.showDetails
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Risks);
