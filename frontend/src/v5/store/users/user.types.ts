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

export const JOBS_LIST = [
	{ titleLong: 'Admin', titleShort: 'Ad' },
	{ titleLong: 'Client', titleShort: 'Cl' },
	{ titleLong: 'Architect', titleShort: 'Ar' },
	{ titleLong: 'Structural Engineer', titleShort: 'SE' },
	{ titleLong: 'MEP Engineer', titleShort: 'ME' },
	{ titleLong: 'Project Manager', titleShort: 'PM' },
	{ titleLong: 'Quantity Surveyor', titleShort: 'QS' },
	{ titleLong: 'Asset Manager', titleShort: 'AM' },
	{ titleLong: 'Main Contractor', titleShort: 'MC' },
	{ titleLong: 'Supplier', titleShort: 'Su' },
] as const;

export type Job = typeof JOBS_LIST[number]['titleLong'];
