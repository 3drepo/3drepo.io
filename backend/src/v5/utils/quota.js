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

Quota.getQuotaInfo = async (teamspace, inMegabytes = false) => {
	const subs = await getSubscriptions(teamspace);
	let quotaSize = 0;
	let collaboratorLimit = config.subscriptions?.basic?.collaborators ?? 0;
	let hasExpiredQuota = false;

	// eslint-disable-next-line no-loop-func
	Object.keys(subs).forEach((key) => {
		// paypal subs have a different schema - and no oen should have an active paypal sub. Skip.
		if (key !== 'paypal') {
			const { expiryDate, data } = subs[key];
			if (expiryDate && expiryDate < Date.now()) {
				hasExpiredQuota = true;
			} else {
				quotaSize += data;
				if (collaboratorLimit !== 'unlimited') {
					const subCollaborators = subs[key].collaborators;
					collaboratorLimit = subCollaborators === 'unlimited' ? 'unlimited' : collaboratorLimit + subCollaborators;
				}
			}
		}
	});

	if (hasExpiredQuota && quotaSize === 0) throw templates.licenceExpired;

	const basicQuota = config.subscriptions?.basic?.data;
	const quotaInBytes = (quotaSize + basicQuota);

	return { quota: inMegabytes ? quotaInBytes : quotaInBytes * 1024 * 1024, collaboratorLimit };
};

Quota.getSpacedUsed = async (teamspace, inMegabytes = false) => {
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
	const totalSpace = sizes.reduce((accum, val) => accum + val, 0);
	return inMegabytes ? totalSpace / (1024 * 1024) : totalSpace;
};

Quota.getCollaboratorsUsed = async (teamspace) => {
	const teamspaceUsers = await getAllUsersInTeamspace(teamspace);
	const teamspaceInvitations = await getInvitationsByTeamspace(teamspace);

	return teamspaceUsers.length + teamspaceInvitations.length;
};

Quota.sufficientQuota = async (teamspace, size) => {
	if (size > config.uploadSizeLimit) {
		throw createResponseCode(templates.maxSizeExceeded, `File cannot be bigger than ${config.uploadSizeLimit} bytes.`);
	}

	const [quotaInfo, dataUsed] = await Promise.all([
		Quota.getQuotaInfo(teamspace),
		Quota.getSpacedUsed(teamspace),
	]);

	if ((dataUsed + size) > quotaInfo.quota) {
		throw templates.quotaLimitExceeded;
	}
};

module.exports = Quota;
