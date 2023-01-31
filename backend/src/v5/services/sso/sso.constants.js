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

const SsoConstants = {};

SsoConstants.providers = {
	AAD: 'aad',
};

SsoConstants.errorCodes = {
	EMAIL_EXISTS: 1,
	EMAIL_EXISTS_WITH_SSO: 2,
	NON_SSO_USER: 3,
	USER_NOT_FOUND: 4,
	UNKNOWN: 5,
};

module.exports = SsoConstants;
