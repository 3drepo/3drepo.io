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

const getCollection = async () => {
	return await db.getCollection("admin", "invitations");
};

const invitations = {};

invitations.create = async (email, teamSpace, job, permissions = []) => {
	// 1 - find if there is already and invitation with that email
	// 2 - if there is update the invitation with the new teamspace data
	// 2.5 - if there is not, create an entry with that email and job/permission
	// 3 - send an email invitaion
	// 4 - return the invitation for that teamspace ({email, job, permissions:[]})
	email = email.toLowerCase();
	const coll = await getCollection();
	const result = await coll.findOne({_id:email});
	const data = { [teamSpace] : { job , permissions}};

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

invitations.removeTeamspaceFromInvitation = (email, teamSpace) => {

};

invitations.setJob = (email, teamSpace, job) => {

};

invitations.setTeamspacePermission = (email, teamSpace, permission) => {

};

invitations.setProjectPermission = (email, teamSpace, project, permission) => {

};

invitations.setModelPermission = (email, teamSpace, model, permission) => {

};

invitations.unpack = (email, username) => {

};

invitations.getTeamspaceInvitations = (teamSpace) => {

};

module.exports = invitations;
