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

import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import { connect, addRouting } from '../../helpers/migration';

import { UserManagement } from './userManagement.component';
import {
	UserManagementActions,
	selectCurrentTeamspace,
	selectIsPending,
	selectIsTeamspaceAdmin
} from '../../modules/userManagement';

import { selectTeamspacesWithAdminAccess } from '../../modules/teamspaces/teamspaces.selectors';

import {
	selectCurrentTeamspace as selectDefaultTeamspace,
	selectCurrentUser
} from '../../modules/currentUser';
import { TeamspacesActions } from '../../modules/teamspaces';

const mapStateToProps = createStructuredSelector({
	defaultTeamspace: selectDefaultTeamspace,
	selectedTeamspace: selectCurrentTeamspace,
	teamspaces: selectTeamspacesWithAdminAccess,
	isTeamspaceAdmin: selectIsTeamspaceAdmin,
	isLoadingTeamspace: selectIsPending,
	currentUser: selectCurrentUser
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	fetchTeamspaces: TeamspacesActions.fetchTeamspaces,
	onTeamspaceChange: UserManagementActions.fetchTeamspaceDetails
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(UserManagement);
