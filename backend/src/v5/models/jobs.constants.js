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

const JobsConstants = {};

JobsConstants.DEFAULT_OWNER_JOB = 'Admin';

JobsConstants.DEFAULT_JOBS = [
	{ _id: 'Admin', color: '#f7f7b2' },
	{ _id: 'Client', color: '#a6cee3' },
	{ _id: 'Architect', color: '#213f99' },
	{ _id: 'Structural Engineer', color: '#33a02c' },
	{ _id: 'MEP Engineer', color: '#fb9a99' },
	{ _id: 'Project Manager', color: '#e31a1c' },
	{ _id: 'Quantity Surveyor', color: '#ff7f00' },
	{ _id: 'Asset Manager', color: '#ffff99' },
	{ _id: 'Main Contractor', color: '#b15928' },
	{ _id: 'Supplier', color: '#6a3d9a' },
];

module.exports = JobsConstants;
