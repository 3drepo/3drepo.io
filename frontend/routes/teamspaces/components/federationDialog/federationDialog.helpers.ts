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
