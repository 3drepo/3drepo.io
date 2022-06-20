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
const { createResponseCode, templates } = require('./responseCodes');
const { getAllUsersInTeamspace, getSubscriptions } = require('../models/teamspaces');
const DBHandler = require('../handler/db');
const config = require('./config');
const { getInvitationsByTeamspace } = require('../models/invitations');
const { getTotalSize } = require('../models/fileRefs');

const Quota = {};

Quota.getQuotaInfo = async (teamspace) => {
	const subs = await getSubscriptions(teamspace);
	let freeTier = true;
	let dataSize = config.subscriptions?.basic?.data ?? 0;
	let collaborators = config.subscriptions?.basic?.collaborators ?? 0;
	let hasExpiredQuota = false;
	let expiryDate = null;

	Object.keys(subs).forEach((key) => {
		// paypal subs have a different schema - and no oen should have an active paypal sub. Skip.
		if (key !== 'paypal') {
			const { expiryDate: subExpiryDate, data, collaborators: subCollaborators } = subs[key];
			if (subExpiryDate && subExpiryDate < Date.now()) {
				hasExpiredQuota = true;
			} else {
				freeTier = false;
				dataSize += data;

				if (!expiryDate || subExpiryDate < expiryDate) {
					expiryDate = subExpiryDate;
				}

				if (collaborators !== 'unlimited') {
					collaborators = subCollaborators === 'unlimited' ? 'unlimited' : collaborators + subCollaborators;
				}
			}
		}
	});

	if (hasExpiredQuota && dataSize === config.subscriptions?.basic?.data) throw templates.licenceExpired;

	return { data: dataSize * 1024 * 1024, collaborators, freeTier, expiryDate };
};

Quota.getSpaceUsed = async (teamspace) => {
	const colsToCount = ['.history.ref', '.issues.ref', '.risks.ref', '.resources.ref'];
	const collections = await DBHandler.listCollections(teamspace);
	const promises = [];
	collections.forEach(({ name }) => {
		const colNameArr = name.split('.');
		const nParts = colNameArr.length;
		if (nParts > 2) {
			const ext = `.${colNameArr[nParts - 2]}.${colNameArr[nParts - 1]}`;
			if (colsToCount.includes(ext)) {
				promises.push(getTotalSize(teamspace, name));
			}
		}
	});

	const sizes = await Promise.all(promises);
	return sizes.reduce((accum, val) => accum + val, 0);
};

Quota.getCollaboratorsAssigned = async (teamspace) => {
	const [teamspaceUsers, teamspaceInvitations] = await Promise.all([
		getAllUsersInTeamspace(teamspace),
		getInvitationsByTeamspace(teamspace, { _id: 1 }),
	]);

	return teamspaceUsers.length + teamspaceInvitations.length;
};

Quota.sufficientQuota = async (teamspace, size) => {
	if (size > config.uploadSizeLimit) {
		throw createResponseCode(templates.maxSizeExceeded, `File cannot be bigger than ${config.uploadSizeLimit} bytes.`);
	}

	const [quotaInfo, dataUsed] = await Promise.all([
		Quota.getQuotaInfo(teamspace),
		Quota.getSpaceUsed(teamspace),
	]);

	if ((dataUsed + size) > quotaInfo.data) {
		throw templates.quotaLimitExceeded;
	}
};

module.exports = Quota;
