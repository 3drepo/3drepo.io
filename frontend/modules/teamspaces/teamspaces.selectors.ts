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

import { compact, map, orderBy, pick, pickBy, uniq, values } from 'lodash';
import { createSelector } from 'reselect';
import { SORT_ORDER_TYPES } from '../../constants/sorting';
import { searchByFilters } from '../../helpers/searching';
import { DATA_TYPES } from '../../routes/components/filterPanel/filterPanel.component';
import {
	LIST_ITEMS_TYPES, SORTING_BY_LAST_UPDATED, SORTING_BY_NAME,
} from '../../routes/teamspaces/teamspaces.contants';
import { selectStarredModels } from '../starred';
import { getStarredModelKey } from '../starred/starred.contants';
import { sortModels } from './teamspaces.helpers';

export const selectTeamspacesDomain = (state) => ({ ...state.teamspaces });

export const selectTeamspaces = createSelector(
	selectTeamspacesDomain, (state) => state.teamspaces
);

export const selectTeamspaceDetails = (teamspace) => createSelector(
		selectTeamspaces, (teamspaces) => {
			if (teamspaces && teamspaces[teamspace]) {
				return teamspaces[teamspace];
			}
			return {};
		}
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

export const selectModelCodes = createSelector(
	selectModels, (models) => compact(uniq(map(values(models), 'code')))
);

export const selectModelTypes = createSelector(
	selectModels, (models) => compact(uniq(map(values(models), 'modelType')))
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

export const selectSearchEnabled = createSelector(
	selectComponentState, (state) => state.searchEnabled
);

export const selectSelectedFilters = createSelector(
	selectComponentState, (state) => state.selectedFilters
);

export const selectSelectedDataTypes = createSelector(
	selectComponentState, (state) => state.selectedDataTypes
);

export const selectStarredVisibleItems = createSelector(
	selectComponentState, (state) => state.starredVisibleItems
);

export const selectActiveSorting = createSelector(
	selectComponentState, (state) => state.activeSorting
);

export const selectNameSortingDescending = createSelector(
	selectComponentState, (state) => state.nameSortingDescending
);

export const selectDateSortingDescending = createSelector(
	selectComponentState, (state) => state.dateSortingDescending
);

export const selectActiveSortingDirection = createSelector(
	selectNameSortingDescending, selectDateSortingDescending,
	(nameSortingDescending, dateSortingDescending) => {
		const sortingDirection = {
			[SORTING_BY_NAME]: nameSortingDescending ? SORT_ORDER_TYPES.DESCENDING : SORT_ORDER_TYPES.ASCENDING,
			[SORTING_BY_LAST_UPDATED]: dateSortingDescending ? SORT_ORDER_TYPES.DESCENDING : SORT_ORDER_TYPES.ASCENDING
		};
		return sortingDirection;
	}
);

export const selectFlattenTeamspaces = createSelector(
	selectTeamspacesList, selectProjects, selectModels,
	selectShowStarredOnly, selectStarredModels,
	selectSelectedFilters, selectSelectedDataTypes,
	selectActiveSorting, selectActiveSortingDirection,
	(teamspacesList, projects, models, showStarredOnly, starredModels,
		filters, filterableDataTypes, activeSorting, activeSortingDirection) => {

		const flattenList = [];
		const hasActiveFilters = showStarredOnly || filters.length;
		const shouldFilterProjects = filterableDataTypes.includes(DATA_TYPES.PROJECTS);
		const shouldFilterModels = filterableDataTypes.includes(DATA_TYPES.MODELS);
		const shouldFilterFederations = filterableDataTypes.includes(DATA_TYPES.FEDERATIONS);

		for (let index = 0; index < teamspacesList.length; index++) {
			const teamspaceName = teamspacesList[index].account;
			const projectsIds = teamspacesList[index].projects;
			const teamspaceProjects = [];

			for (let j = 0; j < projectsIds.length; j++) {
				const project = projects[projectsIds[j]];
				const projectModels = [];
				const projectFederations = [];

				for (let m = 0; m < project.models.length; m++) {
					const modelId = project.models[m];
					const recordKey = getStarredModelKey({ teamspace: teamspaceName, model: modelId });
					if (showStarredOnly && !starredModels[recordKey]) {
						continue;
					}

					const processedModel = {
						...models[modelId],
						teamspace: teamspaceName,
						project: projectsIds[j],
						projectName: project.name,
						modelType: models[modelId].type,
						type: LIST_ITEMS_TYPES.MODEL,
						id: modelId
					};

					if (processedModel.federate) {
						projectFederations.push(processedModel);
					} else {
						projectModels.push(processedModel);
					}
				}

				const filteredModels = shouldFilterModels ? searchByFilters(projectModels, filters) : projectModels;
				const filteredFederations = shouldFilterFederations
					? searchByFilters(projectFederations, filters)
					: projectFederations;

				const filteredModelsAndFederations = filteredFederations.concat(filteredModels);

				const modelsAndFederations =
					shouldFilterModels && shouldFilterFederations ?
						filteredModelsAndFederations :
						shouldFilterModels ? filteredModels :
						shouldFilterFederations ? filteredFederations :
						[];

				const projectMatched =
					shouldFilterProjects && filters.find((f) => project.name.toLowerCase().includes(f.value.value.toLowerCase()));

				const processedProject = {
					...project,
					models: modelsAndFederations,
					teamspace: teamspaceName,
					type: LIST_ITEMS_TYPES.PROJECT,
					id: projectsIds[j]
				};

				// Show all models if no result (but project is collapsed)
				const shouldFilterOnlyProjects = !shouldFilterModels && !shouldFilterFederations && shouldFilterProjects;
				const shouldFilterOnlyModelsAndFederations =
					(shouldFilterModels || shouldFilterFederations) && !shouldFilterProjects;

				const shouldBeVisible =
					shouldFilterProjects ? searchByFilters([processedProject], filters)[0] : !shouldFilterOnlyModelsAndFederations;

				processedProject.collapsed = shouldFilterOnlyProjects ? shouldBeVisible : false;

				if ((!showStarredOnly && !filteredModelsAndFederations.length && project.models.length && shouldBeVisible)) {
					processedProject.collapsed = true;

					if (shouldFilterFederations) {
						processedProject.models = processedProject.models.concat(projectFederations);
					}

					if (shouldFilterModels) {
						processedProject.models = processedProject.models.concat(projectModels);
					}
				}

				const isFilterSelected = shouldFilterProjects || shouldFilterModels || shouldFilterFederations;

				const shouldAddProject =
					!hasActiveFilters || (processedProject.models.length || shouldBeVisible) || processedProject.collapsed &&
					((showStarredOnly && shouldBeVisible) || !showStarredOnly);

				if (isFilterSelected && shouldAddProject) {
					processedProject.models = sortModels(processedProject.models, activeSorting, activeSortingDirection);
					teamspaceProjects.push(processedProject);
				}

				if (
					processedProject.type === 'PROJECT' && processedProject.collapsed && shouldFilterProjects ||
					(projectMatched && shouldFilterProjects)
					) {
					let allProjectModels = [];

					if (shouldFilterModels && !shouldFilterFederations) {
						allProjectModels = projectModels;
					} else if (!shouldFilterModels && shouldFilterFederations) {
						allProjectModels = projectFederations;
					} else {
						allProjectModels = [...projectModels, ...projectFederations];
					}
					processedProject.models = allProjectModels;
				}
			}

			const emptyProjects = teamspaceProjects.filter((item) => !item.models.length).length;
			const hasOnlyEmptyProjects = showStarredOnly && emptyProjects === teamspaceProjects.length;

			if ((!hasActiveFilters || teamspaceProjects.length) && !hasOnlyEmptyProjects ) {
				flattenList.push({
					...teamspacesList[index],
					type: LIST_ITEMS_TYPES.TEAMSPACE,
					id: teamspacesList[index].account
				}, ...orderBy(teamspaceProjects, ['name']));
			}
		}
		return flattenList;
	}
);

export const selectIsPending = createSelector(
	selectTeamspacesDomain, (state) => state.isPending
);
