/**
 *  Copyright (C) 2021 3D Repo Ltd
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

const { getUsersWithRole,
	grantAdministrativeRole,
	hasAdministrativeRole,
	revokeAdministrativeRole,
} = require('../models/users');

const Admin = {};

Admin.getUsersWithRole = async (users, roles) => {
	return await getUsersWithRole(users, roles);
};

Admin.updateUsersWithRole = async (users) => {
	const returnUsers = []
	if (users.length > 0) {
		users.forEach(async (user) => {
			const hasPermission = await hasAdministrativeRole(user.user, user.role)
			if (!hasPermission) {
				if ( await grantAdministrativeRole(user.user, user.role) ) {
					// future logging of actions
					returnUsers.push(user)

				} else {
					// future logging of actions
				};
			}
		});
	}
	return await returnUsers;
};

Admin.deleteUsersWithRole = async (users) => {
	const returnUsers = []
	if (users.length > 0) {
		users.forEach(async (user) => {
			const hasPermission = await hasAdministrativeRole(user.user, user.role)
			if (hasPermission) {
				if ( await revokeAdministrativeRole(user.user, user.role) ) {
					// future logging of actions
					returnUsers.push(user)
				} else {
					// future logging of actions
				};
			}
		});
	}
	return await returnUsers;
};

// Admin.getTeamspaceMembersInfo = async (teamspace) => {
// 	const [membersList, jobsList] = await Promise.all([
// 		getMembersInfo(teamspace),
// 		getJobsToUsers(teamspace),
// 	]);

// 	const usersToJob = {};
// 	jobsList.forEach(({ _id, users }) => {
// 		users.forEach((user) => {
// 			usersToJob[user] = _id;
// 		});
// 	});

// 	return membersList.map(
// 		(member) => (usersToJob[member.user] ? { ...member, job: usersToJob[member.user] } : member),
// 	);
// };

module.exports = Admin;
