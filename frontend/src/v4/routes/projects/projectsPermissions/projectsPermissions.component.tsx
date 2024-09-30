/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import { PureComponent } from 'react';

import { PROJECT_ROLES_LIST } from '../../../constants/project-permissions';
import { PermissionsTable } from '../../components/permissionsTable/permissionsTable.component';
import { TextOverlay } from '../../components/textOverlay/textOverlay.component';
import { Container } from './projectsPermissions.styles';

interface IProps {
	projectName: string;
	permissions: any[];
	onPermissionsChange: (project, permissionType, permissionCount?) => void;
	className?: string;
}

interface IState {
	selectedUsers: any[];
	filteredUsers: any[];
}

export class ProjectsPermissions extends PureComponent<IProps, IState> {
	public state = {
		selectedUsers: [],
		filteredUsers: []
	};

	public hasDisabledPermissions = (row) => {
		const passBaseValidation = row.disabled || row.isOwner || row.isAdmin || row.isCurrentUser;

		if (passBaseValidation) {
			return true;
		}

		// if (!passBaseValidation && row.isProjectAdmin) {
		// 	return !(currentUser.isAdmin || currentUser.isOwner || currentUser.isProjectAdmin);
		// }

		return false;
	}

	public handleSelectionChange = (selectedUsers) => {
		this.setState({
			...this.state,
			selectedUsers
		});
	}

	public handleFilterChange = (filteredUsers) => {
		this.setState({
			...this.state,
			filteredUsers
		});
	}

	public handlePermissionsChange = (permissions, permissionType, permissionCount?) => {
		if (this.props.onPermissionsChange) {
			const permissionsToSave = this.props.permissions.reduce((updatedUserPermissions, currentPermissions) => {
				const filteredUsernames = this.state.filteredUsers.map(({ user }) => user);
				if (filteredUsernames.length && !filteredUsernames.includes(currentPermissions.user)) {
					// search is active, but the current permission is
					// not included in the search results
					return updatedUserPermissions;
				}

				if (!currentPermissions.isAdmin) {
					const updatedPermissions = permissions.find((userPermissions) => {
						return userPermissions.user === currentPermissions.user;
					});
					const permissionsKey = updatedPermissions && updatedPermissions.key;

					if (updatedPermissions) {
						updatedUserPermissions.push({
							user: currentPermissions.user,
							permissions: permissionsKey ? [permissionsKey] : []
						});
					}
				}

				return updatedUserPermissions;
			}, []);

			this.props.onPermissionsChange(permissionsToSave, permissionType, permissionCount);
		}
	}

	public render() {
		const { permissions } = this.props;

		return (
			<Container className={this.props.className}>
				<PermissionsTable
					permissions={permissions}
					roles={PROJECT_ROLES_LIST}
					onSelectionChange={this.handleSelectionChange}
					onFilterChange={this.handleFilterChange}
					onPermissionsChange={this.handlePermissionsChange}
					rowStateInterceptor={this.hasDisabledPermissions}
				/>
				{ !permissions.length ?
					<TextOverlay content="Select a project to view the users' permissions" /> :
					null
				}
			</Container>
		);
	}
}
