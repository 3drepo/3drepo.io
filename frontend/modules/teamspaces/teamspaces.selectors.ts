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

import { orderBy, pick, pickBy, values } from 'lodash';
import { createSelector } from 'reselect';
import { LIST_ITEMS_TYPES } from '../../routes/teamspaces/teamspaces.contants';
import { selectStarredModels } from '../starred';
import { getStarredModelKey } from '../starred/starred.contants';
import { extendTeamspacesInfo } from './teamspaces.helpers';

export const selectTeamspacesDomain = (state) => ({ ...state.teamspaces });

export const selectTeamspaces = createSelector(
	selectTeamspacesDomain, (state) => state.teamspaces
);

export const selectTeamspacesList = createSelector(
	selectTeamspaces, (teamspaces) => values(teamspaces)
);

export const selectProjects = createSelector(
	selectTeamspacesDomain, (state) => state.projects
);

export const selectProjectsList = createSelector(
	selectProjects, (projects) => Object.values(projects)
);

const selectTeamspaceName = (state, ownProps) => ownProps.teamspace;

export const selectProjectsByTeamspace = createSelector(
	selectTeamspaces, selectProjects, selectTeamspaceName,
	(teamspaces, projects, teamspace) => {
		if (!teamspaces[teamspace]) {
			return {};
		}
		return pick(projects, teamspaces[teamspace].projects);
	}
);

export const selectModels = createSelector(
	selectTeamspacesDomain, (state) => state.models
);

export const selectFederations = createSelector(
	selectModels, (models) => pickBy(models, (federate) => !!federate)
);

export const selectComponentState = createSelector(
	selectTeamspacesDomain, (state) => state.componentState
);

export const selectVisibleItems = createSelector(
	selectComponentState, (state) => state.visibleItems
);

export const selectShowStarredOnly = createSelector(
	selectComponentState, (state) => state.showStarredOnly
);

export const selectFlattenTeamspaces = createSelector(
	selectTeamspacesList, selectProjects, selectModels, selectShowStarredOnly, selectStarredModels,
	(teamspacesList, projects, models, showStarredOnly, starredModels) => {
		const flattenList = [];

		for (let index = 0; index < teamspacesList.length; index++) {
			const teamspaceName = teamspacesList[index].account;
			const projectsIds = teamspacesList[index].projects;
			const teamspaceProjects = [];

			for (let j = 0; j < projectsIds.length; j++) {
				const project = projects[projectsIds[j]];

				const projectModels = [];
				for (let m = 0; m < project.models.length; m++) {
					const modelId = project.models[m];
					const recordKey = getStarredModelKey({ teamspace: teamspaceName, model: modelId });
					if (showStarredOnly && !starredModels[recordKey]) {
						continue;
					}
					projectModels.push({
						...models[modelId],
						teamspace: teamspaceName,
						project: projectsIds[j],
						projectName: project.name,
						type: LIST_ITEMS_TYPES.MODEL,
						id: modelId
					});
				}

				if (!showStarredOnly || projectModels.length) {
					teamspaceProjects.push({
						...project,
						models: projectModels,
						teamspace: teamspaceName,
						type: LIST_ITEMS_TYPES.PROJECT,
						id: projectsIds[j]
					});
				}
			}

			if (!showStarredOnly || teamspaceProjects.length) {
				flattenList.push({
					...teamspacesList[index],
					type: LIST_ITEMS_TYPES.TEAMSPACE,
					id: teamspacesList[index].account
				}, ...orderBy(teamspaceProjects, ['name']);
			}
		}
		return flattenList;
	}
);

export const selectTeamspacesWithAdminAccess = createSelector(
	selectTeamspacesList, selectProjects, extendTeamspacesInfo
);

export const selectIsPending = createSelector(
	selectTeamspacesDomain, (state) => state.isPending
);
