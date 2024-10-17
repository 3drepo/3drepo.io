/**
 *  Copyright (C) 2019 3D Repo Ltd
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

import Button from '@mui/material/Button';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import { get } from 'lodash';
import { RouteComponentProps } from 'react-router';
import { renderWhenTrue } from '../../../helpers/rendering';
import { EmptyStateInfo } from '../components.styles';
import { SmallIconButton } from '../smallIconButon/smallIconButton.component';
import { Actions, CancelButton, Container, Footer, Invitation, List } from './invitationsDialog.styles';

interface IProps extends RouteComponentProps<any> {
	className?: string;
	invitations: any[];
	projects: any[];
	onInvitationOpen: (email, job, isAdmin, permissions) => void;
	removeInvitation: (email) => void;
	handleClose: () => void;
}

const getPermissions = (savedPermissions) => {
	return savedPermissions.map(({ project, models, project_admin }) => ({
		project,
		models: project_admin ? [] : models.map(({ model, permission: key}) => ({ model, key })),
		isAdmin: project_admin
	}));
};

export const InvitationsDialog = (props: IProps) => {
	const handleInvitationClick = (invitation) => () => {
		const isAdmin = get(invitation, 'permissions.teamspace_admin', false);
		const projects = !invitation.permissions || isAdmin
			? []
			: getPermissions(invitation.permissions.projects);

		props.onInvitationOpen(
			invitation.email,
			invitation.job,
			isAdmin,
			projects
		);
	};

	const handleInvitationRemove = ({ email }) => () => props.removeInvitation(email);

	const renderNoInvitationsInfo = renderWhenTrue(() => (
		<EmptyStateInfo>
			No invitations
		</EmptyStateInfo>
	));

	const renderInvitationsList = renderWhenTrue(() => (
		<List>
			{props.invitations.map((invitation) => (
				<Invitation key={invitation.email}>
					{invitation.email}
					<Actions>
						<SmallIconButton
							Icon={Edit}
							onClick={handleInvitationClick(invitation)}
						/>
						<SmallIconButton
							Icon={Delete}
							onClick={handleInvitationRemove(invitation)}
						/>
					</Actions>
				</Invitation>
			))}
		</List>
	));

	return (
		<Container className={props.className}>
			{renderInvitationsList(!!props.invitations.length)}
			{renderNoInvitationsInfo(!props.invitations.length)}
			<Footer>
				<CancelButton
					type="button"
					color="primary"
					variant="text"
					onClick={props.handleClose}
				>
					Cancel
				</CancelButton>
				<Button
					type="button"
					variant="contained"
					color="secondary"
					onClick={handleInvitationClick({})}
				>
					Add
				</Button>
			</Footer>
		</Container>
	);
};
