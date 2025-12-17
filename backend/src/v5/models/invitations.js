/**
 *  Copyright (C) 2022 3D Repo Ltd
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

const { ADMIN_DB } = require('../handler/db.constants');
const { DEFAULT_OWNER_JOB } = require('./jobs.constants');

const Invitations = {};
const { addUserToAccount } = require('../services/sso/frontegg');
const db = require('../handler/db');
const { events } = require('../services/eventsManager/eventsManager.constants');
const { getTeamspaceRefId } = require('./teamspaceSettings');
const { publish } = require('../services/eventsManager/eventsManager');

const COL_NAME = 'invitations';

const findMany = (query, projection, sort) => db.find(ADMIN_DB, COL_NAME, query, projection, sort);

Invitations.getInvitationsByTeamspace = (teamspace, projection = {}) => findMany({ 'teamSpaces.teamspace': teamspace }, projection);

Invitations.inviteUserAsAdmin = async (teamspace, email) => {
	const job = DEFAULT_OWNER_JOB;
	const permissions = { teamspace_admin: true };
	const teamspaceEntry = { teamspace, job, permissions };
	const invitation = { _id: email, teamSpaces: [teamspaceEntry] };

	const refId = await getTeamspaceRefId(teamspace);
	await addUserToAccount(email, refId);

	await db.insertOne(ADMIN_DB, COL_NAME, invitation);
	publish(events.INVITATION_ADDED, { teamspace, email, job, permissions });
};

Invitations.initialise = () => db.createIndex(ADMIN_DB, COL_NAME, { 'teamSpaces.teamspace': 1 }, { runInBackground: true });

module.exports = Invitations;
