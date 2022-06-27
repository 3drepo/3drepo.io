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
import { useRouteMatch } from 'react-router-dom';
import { discardTabComponent } from '@/v5/services/routing/routing';
import { LinkCard } from '../linkCard.component';
import { CardHeading, CardDetails } from '../linkCard.styles';
import { ProjectImage, FlexContainer } from './projectCard.styles';
import { IProject } from '@/v5/store/projects/projects.redux';

interface IProjectCard {
	variant?: 'primary' | 'secondary',
	project: IProject;
	className?: string;
}

export const ProjectCard = ({ project, ...props }: IProjectCard) => {
	let { url } = useRouteMatch();
	url = discardTabComponent(url);
	const DEFAULT_IMAGE = 'https://socialistmodernism.com/wp-content/uploads/2017/07/placeholder-image.png?w=640';

	return (
		<LinkCard {...props} to={`${url}/${project._id}`}>
			<ProjectImage src={DEFAULT_IMAGE} />
			<CardDetails>
				<FlexContainer>
					<CardHeading>{project.name}</CardHeading>
					<span>...</span>
				</FlexContainer>
			</CardDetails>
		</LinkCard>
	);
};
