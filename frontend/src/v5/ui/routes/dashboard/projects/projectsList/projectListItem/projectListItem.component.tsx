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
import { Link, useRouteMatch } from 'react-router-dom';
import { DashboardListItem } from '@components/dashboard/dashboardList';
import {
	DashboardListItemRow,
	DashboardListItemText,
} from '@components/dashboard/dashboardList/dashboardListItem/components';
import {
	ShareModalProject as ShareModal,
} from '@components/dashboard/dashboardList/dashboardListItem/shareModal/shareModalProject/shareModalProject.component';
import { useState } from 'react';
import { discardSlash } from '@/v5/services/routing/routing';
import { formatMessage } from '@/v5/services/intl';
import { IProject } from '@/v5/store/projects/projects.types';
import { Button } from '@controls/button';
import { FormattedMessage } from 'react-intl';

type ProjectListItemProps = {
	project: IProject,
};

export const ProjectListItem = ({ project }: ProjectListItemProps): JSX.Element => {
	let { url } = useRouteMatch();
	url = discardSlash(url);

	const [openModal, setOpenModal] = useState(false);

	const openShareModal = (e) => {
		e.preventDefault();
		setOpenModal(true);
	};

	return (
		<DashboardListItem>
			<Link to={`${url}/${project._id}`}>
				<DashboardListItemRow>
					<DashboardListItemText>
						{project.name}
						<Button onClick={openShareModal}>
							<FormattedMessage id="shareProject.button" defaultMessage="Share Project" />
						</Button>
					</DashboardListItemText>
				</DashboardListItemRow>
			</Link>
			<ShareModal
				openState={openModal}
				onClickClose={() => setOpenModal(false)}
				title={formatMessage({
					id: 'shareProject.title',
					defaultMessage: 'Share Project',
				})}
				project={project}
			/>
		</DashboardListItem>
	);
};
