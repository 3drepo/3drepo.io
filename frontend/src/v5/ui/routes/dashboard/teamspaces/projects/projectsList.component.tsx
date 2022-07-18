/**
 *  Copyright (C) 2022 3D Repo Ltd
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
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks/projectsSelectors.hooks';
import { ProjectCard, AddProjectCard } from '@components/shared/linkCard/projectCard';
import AddCircleIcon from '@assets/icons/add_circle.svg';
import { formatMessage } from '@/v5/services/intl';
import { IProject } from '@/v5/store/projects/projects.types';
import { ActionComponents, Container, Header, NewProjectButton, Title, ProjectCardsList, SearchInput } from './projectsList.styles';
import { CreateProjectForm } from '../../projects/projectsList/createProjectModal/createProjectModal.component';

export const ProjectsList = () => {
	const [filterQuery, setFilterQuery] = useState('');
	const [newProjectOpen, setNewProjectOpen] = useState(false);

	const projects: IProject[] = ProjectsHooksSelectors.selectCurrentProjects();

	const getFilteredProjects = () => (
		projects.filter(({ name }) => (
			name.toLowerCase().includes(filterQuery.trim().toLowerCase())
		))
	);

	return (
		<Container>
			<Header>
				<Title>
					<FormattedMessage id="projectsList.title" defaultMessage="Projects" />
				</Title>
				<ActionComponents>
					<SearchInput
						onClear={() => setFilterQuery('')}
						onChange={(event) => setFilterQuery(event.currentTarget.value)}
						value={filterQuery}
						placeholder={formatMessage({ id: 'projectsList.search.placeholder', defaultMessage: 'Search projects...' })}
					/>
					<NewProjectButton
						startIcon={<AddCircleIcon />}
						onClick={() => setNewProjectOpen(true)}
					>
						<FormattedMessage id="projectsList.newProject.button" defaultMessage="New project" />
					</NewProjectButton>
				</ActionComponents>
			</Header>
			<ProjectCardsList>
				{getFilteredProjects().map((project) => (
					<ProjectCard
						filterQuery={filterQuery}
						key={project._id}
						project={project}
					/>
				))}
				<AddProjectCard onClick={() => setNewProjectOpen(true)}/>
			</ProjectCardsList>
			<CreateProjectForm
				open={newProjectOpen}
				onClickClose={() => setNewProjectOpen(false)}
			/>
		</Container>
	);
};
