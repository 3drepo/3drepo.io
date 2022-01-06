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

const permConst = {};

permConst.SYSTEM_ADMIN = 'system_admin';
permConst.LICENSE_ADMIN = 'license_admin';
permConst.SUPPORT_ADMIN = 'support_admin';
permConst.SYSTEM_ADMIN_WRITE = 'systemroles_write';
permConst.SYSTEM_ADMIN_READ = 'systemroles_read';
permConst.LICENSE_ADMIN_WRITE = 'license_write';
permConst.LICENSE_ADMIN_READ = 'license_read';
permConst.SYSTEM_ROLES = [permConst.SYSTEM_ADMIN, permConst.LICENSE_ADMIN, permConst.SUPPORT_ADMIN];
permConst.SYSTEM_ADMIN_ROLES = [permConst.SYSTEM_ADMIN_WRITE, permConst.SYSTEM_ADMIN_READ];
permConst.LICENSE_ADMIN_ROLES = [permConst.LICENSE_ADMIN_WRITE, permConst.LICENSE_ADMIN_READ];
permConst.SUPPORT_ADMIN_ROLES = [permConst.SYSTEM_ADMIN_READ, permConst.LICENSE_ADMIN_READ];
permConst.ALL_SYSTEM_ADMIN_ROLES = [...new Set([...permConst.SYSTEM_ADMIN_ROLES,
	...permConst.LICENSE_ADMIN_ROLES,
	...permConst.SUPPORT_ADMIN_ROLES])];

permConst.TEAMSPACE_ADMIN = 'teamspace_admin';
permConst.PROJECT_ADMIN = 'admin_project';
permConst.MODEL_COLLABORATOR = 'collaborator';
permConst.MODEL_COMMENTER = 'commenter';
permConst.MODEL_VIEWER = 'viewer';

permConst.MODEL_WRITE_ROLES = [permConst.MODEL_COLLABORATOR];
permConst.MODEL_COMMENT_ROLES = [permConst.MODEL_COLLABORATOR, permConst.MODEL_COMMENTER];
permConst.MODEL_READ_ROLES = [permConst.MODEL_COLLABORATOR, permConst.MODEL_COMMENTER, permConst.MODEL_VIEWER];

module.exports = permConst;
