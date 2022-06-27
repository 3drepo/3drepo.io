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
import { CardHeading } from '../linkCard.styles';
import { ProjectImage, CardDetails, EllipsisMenuContainer, LinkCard } from './projectCard.styles';

interface IProjectCard {
	project: IProject;
	className?: string;
	filterQuery?: string;
}

export const ProjectCard = ({ project, filterQuery, ...props }: IProjectCard) => {
	let { url } = useRouteMatch();
	url = discardTabComponent(url);
	const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1513735539099-cf6e5d559d82?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8cGFub3JhbWF8ZW58MHx8MHx8&w=1000&q=80';

	return (
		<LinkCard {...props} to={`${url}/${project._id}`}>
			<ProjectImage src={DEFAULT_IMAGE} />
			<CardDetails>
				<CardHeading>
					<Highlight search={filterQuery}>
						{project.name}
					</Highlight>
				</CardHeading>
				<EllipsisMenuContainer  onClick={(e) => e.preventDefault()}>
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
			</CardDetails>
		</LinkCard>
	);
};
