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
import { MuiThemeProvider } from '@material-ui/core/styles';

import { theme } from '../../styles';
import { Container } from './projects.styles';
import { UserManagementTab } from '../components/userManagementTab/userManagementTab.component';
import { ProjectsPermissions } from '../projectsPermissions';
import { ModelsPermissions } from '../modelsPermissions/modelsPermissions.component';
import { PERMISSIONS_VIEWS } from '../../components/projects-permissions/js/projects-permissions.component';

interface IProps {
	projects: any[];
	users: any[];
	active?: boolean;
}

interface IState {
	currentView?: number;
	projectsPermissions: any[];
	modelsPermissions: any[];
	selectedModels: any[];
}

export class Projects extends React.PureComponent<IProps, IState> {
	public state = {
		projectsPermissions: [],
		modelsPermissions: [],
		models: [],
		selectedModels: [],
		currentView: PERMISSIONS_VIEWS.PROJECTS
	};

	public handleViewChange = () => {
		let updatedView = PERMISSIONS_VIEWS.PROJECTS;

		if (this.state.currentView === updatedView) {
			updatedView = PERMISSIONS_VIEWS.MODELS;
		}

		this.setState({currentView: updatedView});
	}

	public onPermissionsChange = () => {

	}

	public onModelSelectionChange = () => {

	}

	public getFooterLabel = (currentView) => {
		const type = currentView !== PERMISSIONS_VIEWS.MODELS ? 'project' : 'model and federation';
		return `Assign ${type} permissions`;
	}

	public render() {
		const {active} = this.props;
		const {currentView, models, modelsPermissions, projectsPermissions} = this.state;

		const footerLabel = this.getFooterLabel(currentView);
		return (
			<MuiThemeProvider theme={theme}>
				<Container>
					<UserManagementTab footerLabel={footerLabel}>
						<>
							{
								currentView !== PERMISSIONS_VIEWS.MODELS && (
									<ProjectsPermissions
										onPermissionsChange={this.onPermissionsChange}
										permissions={projectsPermissions}
									/>
								)
							}
							{
								currentView === PERMISSIONS_VIEWS.MODELS && (
									<ModelsPermissions
										onSelectionChange={this.onModelSelectionChange}
										onPermissionsChange={this.onPermissionsChange}
										models={models}
										permissions={modelsPermissions}
									/>
								)
							}
						</>
					</UserManagementTab>
				</Container>
			</MuiThemeProvider>
		);
	}
}
