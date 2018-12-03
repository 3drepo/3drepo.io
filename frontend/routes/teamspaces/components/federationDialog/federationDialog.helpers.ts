export const getAvailableModels = (project) =>
	project.models.filter((model) => !model.federate).map(({ name }) => ({ name }));

export const getFederatedModels = (project, name) =>
	project.models.find((model) => model.name === name).subModels.map((subModel) => {
		return { name: subModel.name };
	});

export const getModelsMap = (project) => {
	const availableModels = project.models.filter((model) => !model.federate).map((model, index) => {
		return { ...model, index };
	});

	return availableModels.reduce(
		(models, model) => ({
			...models, [model.name]: { id: model.model, index: model.index }
	}), {});
};

export const getProject = (projectItems, projectName) => projectItems.find((project) => project.value === projectName);

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
