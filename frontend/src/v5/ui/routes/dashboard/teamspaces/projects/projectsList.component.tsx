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
import { FormattedMessage } from 'react-intl';
import { ProjectsHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { ProjectCard } from '@components/shared/linkCard/projectCard/projectCard.component';
import AddCircleIcon from '@assets/icons/filled/add_circle-filled.svg';
import { formatMessage } from '@/v5/services/intl';
import { IProject } from '@/v5/store/projects/projects.types';
import { SearchContext, SearchContextComponent, SearchContextType } from '@controls/search/searchContext';
import { DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { ActionComponents, Header, NewProjectButton, Title, ProjectCardsList, SearchInput } from './projectsList.styles';
import { CreateProjectModal } from '../../projects/projectsList/createProjectModal/createProjectModal.component';

export const ProjectsList = () => {
	const projects: IProject[] = ProjectsHooksSelectors.selectCurrentProjects();
	const openNewProjectModal = () => DialogsActionsDispatchers.open(CreateProjectModal);
	const isAdmin = TeamspacesHooksSelectors.selectIsTeamspaceAdmin();

	return (
		<SearchContextComponent items={projects} fieldsToFilter={['name']}>
			<Header>
				<Title>
					<FormattedMessage id="projectsList.title" defaultMessage="Projects" />
				</Title>
				<ActionComponents>
					<SearchInput
						placeholder={formatMessage({ id: 'projectsList.search.placeholder', defaultMessage: 'Search projects...' })}
					/>
					{isAdmin && (
						<NewProjectButton startIcon={<AddCircleIcon />} onClick={openNewProjectModal}>
							<FormattedMessage id="projectsList.newProject.button" defaultMessage="New project" />
						</NewProjectButton>
					)}
				</ActionComponents>
			</Header>
			<ProjectCardsList>
				<SearchContext.Consumer>
					{ ({ query, filteredItems }: SearchContextType<IProject>) => (
						<>
							{filteredItems.map((project) => (
								<ProjectCard
									filterQuery={query}
									key={project._id}
									project={project}
								/>
							))}
						</>
					)}
				</SearchContext.Consumer>
			</ProjectCardsList>
		</SearchContextComponent>
	);
};
