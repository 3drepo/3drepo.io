/**
 *  Copyright (C) 2025 3D Repo Ltd
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

const FronteggConstants = {};

// https://developers.frontegg.com/guides/troubleshoot/errors/error-codes
FronteggConstants.errCodes = {
	USER_NOT_FOUND: 'ER-01089',
};

FronteggConstants.HEADER_USER_ID = 'frontegg-user-id';
FronteggConstants.META_LABEL_TEAMSPACE = '3DR_Teamspace';
FronteggConstants.HEADER_TENANT_ID = 'frontegg-tenant-id';

module.exports = FronteggConstants;
