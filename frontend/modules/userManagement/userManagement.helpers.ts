import { first, get } from 'lodash';
import { MODEL_ROLES_TYPES } from '../../constants/model-permissions';
import { PROJECT_ROLES_TYPES } from '../../constants/project-permissions';
import {TEAMSPACE_PERMISSIONS} from '../../constants/teamspace-permissions';

/**
 * Bind model permissions with members data
 * @param modelPermissions
 */
export const getExtendedModelPermissions = (currentUsers = [], modelPermissions = []) => {
	return currentUsers.map((memberData) => {
		const memberModelPermissions = modelPermissions.find(({ user }) => user === memberData.user);
		let modelPermissionsKey = MODEL_ROLES_TYPES.UNASSIGNED;

		if (memberData.isAdmin || memberData.isProjectAdmin) {
			modelPermissionsKey = MODEL_ROLES_TYPES.ADMINISTRATOR;
		} else if (memberModelPermissions) {
			modelPermissionsKey = get(memberModelPermissions, 'permission', MODEL_ROLES_TYPES.UNASSIGNED);
		} else {
			modelPermissionsKey = 'undefined';
		}

		return {
			...memberData,
			permissions: get(memberModelPermissions, 'permissions', []),
			key: modelPermissionsKey,
			isModelAdmin: modelPermissionsKey === MODEL_ROLES_TYPES.ADMINISTRATOR
		};
	});
};

export const getExtendedProjectPermissions = (currentUsers = [], project  ) => {
	const projectPermissions =  !project ? [] : project.permissions;
	return currentUsers.reduce((projectUsers, user) => {
		const userPermission = projectPermissions.find((projectUser) => projectUser.user === user.user);
		if (userPermission) {
			const permissions = userPermission.permissions;
			let projectPermissionsKey = PROJECT_ROLES_TYPES.UNASSIGNED;
			if (user.isAdmin) {
				projectPermissionsKey = PROJECT_ROLES_TYPES.ADMINISTRATOR;
			} else {
				projectPermissionsKey = first(permissions) || PROJECT_ROLES_TYPES.UNASSIGNED;
			}

			projectUsers.push({
				...user,
				isProjectAdmin: projectPermissionsKey === PROJECT_ROLES_TYPES.ADMINISTRATOR,
				permissions,
				key: projectPermissionsKey
			});
		}
		return projectUsers;
	}, []);
};

/**
 * Add additional fields to user data
 * @param users
 * @returns
 */
export const prepareUserData = (teamspaceName, currentUser, userData): object => {
	return {
		...userData,
		isAdmin: userData.permissions.includes(TEAMSPACE_PERMISSIONS.admin.key),
		isOwner: teamspaceName === userData.user,
		isCurrentUser: currentUser === userData.user
	};
};
