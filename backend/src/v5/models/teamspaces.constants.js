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

const TeamspaceConstants = {};

TeamspaceConstants.SECURITY = 'security';
TeamspaceConstants.SECURITY_SETTINGS = {
	SSO_RESTRICTED: 'ssoRestricted',
	DOMAIN_WHITELIST: 'allowedDomains',
};

TeamspaceConstants.SUBSCRIPTION_TYPES = [
	'enterprise',
	'pilot',
	'discretionary',
	'internal',
];

TeamspaceConstants.ADD_ONS = {
	VR: 'vrEnabled',
	POWERBI: 'powerBIEnabled',
	SRC: 'srcEnabled',
	HERE: 'hereEnabled',
	MODULES: 'modules',
	DAILY_DIGEST: 'dailyDigestEnabled',
	USERS_PROVISIONED: 'usersProvisioned',
	DISABLE_PERMISSIONS_ON_UI: 'disablePermissionsOnUI',
};

TeamspaceConstants.ADD_ONS_MODULES = {
	ISSUES: 'issues',
	RISKS: 'risks',
};

TeamspaceConstants.DEFAULT_RISK_CATEGORIES = [
	'Commercial Issue',
	'Environmental Issue',
	'Health - Material effect',
	'Health - Mechanical effect',
	'Safety Issue - Fall',
	'Safety Issue - Trapped',
	'Safety Issue - Event',
	'Safety Issue - Handling',
	'Safety Issue - Struck',
	'Safety Issue - Public',
	'Social Issue',
	'Other Issue',
	'Unknown',
];

TeamspaceConstants.DEFAULT_TOPIC_TYPES = [
	'Clash',
	'Diff',
	'RFI',
	'Risk',
	'H&S',
	'Design',
	'Constructibility',
	'GIS',
	'For information',
	'VR',
];

module.exports = TeamspaceConstants;
