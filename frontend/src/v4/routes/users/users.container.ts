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
import { withRouter } from 'react-router';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';

import {
	selectCollaboratorLimit,
	selectCurrentTeamspace,
	selectInvitationsCount,
	selectLicensesCount,
	selectUsers,
	selectUsersPending,
	selectUsersSuggestions,
	selectUserNotExists,
	UserManagementActions,
	selectIsTeamspaceAdmin
} from '../../modules/userManagement';
import { DialogActions } from '../../modules/dialog';
import { selectJobs } from '../../modules/jobs';
import { selectModels, selectProjects, TeamspacesActions } from '../../modules/teamspaces';
import { Users } from './users.component';

const mapStateToProps = createStructuredSelector({
	usersSuggestions: selectUsersSuggestions,
	users: selectUsers,
	jobs: selectJobs,
	limit: selectCollaboratorLimit,
	licencesCount: selectLicensesCount,
	invitationsCount: selectInvitationsCount,
	userNotExists: selectUserNotExists,
	projects: selectProjects,
	models: selectModels,
	currentTeamspace: selectCurrentTeamspace,
	selectedTeamspace: selectCurrentTeamspace,
	isPending: selectUsersPending,
	isTeamspaceAdmin: selectIsTeamspaceAdmin,
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	addUser: UserManagementActions.addUser,
	removeUser: UserManagementActions.removeUser,
	updateUserJob: UserManagementActions.updateUserJob,
	updatePermissions: UserManagementActions.updatePermissions,
	onUsersSearch: UserManagementActions.getUsersSuggestions,
	clearUsersSuggestions: UserManagementActions.clearUsersSuggestions,
	fetchQuotaInfo: TeamspacesActions.fetchQuotaInfo,
	showDialog: DialogActions.showDialog,
	fetchQuotaAndInvitations: UserManagementActions.fetchQuotaAndInvitations
}, dispatch);

export default withRouter(
	connect(
		mapStateToProps,
		mapDispatchToProps
	)(Users)
);
