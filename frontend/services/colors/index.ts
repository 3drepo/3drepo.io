/**
 *  Copyright (C) 2017 3D Repo Ltd
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

const COLORS = {
	WHITE: '#ffffff'
};

const jobs = {
	'Structural Engineer': '#33a02c',
	'Client' : '#a6cee3',
	'Asset Manager' : '#ffff99',
	'Project Manager' : '#e31a1c',
	'Architect' : '#213f99',
	'Quantity Surveyor' : '#ff7f00',
	'Supplier' : '#6a3d9a',
	'MEP Engineer' : '#fb9a99',
	'Main Contractor' : '#b15928'
};

const statusesIconColors = {
	none: '#777',
	low: '#4CAF50',
	medium: '#FF9800',
	high: '#F44336'
};

const statusesIconsNames = {
	'open': 'panorama_fish_eye',
	'in progress': 'lens',
	'for approval': 'adjust',
	'closed': 'check_circle'
};

export const getJobColor = (id) => {
	if (jobs[id]) {
		return jobs[id];
	}
	return COLORS.WHITE;
};

export const getStatusIcon = (priority, status) => {
	const statusIcon = {
		color: COLORS.WHITE,
		name: 'lens'
	};

	if (statusesIconsNames[status]) {
		statusIcon.name = statusesIconsNames[status];
	}

	if (statusesIconColors[priority]) {
		statusIcon.color = statusesIconColors[priority];
	}

	return statusIcon;
};
