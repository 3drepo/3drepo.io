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

import { useParams } from 'react-router-dom';
import { projectRoute, projectTabRoute } from '@/v5/services/routing/routing';
import { formatMessage } from '@/v5/services/intl';
import { EllipsisMenuItem } from '@controls/ellipsisMenu/ellipsisMenuItem/ellipsisMenutItem.component';
import { Highlight } from '@controls/highlight';
import { TeamspaceParams } from '@/v5/ui/routes/routes.constants';
import { DialogsActionsDispatchers, ProjectsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { IProject } from '@/v5/store/projects/projects.types';
import { prefixBaseDomain } from '@/v5/helpers/url.helper';
import { TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { EllipsisMenuContainer, EllipsisMenu } from './projectCard.styles';
import { LinkCard } from '../linkCard.component';

interface IProjectCard {
	project: IProject;
	className?: string;
	filterQuery?: string;
}

export const ProjectCard = ({ project, filterQuery, ...props }: IProjectCard) => {
	const DEFAULT_IMAGE = 'assets/images/project_placeholder.png';
	const { teamspace } = useParams<TeamspaceParams>();
	const to = projectRoute(teamspace, project);

	const { isAdmin: isProjectAdmin } = project;
	const isTeamspaceAdmin = TeamspacesHooksSelectors.selectIsTeamspaceAdmin();

	const preventNavigation = (e) => e.preventDefault();

	const onClickDelete = () => {
		DialogsActionsDispatchers.open('delete', {
			name: project.name,
			onClickConfirm: () => new Promise<void>(
				(accept, reject) => {
					ProjectsActionsDispatchers.deleteProject(
						teamspace,
						project._id,
						accept,
						reject,
					);
				},
			),
			message: formatMessage({
				id: 'deleteModal.project.message',
				defaultMessage: 'By deleting this Project your data will be lost permanently and will not be recoverable.',
			}),
			confidenceCheck: true,
		});
	};

	const onClickShare = () => {
		const link = prefixBaseDomain(projectRoute(teamspace, project));
		const subject = formatMessage({ id: 'shareModal.project.subject', defaultMessage: 'project' });
		const title = formatMessage({ id: 'shareModal.project.title', defaultMessage: 'Share Project' });

		DialogsActionsDispatchers.open('share', {
			name: project.name,
			subject,
			title,
			link,
		});
	};

	return (
		<LinkCard
			{...props}
			to={to}
			heading={<Highlight search={[filterQuery]}>{project.name}</Highlight>}
			imgSrc={DEFAULT_IMAGE}
		>
			<EllipsisMenuContainer onClick={preventNavigation}>
				<EllipsisMenu>
					<EllipsisMenuItem
						title={formatMessage({
							id: 'projectCard.ellipsisMenu.share',
							defaultMessage: 'Share',
						})}
						onClick={onClickShare}
					/>
					<EllipsisMenuItem
						title={formatMessage({
							id: 'projectCard.ellipsisMenu.delete',
							defaultMessage: 'Delete Project',
						})}
						onClick={onClickDelete}
						hidden={!isTeamspaceAdmin}
					/>
					<EllipsisMenuItem
						title={formatMessage({
							id: 'projectCard.ellipsisMenu.settings',
							defaultMessage: 'Settings',
						})}
						to={projectTabRoute(teamspace, project, 'project_settings')}
						hidden={!isProjectAdmin}
					/>
				</EllipsisMenu>
			</EllipsisMenuContainer>
		</LinkCard>
	);
};
