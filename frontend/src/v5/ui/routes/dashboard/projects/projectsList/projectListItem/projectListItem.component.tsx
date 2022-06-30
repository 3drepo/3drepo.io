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
import { useDispatch } from 'react-redux';
import { discardSlash } from '@/v5/services/routing/routing';
import { DialogsActions } from '@/v5/store/dialogs/dialogs.redux';
import { FormattedMessage } from 'react-intl';
import { IProject } from '@/v5/store/projects/projects.redux';
import { Button } from '@controls/button';
import { formatMessage } from '@/v5/services/intl';

type ProjectListItemProps = {
	project: IProject,
};

export const ProjectListItem = ({ project }: ProjectListItemProps): JSX.Element => {
	let { url } = useRouteMatch();
	url = discardSlash(url);
	const dispatch = useDispatch();

	const onClickDelete = (e) => {
		e.preventDefault();
		dispatch(DialogsActions.open('delete', {
			title: formatMessage(
				{ id: 'deleteModal.project.title', defaultMessage: 'Delete {name}?' },
				{ name: project.name },
			),
			// eslint-disable-next-line no-console
			onClickConfirm: () => console.log('Deleting project'),
			message: formatMessage({
				id: 'deleteModal.project.message',
				defaultMessage: 'By deleting this Project your data will be lost permanently and will not be recoverable.',
			}),
		}));
	};

	return (
		<DashboardListItem>
			<Link to={`${url}/${project._id}`}>
				<DashboardListItemRow>
					<DashboardListItemText>
						{project.name}
						<Button onClick={onClickDelete}>
							<FormattedMessage id="deleteProject.button" defaultMessage="Delete Project" />
						</Button>
					</DashboardListItemText>
				</DashboardListItemRow>
			</Link>
		</DashboardListItem>
	);
};
