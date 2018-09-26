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
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import { theme } from '../../styles';
import { UserManagementTab } from '../components/userManagementTab/userManagementTab.component';
import { ProjectsPermissions } from '../projectsPermissions';
import { ModelsPermissions } from '../modelsPermissions/modelsPermissions.component';
import { Container, Options, SelectContainer } from './projects.styles';
import { CellSelect } from '../components/customTable/components/cellSelect/cellSelect.component';

export const PERMISSIONS_VIEWS = {
	PROJECTS: 0,
	MODELS: 1
};

interface IProps {
	projects: any[];
	users: any[];
	onProjectChange?: (project) => void;
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
/* 		if (selectedModels.length) {
			const requiredModels = selectedModels.map(({ model }) => model);
			this.ModelsService
				.getMulitpleModelsPermissions(this.currentTeamspace.account, requiredModels)
				.then(({ data: modelsWithPermissions }) => {
					this.selectedModels = modelsWithPermissions;
					const permissionsToShow = this.selectedModels.length === 1 ? this.selectedModels[0].permissions : [];

					this.assignedModelPermissions = this.getExtendedModelPermissions(permissionsToShow);
				});
		} else {
			this.selectedModels = [];
			this.assignedModelPermissions = this.getExtendedModelPermissions();
		} */
	}

	public onProjectChange = (project) => {
		if (this.props.onProjectChange) {
			this.props.onProjectChange(project);
		}
	}

	public getFooterLabel = (currentView) => {
		const type = currentView !== PERMISSIONS_VIEWS.MODELS ? 'project' : 'model and federation';
		return `Assign ${type} permissions`;
	}

	public render() {
		const {projects} = this.props;
		const {currentView, models, modelsPermissions, projectsPermissions} = this.state;

		const footerLabel = this.getFooterLabel(currentView);
		return (
			<MuiThemeProvider theme={theme}>
				<Container>
					<Options
						container
						direction="row"
						justify="space-between"
						alignContent="center"
					>
						<SelectContainer item>
							<CellSelect
								items={projects}
								placeholder="Project"
								onChange={this.onProjectChange}
							/>
						</SelectContainer>
						<Grid item>
							<Button
								color="secondary"
								onClick={this.handleViewChange}
							>
								{currentView !== PERMISSIONS_VIEWS.MODELS ? 'Model & federation permissions' : 'Project permissions'}
							</Button>
						</Grid>
					</Options>
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
