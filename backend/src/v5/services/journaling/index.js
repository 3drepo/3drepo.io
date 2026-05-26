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

const { logPermissionsUpdated, logSeatAllocated, logSeatDeallocated, logUserInvited, logUserUninvited } = require('../../models/teamspaces.audits');
const Yup = require('yup');
const { actions } = require('../../models/teamspaces.audits.constants');
const { events } = require('../eventsManager/eventsManager.constants');
const journalingLabel = require('../../utils/logger').labels.journaling;
const logger = require('../../utils/logger').logWithLabel(journalingLabel);
const { subscribe } = require('../eventsManager/eventsManager');
const { types } = require('../../utils/helper/yup');

const userAdded = async ({ teamspace, executor, user }) => {
	try {
		await logSeatAllocated(teamspace, executor, user);
	} catch (err) {
		logger.logError(`Failed to add a ${actions.USER_ADDED} audit log`);
	}
};

const userRemoved = async ({ teamspace, executor, user }) => {
	try {
		await logSeatDeallocated(teamspace, executor, user);
	} catch (err) {
		logger.logError(`Failed to add a ${actions.USER_REMOVED} audit log`);
	}
};

const permissionsSchema = Yup.array().of(Yup.string()).nullable().min(1);

const teamspacePermissionsUpdated = async ({ teamspace, executor, users, from, to }) => {
	try {
		const schema = Yup.array().of(Yup.object({
			from: permissionsSchema,
			to: permissionsSchema,
		}));

		const permissions = [{ from, to }];
		await schema.validate(permissions);
		await logPermissionsUpdated(teamspace, executor, users, permissions);
	} catch (err) {
		logger.logError(`Failed to add a ${actions.PERMISSIONS_UPDATED} audit log`);
	}
};

const projectPermissionsUpdated = async ({ teamspace, executor, project, users, from, to }) => {
	try {
		const schema = Yup.array().of(Yup.object({
			project: types.id.required(),
			from: permissionsSchema,
			to: permissionsSchema,
		}));

		const permissions = [{ project, from, to }];
		await schema.validate(permissions, { stripUnknown: true });
		await logPermissionsUpdated(teamspace, executor, users, permissions);
	} catch (err) {
		logger.logError(`Failed to add a ${actions.PERMISSIONS_UPDATED} audit log`);
	}
};

const modelsPermissionsUpdated = async ({ teamspace, executor, users, permissions }) => {
	try {
		const schema = Yup.array().of(Yup.object({
			project: types.id.required(),
			model: Yup.string().required(),
			from: permissionsSchema,
			to: permissionsSchema,
		}));

		await schema.validate(permissions, { stripUnknown: true });
		await logPermissionsUpdated(teamspace, executor, users, permissions);
	} catch (err) {
		logger.logError(`Failed to add a ${actions.PERMISSIONS_UPDATED} audit log`);
	}
};

const invitationAdded = async ({ teamspace, executor, email, job, permissions }) => {
	try {
		await logUserInvited(teamspace, executor, email, job, permissions);
	} catch (err) {
		logger.logError(`Failed to add a ${actions.INVITATION_ADDED} audit log`);
	}
};

const invitationRevoked = async ({ teamspace, executor, email, job, permissions }) => {
	try {
		await logUserUninvited(teamspace, executor, email, job, permissions);
	} catch (err) {
		logger.logError(`Failed to add a ${actions.INVITATION_REVOKED} audit log`);
	}
};

const JournalingService = {};

JournalingService.init = () => {
	subscribe(events.USER_ADDED, userAdded);
	subscribe(events.USER_REMOVED, userRemoved);
	subscribe(events.TEAMSPACE_PERMISSIONS_UPDATED, teamspacePermissionsUpdated);
	subscribe(events.PROJECT_PERMISSIONS_UPDATED, projectPermissionsUpdated);
	subscribe(events.MODEL_PERMISSIONS_UPDATED, modelsPermissionsUpdated);
	subscribe(events.INVITATION_ADDED, invitationAdded);
	subscribe(events.INVITATION_REVOKED, invitationRevoked);
};

module.exports = JournalingService;
