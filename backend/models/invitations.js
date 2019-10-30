/**
 *	Copyright (C) 2019 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
"use strict";

const db = require("../handler/db");
const User = require("./user");
const Job = require("./job");
const Project = require("./project");
const { contains: setContains } = require("./helper/set");

const responseCodes = require("../response_codes.js");
const { omit } = require("lodash");
const C = require("../constants");

const getCollection = async () => {
	const coll = await db.getCollection("admin", "invitations");
	coll.createIndex({ "teamSpaces.teamspace": 1 }, { "unique": true, "background": true, "w":1 });
	return coll;
};

const invitations = {};

const validateModels = (projectsPermissions, projectsData) => {
	return projectsPermissions.every((project, index) => {
		const models = new Set((project.models || []).map(m=> m.id));
		const allModels = new Set(projectsData[index].models);
		return setContains(allModels, models);
	});
};

invitations.create = async (email, teamspace, job, permissions = {}) => {
	// 1 - find if there is already and invitation with that email
	// 2 - if there is update the invitation with the new teamspace data
	// 2.5 - if there is not, create an entry with that email and job/permission
	// 3 - send an email invitation
	// 4 - return the invitation for that teamspace ({email, job, permissions:[]})

	permissions.projects = permissions.projects || [];

	const projectNames = permissions.projects.map(pr => pr.name);

	const [emailUser, teamspaceJob, projects] = await Promise.all([
		User.findByEmail(email),
		Job.findByJob(teamspace, job),
		Project.findByNames(teamspace, projectNames)
	]);

	if (emailUser) { // If there is already a user registered with that email
		throw responseCodes.EMAIL_INVALID;
	}

	if (!teamspaceJob) { // If there is no job in that teamspace with the name
		throw responseCodes.JOB_NOT_FOUND;
	}

	if (projects.length !== projectNames.length) {
		throw responseCodes.INVALID_PROJECT_NAME;
	}

	if (!validateModels(permissions.projects, projects)) {
		throw responseCodes.INVALID_MODEL_ID;
	}

	//		Project.findByNames(projects)

	// email = email.toLowerCase();
	// const coll = await getCollection();
	// const result = await coll.findOne({_id:email});
	// const teamspaceEntry = { teamspace, job, permissions: {teamspace: permissions} };

	// if (result) {
	// 	const teamSpaces = result.teamSpaces.filter(entry => entry.teamspace !== teamspace);
	// 	teamSpaces.push(teamspaceEntry);
	// 	const invitation = { teamSpaces };
	// 	await coll.updateOne({_id:email}, { $set: invitation });
	// } else {
	// 	const invitation = {_id:email ,teamSpaces: [teamspaceEntry] };
	// 	await coll.insertOne(invitation);
	// }

	// // TODO: should send an email with the invitation
	// return {email, job, permissions};
};

invitations.removeTeamspaceFromInvitation = async (email, teamspace) => {
	email = email.toLowerCase();
	const coll = await getCollection();
	const result = await coll.findOne({_id:email});

	if (!result) {
		return null;
	}

	const data =  { _id: email, teamSpaces: result.teamSpaces.filter(teamspaceEntry => teamspaceEntry === teamspace) };

	if (data.teamSpaces.length === 0) {
		await coll.deleteOne({_id: email});
		return {};
	} else {
		await coll.updateOne({_id:email}, { $set: data });
		return {};
	}
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

invitations.unpack = async (user) => {
	const coll = await getCollection();
	const result = await coll.findOne({_id: user.customData.email});

	if (!result) {
		return {};
	}

	await Promise.all(Object.keys(result.teamSpaces).map(
		async teamspace => {
			const teamspaceUser = await User.findByUserName(teamspace);
			const {job, permissions} = result.teamSpaces[teamspace];

			// TODO: should send an email to the teamspace adming
			return await teamspaceUser.addTeamMember(user.user, job, permissions.teamspace);
		}));

	await coll.deleteOne({_id: user.customData.email});
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

invitations.isInvitation = (user) => {
	return C.EMAIL_REGEXP.test(user);
};

module.exports = invitations;
