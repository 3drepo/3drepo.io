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

import { useRouteMatch } from 'react-router-dom';
import { IProject } from '@/v5/store/projects/projects.redux';
import { discardTabComponent } from '@/v5/services/routing/routing';
import { formatMessage } from '@/v5/services/intl';
import { EllipsisMenu } from '@controls/ellipsisMenu/ellipsisMenu.component';
import { EllipsisMenuItem } from '@controls/ellipsisMenu/ellipsisMenuItem/ellipsisMenutItem.component';
import { Highlight } from '@controls/highlight';
import { ProjectImage, EllipsisMenuContainer, LinkCard } from './projectCard.styles';

interface IProjectCard {
	project: IProject;
	className?: string;
	filterQuery?: string;
}

export const ProjectCard = ({ project, filterQuery, ...props }: IProjectCard) => {
	const DEFAULT_IMAGE = 'assets/images/project_placeholder.png';

	let { url } = useRouteMatch();
	url = discardTabComponent(url);

	const preventNavigation = (e) => e.preventDefault();

	return (
		<LinkCard
			{...props}
			to={`${url}/${project._id}`}
			heading={<Highlight search={filterQuery}>{project.name}</Highlight>}
		>
			<ProjectImage src={DEFAULT_IMAGE} />
			<EllipsisMenuContainer onClick={preventNavigation}>
				<EllipsisMenu>
					<EllipsisMenuItem
						title={formatMessage({
							id: 'projectCard.ellipsisMenu.share',
							defaultMessage: 'Share',
						})}
					/>
					<EllipsisMenuItem
						title={formatMessage({
							id: 'projectCard.ellipsisMenu.delete',
							defaultMessage: 'Delete Project',
						})}
					/>
				</EllipsisMenu>
			</EllipsisMenuContainer>
		</LinkCard>
	);
};
