/**
 *  Copyright (C) 2019 3D Repo Ltd
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
import { values } from 'lodash';
import memoizeOne from 'memoize-one';

const negatePositionYZ = (position = []) => {
	const [x, y, z] = position.map(Number);
	return [x, -z, -y];
};

export const convertPositionToOpenGL = negatePositionYZ;

export const convertPositionToDirectX = negatePositionYZ;

export const getTeamspacesList = memoizeOne((teamspaces) => {
	return values(teamspaces).map(({ account }) => ({ value: account }));
});

export const getTeamspaceProjects = memoizeOne((teamspaceName, teamspaces, projects) => {
	const selectedTeamspace = teamspaces[teamspaceName];

	if (!selectedTeamspace) {
		return [];
	}

	return selectedTeamspace.projects.map((projectId) => ({
		name: projects[projectId].name,
		value: projects[projectId]._id,
		models: projects[projectId].models
	}));
});

export const getModelCodeFieldErrorMsg = (error) => error ? 'Can only contain alphanumeric characters' : '';
