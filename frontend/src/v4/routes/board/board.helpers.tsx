/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import { formatMessage } from '@/v5/services/intl';
import { groupBy } from 'lodash';

import { getModelType, ModelType } from '@/v5/store/projects/projects.helpers';
import IssueDetails from '../viewerGui/components/issues/components/issueDetails/issueDetails.container';
import { ListNavigation } from '../viewerGui/components/listNavigation/listNavigation.component';
import RiskDetails from '../viewerGui/components/risks/components/riskDetails/riskDetails.container';
import { BoardDialogTitle, FormWrapper, Title } from './board.styles';

export const getTeamspaceProjects = (teamspaces = [], projectsMap, teamspaceName) => {
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
		const filteredModels = projectModels
			.filter((m) => m.model)
			.filter((m) => getModelType(m) !== ModelType.DRAWING);
		const { federations, models } = groupBy(filteredModels, ({ federate }) => (federate ? 'federations' : 'models'));

		const list = [];

		if (federations) {
			const { label, items } = getItemsGroup(
				formatMessage({ defaultMessage: 'Federations', id: 'board.group.federations'}),
				federations,
			);
			list.push(label, ...items);
		}

		if (models) {
			const { label, items } = getItemsGroup(
				formatMessage({ defaultMessage: 'Containers', id: 'board.group.containers'}),
				models,
			);
			list.push(label, ...items);
		}

		return list;
	}
	return [];
};

export const getTemplateComponent = (isIssuesBoard) => isIssuesBoard ? IssueDetails : RiskDetails;

export const getDialogTitle = ({ cardId, isIssuesBoard, cards, onNavigationChange }) => {
	const titlePrefix = cardId ? 'Edit' : 'Add new';
	const dataType = isIssuesBoard ? 'issue' : 'risk';
	const initialIndex = cards.findIndex((card) => card.id === cardId);
	const itemsCount = cards.length;

	return cardId ? (
		<BoardDialogTitle>
			<Title>{titlePrefix} {dataType}</Title>
			<ListNavigation
				initialIndex={initialIndex}
				itemsCount={itemsCount}
				onChange={onNavigationChange}
			/>
		</BoardDialogTitle>
	) : `${titlePrefix} ${dataType}`;
};

export const getDialogSize = (cardId) => cardId ? 'lg' : 'sm';

export const getDialogForm = (size, TemplateComponent) => (formProps: any) => (
	<FormWrapper size={size}>
		<TemplateComponent {...formProps} disableViewer />
	</FormWrapper>
);
