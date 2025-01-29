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

const RolesConstants = {};

// --- LICENSING ROLES --- TO BE DELETED

RolesConstants.ROLES_COL = 'system.roles';
RolesConstants.DEFAULT = 'user';
RolesConstants.TEAM_MEMBER = 'team_member';

// --- JOBS RENAMED TO ROLES --- TO BE KEPT

RolesConstants.DEFAULT_OWNER_ROLE = 'Admin';

RolesConstants.DEFAULT_ROLES = [
	{ name: 'Admin', color: '#75140C' },
	{ name: 'Architect', color: '#D32C1F' },
	{ name: 'Asset Manager', color: '#B160E4' },
	{ name: 'Client', color: '#7356F6' },
	{ name: 'Main Contractor', color: '#0099FF' },
	{ name: 'MEP Engineer', color: '#65C978' },
	{ name: 'Project Manager', color: '#A87F3D' },
	{ name: 'Quantity Surveyor', color: '#EF7F31' },
	{ name: 'Structural Engineer', color: '#B6BCC1' },
	{ name: 'Supplier', color: '#697683' },
];

module.exports = RolesConstants;
