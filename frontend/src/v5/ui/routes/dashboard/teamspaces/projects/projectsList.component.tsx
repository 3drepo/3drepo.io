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
import { Container } from './projectsList.styles'

export const ProjectList = (): JSX.Element => {
	const projects: IProject[] = ProjectsHooksSelectors.selectCurrentProjects();

	return (
		<Container>
			{projects.map((project) => (
				// <ProjectListItem
				// 	key={project._id}
				// 	projectId={project._id}
				// 	name={project.name}
				// />
				<div>Project: {name}</div>
			))}
			<div>
				<FormattedMessage id="projectList.NewProject" defaultMessage="add new project" />
			</div>
		</Container>
	);
};
