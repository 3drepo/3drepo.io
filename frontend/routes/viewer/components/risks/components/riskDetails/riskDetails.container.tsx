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
import { connect } from '../../../../../../helpers/migration';

import { RiskDetails } from './riskDetails.component';
import {
	RisksActions,
	selectActiveRiskDetails,
	selectExpandDetails,
	selectNewComment,
	selectAssociatedActivities
} from '../../../../../../modules/risks';
import { selectJobsList, selectMyJob } from '../../../../../../modules/jobs';
import { selectSettings } from '../../../../../../modules/model';
import { DialogActions } from '../../../../../../modules/dialog';
import { selectCurrentUser } from '../../../../../../modules/currentUser';

const mapStateToProps = createStructuredSelector({
	modelSettings: selectSettings,
	jobs: selectJobsList,
	risk: selectActiveRiskDetails,
	newComment: selectNewComment,
	expandDetails: selectExpandDetails,
	associatedActivities: selectAssociatedActivities,
	myJob: selectMyJob,
	currentUser: selectCurrentUser
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	setState: RisksActions.setComponentState,
	updateRisk: RisksActions.updateRisk,
	updateNewRisk: RisksActions.updateNewRisk,
	showNewPin: RisksActions.showNewPin,
	showScreenshotDialog: DialogActions.showScreenshotDialog
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(RiskDetails);
