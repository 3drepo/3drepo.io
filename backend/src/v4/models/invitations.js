/**
 *  Copyright (C) 2019 3D Repo Ltd
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

"use strict";

const { v5Path } = require("../../interop");

const db = require("../handler/db");
const User = require("./user");
const Job = require("./job");
const { changePermissions, findModelSettings } = require("./modelSetting");
const { findProjectsById, setUserAsProjectAdminById } = require("./project");
const { getSecurityRestrictions }  = require(`${v5Path}/models/teamspaceSettings`);
const { SECURITY_SETTINGS: { SSO_RESTRICTED } }  = require(`${v5Path}/models/teamspaces.constants`);
const systemLogger = require("../logger.js").systemLogger;
const Mailer = require("../mailer/mailer");
const { publish } = require(`${v5Path}/services/eventsManager/eventsManager`);
const { events } = require(`${v5Path}/services/eventsManager/eventsManager.constants`);

const { contains: setContains } = require("./helper/set");

const responseCodes = require("../response_codes.js");
const { omit } = require("lodash");

const MODELS_PERMISSION = ["collaborator", "commenter", "viewer"];

const getCollection = () => db.getCollection("admin", "invitations");

const invitations = {};

const validateModels = (projectsPermissions, projectsData) => {
	const projectIDtoData = {};
	projectsData.forEach((data) => projectIDtoData[data._id] = data);
	return projectsPermissions.every((project) => {
		const models = new Set((project.models || []).map(m=> m.model));
		const allModels = new Set(projectIDtoData[project.project].models);
		return setContains(allModels, models);
	});
};

const validateModelsPermissions =  (projectsPermissions = []) => {
	return projectsPermissions.every(({models = []}) => models.every(({permission}) =>
		MODELS_PERMISSION.includes(permission)
	));
};

const cleanModelPermissions = modelPermissions => modelPermissions.map(({model, permission}) => ({model, permission}));

const cleanPermissions = (permissions) => {
	if (permissions.teamspace_admin) { // if the invitation will be teamspace admin , ignore the rest of the permissions that might be sent
		return { teamspace_admin: true };
	}

	let projectsPermissions = permissions.projects || [];
	projectsPermissions = projectsPermissions.map(({project, project_admin, models})=> {
		if (project_admin) {
			return { project, project_admin };
		}

		return {project, models: cleanModelPermissions(models)};
	});

	return { projects: projectsPermissions};
};

const sendInvitationEmail = async (email, username, teamspace) => {
	const { customData: {firstName, lastName, billing} } = await User.findByUserName(username);
	const name = firstName + " " + lastName;
	const company = ((billing || {}).billingInfo || {}).company || username;
	const secRes = await getSecurityRestrictions(teamspace);

	Mailer.sendTeamspaceInvitation(email, {name, company, teamspace, needSSO: !!secRes[SSO_RESTRICTED]});
};

invitations.create = async (email, teamspace, job, username, permissions = {}) => {
	// 1 - find if there is already and invitation with that email
	// 2 - if there is update the invitation with the new teamspace data
	// 2.5 - if there is not, create an entry with that email and job/permission
	// 3 - send an email invitation
	// 4 - return the invitation for that teamspace ({email, job, permissions:[]})

	const projectsPermissions = permissions.projects || [];

	const projectIds = projectsPermissions.map(pr => pr.project);

	const [emailUser, teamspaceJob, projects] = await Promise.all([
		User.findByEmail(email),
		Job.findByJob(teamspace, job),
		findProjectsById(teamspace, projectIds)
	]);

	if (emailUser) { // If there is already a user registered with that email
		throw responseCodes.USER_ALREADY_EXISTS;
	}

	if (!teamspaceJob) { // If there is no job in that teamspace with the name
		throw responseCodes.JOB_NOT_FOUND;
	}

	if (projects.length !== projectIds.length) {
		throw responseCodes.INVALID_PROJECT_ID;
	}

	if (!validateModelsPermissions(projectsPermissions)) {
		throw responseCodes.INVALID_MODEL_PERMISSION;
	}

	if (!validateModels(projectsPermissions, projects)) {
		throw responseCodes.INVALID_MODEL_ID;
	}

	permissions = cleanPermissions(permissions);

	email = email.toLowerCase();
	const coll = await getCollection();
	coll.ensureIndex({ "teamSpaces.teamspace": 1 }, { "background": true });
	const result = await coll.findOne({_id:email});
	const teamspaceEntry = { teamspace, job, permissions };

	if (result) {
		const teamSpaces = result.teamSpaces.filter(entry => entry.teamspace !== teamspace);
		teamSpaces.push(teamspaceEntry);

		const invitation = { teamSpaces };
		await coll.updateOne({_id:email}, { $set: invitation });

		// if its a new teamspace that the user has been invited send an invitation email
		if (result.teamSpaces.every(t=> t.teamspace !== teamspace)) {
			await sendInvitationEmail(email, username, teamspace);
		}

	} else {
		await User.hasReachedLicenceLimitCheck(teamspace);
		const invitation = {_id:email ,teamSpaces: [teamspaceEntry] };
		await coll.insertOne(invitation);
		await sendInvitationEmail(email, username, teamspace);

		publish(events.INVITATION_ADDED, { teamspace, executor: username, email, job, permissions});
	}

	return {email, job, permissions};
};

invitations.removeTeamspaceFromInvitation = async (email, teamspace, executor) => {
	email = email.toLowerCase();
	const coll = await getCollection();
	const result = await coll.findOne({_id:email});

	if (!result) {
		return null;
	}

	const entryToRemove = result.teamSpaces.find(entry => entry.teamspace === teamspace);

	const data =  { _id: email, teamSpaces: result.teamSpaces.filter(teamspaceEntry => teamspaceEntry.teamspace !== teamspace) };

	if (data.teamSpaces.length === 0) {
		await coll.deleteOne({_id: email});
	} else {
		await coll.updateOne({_id:email}, { $set: data });
	}

	publish(events.INVITATION_REVOKED, { teamspace, executor, email, job: entryToRemove.job, permissions: entryToRemove.permissions});

	return {};

};

invitations.setJob = async (email, teamspace, job) => {
	const coll = await getCollection();
	const invitation = await coll.findOne({_id:email});
	invitation.teamSpaces[teamspace].job = job;
	await coll.updateOne({_id:email}, { $set: invitation });
	return true;
};

invitations.setTeamspacePermission = async (email, teamspace, permissions) => {
	await invitations.teamspaceInvitationCheck(email, teamspace);
	const permissionsField = "teamSpaces." + teamspace + ".permissions.teamspace";
	const coll = await getCollection();
	await coll.updateOne({}, { $set: { [permissionsField]: permissions } });
	return {user:email, permissions};
};

invitations.teamspaceInvitationCheck = async (email, teamspace) => {
	const queryField = "teamSpaces." + teamspace ;
	const coll = await getCollection();
	const invitation = await coll.findOne({_id:email, [queryField]: {$exists:true}}, {_id: true});

	if (!invitation) {
		throw responseCodes.USER_NOT_FOUND;
	}

	return true;
};

const applyModelPermissions = (teamspace, invitedUser, modelsPermissions) => async modelSetting=> {
	const {permission} = modelsPermissions.find(({model}) => model === modelSetting._id);
	return changePermissions(teamspace, modelSetting._id, modelSetting.permissions.concat({user: invitedUser, permission}));
};

const applyProjectPermissions = (teamspace, invitedUser) => async ({ project_admin , project, models}) => {
	if (project_admin) {
		await setUserAsProjectAdminById(teamspace, project, invitedUser);
	} else {
		const modelsIds = models.map(({model}) => model);
		const modelsList = await findModelSettings(teamspace, {"_id" : {"$in" : modelsIds}});
		await Promise.all(modelsList.map(applyModelPermissions(teamspace, invitedUser, models)));
	}
};

const applyTeamspacePermissions = (invitedUser) => async ({ teamspace, job, permissions  }) => {
	const teamPerms = permissions.teamspace_admin ? ["teamspace_admin"] : [];

	try {
		await User.addTeamMember(teamspace, invitedUser, job, teamPerms);

		if (!permissions.teamspace_admin) {
			await Promise.all(permissions.projects.map(applyProjectPermissions(teamspace, invitedUser)));
		}
	} catch(err) {
		systemLogger.logError("Something failed when unpacking invitation: " + err.stack);
	}
};

invitations.unpack = async (invitedUser) => {
	const coll = await getCollection();
	const email = invitedUser.customData.email.toLowerCase();
	const username = invitedUser.user;
	const result = await coll.findOne({_id: email});

	if (!result || !result.teamSpaces) {
		return invitedUser;
	}

	await Promise.all(result.teamSpaces.map(applyTeamspacePermissions(username)));

	await coll.deleteOne({_id: email});
	return invitedUser;
};

invitations.getInvitationsByTeamspace = async (teamspaceName) => {
	const coll = await getCollection();
	const results = await coll.find({ "teamSpaces.teamspace": teamspaceName}).toArray();
	return results.map(invitationEntry => {
		const email = invitationEntry._id;
		const teamspaceData =  omit(invitationEntry.teamSpaces.find(({teamspace}) => teamspace === teamspaceName), "teamspace");
		return { email, ...teamspaceData };
	});
};

module.exports = invitations;
