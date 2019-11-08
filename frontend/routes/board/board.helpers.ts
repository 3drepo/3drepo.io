export 	const getTeamspaceProjects = (teamspaces = [], projectsMap, teamspaceName) => {
	if (!teamspaceName || !teamspaces.length) {
		return [];
	}

	const selectedTeamspace = teamspaces.find((ts) => ts.account === teamspaceName);
	const teamspaceProjects = selectedTeamspace && selectedTeamspace.projects && selectedTeamspace.projects.length ?
		selectedTeamspace.projects.map((project) => projectsMap[project]) : [];

	return teamspaceProjects.map(({ name, disabled }) =>
		({ value: name, name, disabled }));
};

export const getProjectModels = (teamspaces = [], projectsMap, modelsMap, currentTeamspace, projectName) => {
	const selectedTeamspace = teamspaces.find((ts) => ts.account === currentTeamspace);

	if (selectedTeamspace) {
		const selectedProject = selectedTeamspace.projects
			.map((project) => projectsMap[project])
			.find((p) => p.name === projectName);

		const projectModels = selectedProject && selectedProject.models && selectedProject.models.length ?
			selectedProject.models.map((model) => modelsMap[model]) : [];
		const filteredModels = projectModels.filter((m) => m.model);

		return filteredModels.map(({ model, name, disabled }) =>
			({ value: model || true, name, disabled }));
	}
	return [];
};
