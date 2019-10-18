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
const { omit } = require("lodash");
const responseCodes = require("../response_codes.js");
const C = require("../constants");



const getCollection = async () => {
	return await db.getCollection("admin", "invitations");
};

const invitations = {};

invitations.create = async (email, teamSpace, job, permissions = []) => {
	// 1 - find if there is already and invitation with that email
	// 2 - if there is update the invitation with the new teamspace data
	// 2.5 - if there is not, create an entry with that email and job/permission
	// 3 - send an email invitation
	// 4 - return the invitation for that teamspace ({email, job, permissions:[]})
	email = email.toLowerCase();
	const coll = await getCollection();
	const result = await coll.findOne({_id:email});
	const data = { [teamSpace] : { job , permissions: { teamspace: permissions }}};

	if (result) {
		const invitation = {teamSpaces: {...(result.teamSpaces), ...data }};
		await coll.updateOne({_id:email}, { $set: invitation });
	} else {
		const invitation = {_id:email ,teamSpaces: data };
		await coll.insertOne(invitation);
	}

	// TODO: should send an email with the invitation
	return {email, job, permissions};
};

invitations.removeTeamspaceFromInvitation = async (email, teamSpace) => {
	email = email.toLowerCase();
	const coll = await getCollection();
	const result = await coll.findOne({_id:email});

	if (!result) {
		return null;
	}

	const data =  { _id: email, teamSpaces: omit(result.teamSpaces,  teamSpace)};

	if (Object.keys(data.teamSpaces).length === 0) {
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

invitations.setTeamspacePermission = (email, teamSpace, permission) => {

};

invitations.setProjectPermission = (email, teamSpace, project, permission) => {

};

invitations.setModelPermission = (email, teamSpace, model, permission) => {

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
	const User = require("./user");

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

invitations.getTeamspaceInvitationsAsUsers = async (teamspace) => {
	const queryField = "teamSpaces." + teamspace ;
	const coll = await getCollection();
	const results = await coll.find({ [queryField]: {$exists:true}}, {[queryField]: true, job: true}).toArray();
	return results.map(invitationEntry => {
		const user = invitationEntry._id;
		const teamspaceData =  invitationEntry.teamSpaces[teamspace];
		const permissions = teamspaceData.permissions.teamspace;
		const job = teamspaceData.job;
		return {user, isInvitation: true, isCurrentUser: false, permissions, job};
	});
};

invitations.isInvitation = (user) => {
	return C.EMAIL_REGEXP.test(user);
};

module.exports = invitations;
