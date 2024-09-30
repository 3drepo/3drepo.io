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

import { DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { formatMessage } from '@/v5/services/intl';
import { isEmpty } from 'lodash';
import { all, put, select, takeLatest } from 'redux-saga/effects';

import { TeamspacesActions } from '@/v5/store/teamspaces/teamspaces.redux';
import { selectCurrentQuotaSeats } from '@/v5/store/teamspaces/teamspaces.selectors';
import { updatePermissionsOrTriggerModal } from '@components/shared/updatePermissionModal/updatePermissionModal.component';
import {
	FederationReminderDialog
} from '../../routes/modelsPermissions/components/federationReminderDialog/federationReminderDialog.component';
import * as API from '../../services/api';
import { selectCurrentUser } from '../currentUser';
import { DialogActions } from '../dialog';
import { JobsActions } from '../jobs';
import { SnackbarActions } from '../snackbar';
import { dispatch } from '../store';
import {
	selectCurrentTeamspace,
	selectInvitations,
	selectProject,
	selectUserNotExists,
	UserManagementActions,
	UserManagementTypes,
} from '../userManagement';
import { dialogMessages } from './userManagement.constants';

export function* fetchQuotaAndInvitations() {
	try {
		yield put(UserManagementActions.setUsersPending(true));

		const teamspace = yield select(selectCurrentTeamspace);

		const [{data: invitations}, {data: {collaboratorLimit}}] = yield all([
			API.fetchInvitations(teamspace),
			API.getQuotaInfo(teamspace),
			put(JobsActions.fetchJobs(teamspace))
		]);

		yield put(UserManagementActions.fetchQuotaAndInvitationsSuccess(
			invitations,
			collaboratorLimit
		));

		yield put(UserManagementActions.setUsersPending(false));
	} catch (error) {
		DialogsActionsDispatchers.open('alert', {
			currentActions: formatMessage({ id: 'teamspaceUsers.alert', defaultMessage: 'trying to access teamspace users' }),
		error,
		})
		yield put(UserManagementActions.setUsersPending(false));
	}
}

export function *fetchCurrentTeamspaceJobsAndColors() {
	const teamspace = yield select(selectCurrentTeamspace);

	yield put(JobsActions.fetchJobs(teamspace));
}

export function* fetchTeamspaceUsers() {
	try {
		yield put(UserManagementActions.setUsersPending(true));
		const teamspace = yield select(selectCurrentTeamspace);
		if (!teamspace) {
			yield put(UserManagementActions.fetchTeamspaceUsersSuccess([]));
			yield put(UserManagementActions.setUsersPending(false));
			return;
		}

		const {data: users} = yield API.fetchUsers(teamspace);
		yield put(UserManagementActions.fetchTeamspaceUsersSuccess(users));
		yield put(UserManagementActions.setUsersPending(false));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('get', 'teamspace members', error));
		yield put(UserManagementActions.setUsersPending(false));
	}
}

export function* addUser({ user }) {
	try {
		const isUserNotExists = yield select(selectUserNotExists);
		if (isUserNotExists) {
			yield put(UserManagementActions.setUserNotExists(false));
		}

		const teamspace = yield select(selectCurrentTeamspace);
		const { data } = yield API.addUser(teamspace, user);
		const currentUser = yield select(selectCurrentUser);

		yield put(UserManagementActions.addUserSuccess(data, currentUser.username));
		yield put(SnackbarActions.show('User added'));

		const { used } = yield select(selectCurrentQuotaSeats);
		yield put(TeamspacesActions.setUsedQuotaSeats(teamspace, used + 1));
	} catch (error) {
		if (error.response.status === 404) {
			yield put(UserManagementActions.setUserNotExists(true));
		} else {
			yield put(DialogActions.showEndpointErrorDialog('add', 'licence', error));
		}
	}
}

export function* sendInvitation({ email, job, isAdmin, permissions, onFinish, onError }) {
	try {
		const invitation = { email, job } as any;
		invitation.permissions = {};

		if (isAdmin) {
			invitation.permissions.teamspace_admin = true;
		} else {
			invitation.permissions.projects = permissions.map(({ project, models, isAdmin: isProjectAdmin }) => {
				const projectPermissions = { project } as any;
				if (isProjectAdmin) {
					projectPermissions.project_admin = true;
					return projectPermissions;
				}

				projectPermissions.models = models.filter(({ key }) => Boolean(key))
					.map(({ model, key: permission }) => ({
					model, permission
				}));
				return projectPermissions;
			});
		}

		const teamspace = yield select(selectCurrentTeamspace);
		const pendingInvitations = yield select(selectInvitations);
		const isInvitationNotOnPendingList = isEmpty(pendingInvitations.filter((item) => (item.email === invitation.email)));
		const actionMessage = isInvitationNotOnPendingList ? 'Invitation sent' : 'Invitation updated';
		const { data: savedInvitation } = yield API.sendInvitation(teamspace, invitation);

		const { used } = yield select(selectCurrentQuotaSeats);
		yield put(TeamspacesActions.setUsedQuotaSeats(teamspace, used + 1));
		onFinish();
		yield put(UserManagementActions.sendInvitationSuccess(savedInvitation));
		yield put(SnackbarActions.show(actionMessage));
	} catch (error) {
		onError();
		yield put(DialogActions.showEndpointErrorDialog('sent', 'invitation', error));
	}
}

export function* removeInvitation({ email }) {
	try {
		const teamspace = yield select(selectCurrentTeamspace);
		yield API.removeInvitation(teamspace, email);
		yield put(UserManagementActions.removeInvitationSuccess(email));
		yield put(SnackbarActions.show('Invitation removed'));

		const { used } = yield select(selectCurrentQuotaSeats);
		yield put(TeamspacesActions.setUsedQuotaSeats(teamspace, used - 1));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('remove', 'invitation', error));
	}
}

export function* removeUser({ username }) {
	try {
		const teamspace = yield select(selectCurrentTeamspace);
		const { used } = yield select(selectCurrentQuotaSeats);
			DialogsActionsDispatchers.open('delete', {
				name: username,
				onClickConfirm: () => new Promise<void>(
					(accept, reject) => {
						try {
							dispatch(UserManagementActions.removeUserCascade(username));
							dispatch(TeamspacesActions.setUsedQuotaSeats(teamspace, used - 1));
							accept();
						} catch {
							reject();
						}
					},
				),
				titleLabel: formatMessage({
					id: 'deleteModal.teamspaceUser.title',
					defaultMessage: 'Remove {username}',
				}, { username }),
				confirmLabel: formatMessage({
					id: 'deleteModal.teamspaceUser.confirm',
					defaultMessage: 'Remove',
				}),
				message: formatMessage({
					id: 'deleteModal.teamspaceUser.message',
					defaultMessage: 'Are you sure you want to remove this user?',
				}),
				confidenceCheck: true,
			});
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('remove', 'licence', error));
	}
}

export function* removeUserCascade({ username }) {
	try {
		const teamspace = yield select(selectCurrentTeamspace);
		yield API.removeUserCascade(teamspace, username);
		yield put(UserManagementActions.removeUserSuccess(username));
		yield put(SnackbarActions.show('User removed'));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('remove', 'licence', error));
	}
}

export function* updateUserJob({ username, job }) {
	try {
		const teamspace = yield select(selectCurrentTeamspace);
		if (job) {
			yield (API.updateUserJob(teamspace, job, username));
			yield put(UserManagementActions.updateUserJobSuccess(username, job));
			yield put(SnackbarActions.show('User job updated'));
		}
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('assign', 'job', error));
	}
}

export function* updatePermissions({ permissions, permissionsType, permissionsCount }) {
	try {
		const shouldUpdate = yield updatePermissionsOrTriggerModal({
			permissionsType,
			permissionsCount,
		});
		if (!shouldUpdate) {
			return;
		}
		const teamspace = yield select(selectCurrentTeamspace);
		const currentUser = yield select(selectCurrentUser);

		yield API.setUserPermissions(teamspace, permissions);
		yield put(UserManagementActions.updatePermissionsSuccess(permissions, currentUser));
		yield put(SnackbarActions.show('Teamspace permissions updated'));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('update', 'teamspace permissions', error));
	}
}

export function* getUsersSuggestions({ searchText }) {
	try {
		const teamspace = yield select(selectCurrentTeamspace);
		const {data: suggestions} = yield API.findUsers(teamspace, searchText);
		yield put(UserManagementActions.getUsersSuggestionsSuccess(suggestions));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('search', 'users', error));
	}
}

// Projects
export function* fetchProject({ project }) {
	try {
		if (!project) {
			yield put(UserManagementActions.fetchProjectSuccess(null));
			return;
		}

		yield put(UserManagementActions.setProjectsPending(true));

		const teamspace = yield select(selectCurrentTeamspace);
		const { data: projectData } = yield API.fetchProject(teamspace, project);

		yield put(UserManagementActions.fetchProjectSuccess(projectData));

		yield put(UserManagementActions.setProjectsPending(false));
	} catch (error) {
		DialogsActionsDispatchers.open('alert', {
			currentActions: formatMessage({ id: 'projectPermissions.alert', defaultMessage: 'trying to fetch a project' }),
			error,
		})
		yield put(UserManagementActions.setProjectsPending(false));
	}
}

export function* updateProjectPermissions({ permissions, permissionsType, permissionsCount }) {
	try {
		const shouldUpdate = yield updatePermissionsOrTriggerModal({
			permissionsType,
			permissionsCount,
		});
		if (!shouldUpdate) {
			return;
		}
		const teamspace = yield select(selectCurrentTeamspace);
		const {name} = yield select(selectProject);
		const project = {name, permissions};
		yield API.updateProject(teamspace, project.name, project);

		yield put(UserManagementActions.updateProjectPermissionsSuccess(permissions));
		yield put(SnackbarActions.show('Project permissions updated'));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('update', 'project permissions', error));
	}
}

// Models
export function* fetchModelsPermissions({ models }) {
	try {
		yield put(UserManagementActions.setProjectsPending(true));

		const teamspace = yield select(selectCurrentTeamspace);
		let data = [];
		if (models.length) {
			const requiredModels = models.map(({ model }) => model);
			const promises = [];
			const chunks = 10;
			for (let i = 0; i < requiredModels.length; i += chunks) {
				const currentBatch = requiredModels.slice(i, i + chunks);
				promises.push(API.fetchModelsPermissions(teamspace, currentBatch).then((response) => data = response.data));
			}

			data = yield Promise.all(promises).then((res) => [].concat(...res));
		}

		yield put(UserManagementActions.fetchModelPermissionsSuccess(data));
		yield put(UserManagementActions.setProjectsPending(false));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('get', 'containers/federations/drawings permissions', error));
		yield put(UserManagementActions.setProjectsPending(false));
	}
}

export function* updateModelsPermissionsPre({ modelsWithPermissions, permissionsType, permissionsCount }) {
	try {
		const currentProject = yield select(selectProject);
		const permissionlessModels = [];
		for (let index = 0; index < modelsWithPermissions.length; index++) {
			const selectedModel = modelsWithPermissions[index];

			if (selectedModel.federate && selectedModel.subModels) {
				selectedModel.subModels.forEach((subModel) => {
					Object.keys(currentProject.models).forEach((modelId) => {
						const projectModel = currentProject.models[modelId];
						if (subModel.model === projectModel.model) {
							permissionlessModels.push(projectModel.name);
						}
					});
				});
			}
		}

		const resolveUpdate = UserManagementActions.updateModelsPermissions(modelsWithPermissions, permissionsType, permissionsCount);

		if (permissionlessModels.length) {
			const config = {
				title: 'Reminder about Federation Permissions',
				template: FederationReminderDialog,
				onConfirm: () => resolveUpdate,
				data: {
					models: permissionlessModels
				}
			};

			yield put(DialogActions.showDialog(config));
		} else {
			yield put(resolveUpdate);
		}
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('update', 'containers/federations/drawings permissions', error));
	}
}

export function* updateModelsPermissions({ modelsWithPermissions, permissionsType, permissionsCount }) {
	try {
		const shouldUpdate = yield updatePermissionsOrTriggerModal({
			permissionsType,
			permissionsCount,
		});
		if (!shouldUpdate) {
			return;
		}

		const teamspace = yield select(selectCurrentTeamspace);
		const response = yield API.updateModelsPermissions(teamspace, modelsWithPermissions);

		if (response.status === 200) {
			yield put(UserManagementActions.updateModelPermissionsSuccess(modelsWithPermissions));
			yield put(SnackbarActions.show('containers/federations/drawings permissions updated'));
		} else {
			yield put(DialogActions.showErrorDialog('update', 'containers/federations/drawings permissions', dialogMessages.UPDATE_ERROR));
		}
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('update', 'containers/federations/drawings permissions', error));
	}
}

export default function* UserManagementSaga() {
	yield takeLatest(UserManagementTypes.FETCH_QUOTA_AND_INVITATIONS, fetchQuotaAndInvitations);
	yield takeLatest(UserManagementTypes.FETCH_TEAMSPACE_USERS, fetchTeamspaceUsers);

	yield takeLatest(UserManagementTypes.FETCH_CURRENT_TEAMSPACE_JOBS_AND_COLORS, fetchCurrentTeamspaceJobsAndColors);

	yield takeLatest(UserManagementTypes.ADD_USER, addUser);
	yield takeLatest(UserManagementTypes.REMOVE_USER, removeUser);
	yield takeLatest(UserManagementTypes.REMOVE_USER_CASCADE, removeUserCascade);
	yield takeLatest(UserManagementTypes.UPDATE_PERMISSIONS, updatePermissions);
	yield takeLatest(UserManagementTypes.GET_USERS_SUGGESTIONS, getUsersSuggestions);
	yield takeLatest(UserManagementTypes.UPDATE_USER_JOB, updateUserJob);
	yield takeLatest(UserManagementTypes.REMOVE_INVITATION, removeInvitation);
	yield takeLatest(UserManagementTypes.SEND_INVITATION, sendInvitation);

	// Models
	yield takeLatest(UserManagementTypes.FETCH_MODELS_PERMISSIONS, fetchModelsPermissions);
	yield takeLatest(UserManagementTypes.UPDATE_MODELS_PERMISSIONS_PRE, updateModelsPermissionsPre);
	yield takeLatest(UserManagementTypes.UPDATE_MODELS_PERMISSIONS, updateModelsPermissions);

	// Projects
	yield takeLatest(UserManagementTypes.FETCH_PROJECT, fetchProject);
	yield takeLatest(UserManagementTypes.UPDATE_PROJECT_PERMISSIONS, updateProjectPermissions);
}
