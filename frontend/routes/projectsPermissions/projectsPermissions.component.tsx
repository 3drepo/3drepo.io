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

import * as React from 'react';

import { theme } from '../../styles';
import { PROJECT_ROLES_LIST } from '../../constants/project-permissions';
import { CELL_TYPES } from '../components/customTable/customTable.component';
import { PermissionsTable } from '../components/permissionsTable/permissionsTable.component';
import { TextOverlay } from '../components/textOverlay/textOverlay.component';
import { Container } from './projectsPermissions.styles';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { isEqual } from 'lodash';

interface IProps {
	permissions: any[];
	onPermissionsChange: (permissions) => void;
}

export class ProjectsPermissions extends React.PureComponent<IProps, any> {
	public static getDerivedStateFromProps(nextProps) {
		return {
			currentUser: (nextProps.permissions || []).find(({isCurrentUser}) => isCurrentUser)
		};
	}

	public hasDisabledPermissions = (row) => {
		const {currentUser} = this.state;
		const passBaseValidation = row.disabled || row.isOwner || row.isAdmin || row.isCurrentUser;

		if (passBaseValidation) {
			return true;
		}

		if (!passBaseValidation && row.isProjectAdmin) {
			return !(currentUser.isAdmin || currentUser.isOwner || currentUser.isProjectAdmin);
		}

		return false;
	}

	public handleSelectionChange = (selectedUsers) => {
		this.setState({selectedUsers});
	}

	public render() {
		const {permissions} = this.props;

		return (
			<MuiThemeProvider theme={theme}>
				<Container>
					<PermissionsTable
						permissions={permissions}
						roles={PROJECT_ROLES_LIST}
						onSelectionChange={this.handleSelectionChange}
						onPermissionsChange={this.props.onPermissionsChange}
						rowStateInterceptor={this.hasDisabledPermissions}
					/>
					{!permissions ?
						<TextOverlay content="Select a project to view the users' permissions" /> :
						null
					}
				</Container>
			</MuiThemeProvider>
		);
	}
}
