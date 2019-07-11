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

import { selectCurrentTeamspace } from '../../modules/currentUser';
import { DialogActions } from '../../modules/dialog';
import { selectActiveProject,
	selectActiveTeamspace,
	selectIsPending,
	selectTeamspaces,
	TeamspacesActions
} from '../../modules/teamspaces';
import { ModelActions } from './../../modules/model';
import { Teamspaces } from './teamspaces.component';
const mapStateToProps = createStructuredSelector({
	currentTeamspace: selectCurrentTeamspace,
	teamspaces: selectTeamspaces,
	isPending: selectIsPending,
	activeProject: selectActiveProject,
	activeTeamspace: selectActiveTeamspace
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	showDialog: DialogActions.showDialog,
	showConfirmDialog: DialogActions.showConfirmDialog,
	createProject: TeamspacesActions.createProject,
	updateProject: TeamspacesActions.updateProject,
	removeProject: TeamspacesActions.removeProject,
	createModel: TeamspacesActions.createModel,
	updateModel: TeamspacesActions.updateModel,
	removeModel: TeamspacesActions.removeModel,
	fetchTeamspaces: TeamspacesActions.fetchTeamspaces,
	downloadModel: ModelActions.downloadModel,
	setState: TeamspacesActions.setComponentState
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Teamspaces);
