export 	const getTeamspaceProjects = (teamspaces = [], projectsMap, teamspaceName) => {
	if (!teamspaceName || !teamspaces.length) {
		return [];
	}

	const selectedTeamspace = teamspaces.find((ts) => ts.account === teamspaceName);
	const projectPlaceholder = { name: 'Select project', disabled: true };
	const teamspaceProjects = selectedTeamspace && selectedTeamspace.projects && selectedTeamspace.projects.length ?
		selectedTeamspace.projects.map((project) => projectsMap[project]) : [];
	const projects = [projectPlaceholder, ...teamspaceProjects];

	return projects.map(({ name, disabled }) =>
		({ value: name, displayName: name, disabled }));
};

export const getProjectModels = (teamspaces = [], projectsMap, modelsMap, currentTeamspace, projectName) => {
	const selectedTeamspace = teamspaces.find((ts) => ts.account === currentTeamspace);

	if (selectedTeamspace && projectName) {
		const selectedProject = selectedTeamspace.projects
			.map((project) => projectsMap[project])
			.find((p) => p.name === projectName);

		const modelPlaceholder = { name: 'Select model', disabled: true };
		const projectModels = selectedProject && selectedProject.models && selectedProject.models.length ?
			selectedProject.models.map((model) => modelsMap[model]) : [];
		const filteredModels = projectModels.filter((m) => m.model);
		const models = [modelPlaceholder, ...filteredModels];

		return models.map(({ model, name, disabled }) =>
			({ value: model || true, displayName: name, disabled }));
	}
	return [];
};
