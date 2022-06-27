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
import { FormattedMessage } from 'react-intl';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks/projectsSelectors.hooks';
import { IProject } from '@/v5/store/projects/projects.redux';
import { ProjectCard, AddProjectCard } from '@components/shared/linkCard/projectCard';
import { ActionComponents, Container, Header, NewProjectButton, Title, ProjectCardsList } from './projectsList.styles';


export const ProjectsList = (): JSX.Element => {
	const projects: IProject[] = ProjectsHooksSelectors.selectCurrentProjects();

	return (
		<Container>
			<Header>
				<Title>
					<FormattedMessage id="projectsList.title" defaultMessage="Projects" />
				</Title>
				<ActionComponents>
					<div>Search Bar</div>
					<NewProjectButton>
						<FormattedMessage id="projectsList.newProject.button" defaultMessage="New project" />
					</NewProjectButton>
				</ActionComponents>
			</Header>
			<ProjectCardsList>
				{[...projects, ...projects, ...projects, ...projects, ...projects, ...projects, ...projects].map((project) => (
					<ProjectCard
						key={project._id}
						project={project}
					/>
				))}
				<AddProjectCard />
			</ProjectCardsList>
		</Container>
	);
};
