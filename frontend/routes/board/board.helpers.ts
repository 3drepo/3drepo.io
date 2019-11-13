import { groupBy } from 'lodash';

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

const getItemsGroup = (groupName, items = []) => {
	return {
		label: { name: groupName, disabled: true, group: true },
		items: items.map(({ model, name, disabled }) => ({ value: model || true, name, disabled }))
	};
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
		const { federations, models } = groupBy(filteredModels, ({ federate }) => (federate ? 'federations' : 'models'));

		const list = [];

		if (federations) {
			const { label, items } = getItemsGroup('Federations', federations);
			list.push(label, ...items);
		}

		if (models) {
			const { label, items } = getItemsGroup('Models', models);
			list.push(label, ...items);
		}

		return list;
	}
	return [];
};
