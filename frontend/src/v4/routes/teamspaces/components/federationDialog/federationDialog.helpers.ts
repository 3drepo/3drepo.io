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

import { keyBy } from 'lodash';

export const getAvailableModels = (project, models) => {
	return project.models.reduce((availableModels, modelId, index) => {
		if (models[modelId] && !models[modelId].federate) {
			availableModels.push({ ...models[modelId], index });
		}

		return availableModels;
	}, []);
};

export const getFederatedModels = (project, name, models) => {
	const federation = project.models.find((modelId) => models[modelId].name === name);

	if (!federation) {
		return [];
	}

	return models[federation].subModels.map((subModel) => ({ name: subModel.name }));
};

export const getModelsMap = (models) => keyBy(models, 'name');

export const getProject = (projects, projectId) => projects[projectId];

export const getNewSelectedModels = (selectedModels, name) => {
	const selectedIndex = selectedModels.indexOf(name);
	let newSelected = [];

	if (selectedIndex === -1) {
		newSelected = newSelected.concat(selectedModels, name);
	} else if (selectedIndex === 0) {
		newSelected = newSelected.concat(selectedModels.slice(1));
	} else if (selectedIndex === selectedModels.length - 1) {
		newSelected = newSelected.concat(selectedModels.slice(0, -1));
	} else if (selectedIndex > 0) {
		newSelected = newSelected.concat(
			selectedModels.slice(0, selectedIndex),
			selectedModels.slice(selectedIndex + 1)
		);
	}

	return newSelected;
};
