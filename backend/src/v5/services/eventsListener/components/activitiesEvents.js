/**
 *  Copyright (C) 2024 3D Repo Ltd
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

const { addActivity } = require('../../../models/activities');
const { deleteIfUndefined } = require('../../../utils/helper/objects');
const { events } = require('../../eventsManager/eventsManager.constants');
const { getProjectList } = require('../../../models/projectSettings');
const { logger } = require('../../../utils/logger');
const { subscribe } = require('../../eventsManager/eventsManager');
const { uuidToString } = require('../../../../v4/utils');

const actions = {
	USER_ADDED: 'USER_ADDED',
	USER_REMOVED: 'USER_REMOVED',
	PERMISSIONS_UPDATED: 'PERMISSIONS_UPDATED',
	INVITATION_ADDED: 'INVITATION_ADDED',
	INVITATION_REVOKED: 'INVITATION_REVOKED',
};

const userAdded = async ({ teamspace, executor, user }) => {
	try {
		await addActivity(teamspace, actions.USER_ADDED, executor, { user });
	} catch (err) {
		logger.logError(`Failed to add a ${actions.USER_ADDED} activity`);
		if (err.stack) {
			logger.logError(err.stack);
		}
	}
};

const userRemoved = async ({ teamspace, executor, user }) => {
	try {
		await addActivity(teamspace, actions.USER_REMOVED, executor, { user });
	} catch (err) {
		logger.logError(`Failed to add a ${actions.USER_REMOVED} activity`);
		if (err.stack) {
			logger.logError(err.stack);
		}
	}
};

const getPermissionUpdates = (initialPermissions, updatedPermissions, project, model) => {
	const updates = [];

	const allUsers = new Set([
		...initialPermissions.map((p) => p.user),
		...updatedPermissions.map((p) => p.user),
	]);

	allUsers.forEach((user) => {
		const from = initialPermissions.find((p) => p.user === user)?.permissions[0] ?? null;
		const to = updatedPermissions.find((p) => p.user === user)?.permissions[0] ?? null;

		if (from !== to) {
			const existingUpdate = updates.find((u) => u.to === to && u.from === from);
			if (existingUpdate) {
				existingUpdate.users.push(user);
			} else {
				updates.push({ users: [user], from, to, project, model });
			}
		}
	});

	return updates;
};

const permissionsUpdated = async ({ teamspace, executor, isTsUpdate, initialPermissions, updatedPermissions }) => {
	try {
		const entries = [];
		const projects = await getProjectList(teamspace, { models: 1 });

		const addEntries = (permissionUpdates) => {
			entries.push(...permissionUpdates.map((p) => ({
				users: p.users,
				permissions: [deleteIfUndefined({ from: p.from, to: p.to, project: p.project, model: p.model })],
			})));
		};

		if (isTsUpdate) {
			const permissionUpdates = getPermissionUpdates(initialPermissions, updatedPermissions);
			addEntries(permissionUpdates);
		} else {
			updatedPermissions.forEach(({ project, model, permissions }) => {
				const updProject = project ?? projects.find((p) => p.models.includes(model))._id;

				const initialPermObj = initialPermissions.find((initPerm) => {
					const initProject = initPerm.project ?? projects.find((p) => p.models.includes(initPerm.model))._id;
					return uuidToString(initProject) === uuidToString(updProject) && initPerm.model === model;
				});

				const permissionUpdates = getPermissionUpdates(
					model
						? initialPermObj.permissions.map((p) => ({ user: p.user, permissions: [p.permission] }))
						: initialPermObj.permissions,
					model
						? permissions.map((p) => ({ user: p.user, permissions: [p.permission] }))
						: permissions,
					updProject, model,
				);

				addEntries(permissionUpdates);
			});
		}

		const mergedEntries = {};
		entries.forEach((entry) => {
			const usersKey = entry.users.sort().join(',');

			if (!mergedEntries[usersKey]) {
				mergedEntries[usersKey] = { users: entry.users, permissions: [] };
			}

			mergedEntries[usersKey].permissions.push(...entry.permissions);
		});

		await Promise.all([
			Object.values(mergedEntries).map((e) => addActivity(teamspace, actions.PERMISSIONS_UPDATED, executor,
				{ users: e.users, permissions: e.permissions })),
		]);
	} catch (err) {
		logger.logError(`Failed to add a ${actions.PERMISSIONS_UPDATED} activity`);
		if (err.stack) {
			logger.logError(err.stack);
		}
	}
};

const invitationAdded = async ({ teamspace, executor, email, job, permissions }) => {
	try {
		await addActivity(teamspace, actions.INVITATION_ADDED, executor, { email, job, permissions });
	} catch (err) {
		logger.logError(`Failed to add a ${actions.INVITATION_ADDED} activity`);
		if (err.stack) {
			logger.logError(err.stack);
		}
	}
};

const invitationRevoked = async ({ teamspace, executor, email, job, permissions }) => {
	try {
		await addActivity(teamspace, actions.INVITATION_REVOKED, executor, { email, job, permissions });
	} catch (err) {
		logger.logError(`Failed to add a ${actions.INVITATION_REVOKED} activity`);
		if (err.stack) {
			logger.logError(err.stack);
		}
	}
};

const ActivitiesEventsListener = {};

ActivitiesEventsListener.init = () => {
	subscribe(events.USER_ADDED, userAdded);
	subscribe(events.USER_REMOVED, userRemoved);
	subscribe(events.PERMISSIONS_UPDATED, permissionsUpdated);
	subscribe(events.INVITATION_ADDED, invitationAdded);
	subscribe(events.INVITATION_REVOKED, invitationRevoked);
};

module.exports = ActivitiesEventsListener;
