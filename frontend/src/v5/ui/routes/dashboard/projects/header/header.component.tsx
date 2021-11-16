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

import React from 'react';
import { useParams } from 'react-router-dom';

import { Typography } from '@controls/typography';
import { IProject } from '@/v5/store/projects/projects.redux';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks/projectsSelectors.hooks';
import { TopNavigation } from '@components/shared/topNavigation';
import { Container, Wrapper } from './header.styles';

export const Header = (): JSX.Element => {
	const { project } = useParams();
	const projects: IProject[] = ProjectsHooksSelectors.selectCurrentProjects();
	const currentProject = projects.find(({ _id }) => project === _id);

	return (
		<Wrapper>
			<Container>
				<Typography variant="h1">{currentProject ? currentProject.name : 'Loading project'}</Typography>
				<TopNavigation />
			</Container>
		</Wrapper>
	);
};
