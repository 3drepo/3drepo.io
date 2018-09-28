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
import {isEqual, isEmpty} from 'lodash';
import { MuiThemeProvider } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import { theme } from '../../styles';
import { UserManagementTab } from '../components/userManagementTab/userManagementTab.component';
import { ProjectsPermissions } from '../projectsPermissions';
import { ModelsPermissions } from '../modelsPermissions';
import { Container, Options, SelectContainer, SwitchButton, IconLeft, IconRight } from './projects.styles';
import { CellSelect } from '../components/customTable/components/cellSelect/cellSelect.component';

export const PERMISSIONS_VIEWS = {
	PROJECTS: 0,
	MODELS: 1
};

const getProjectsItems = (projects) => projects.map(({name}) => ({value: name}));

interface IProps {
	projects: any[];
	currentProject: any;
	users: any[];
	onProjectChange?: (project) => void;
}

interface IState {
	currentView?: number;
	projectsItems: any[];
	projectsPermissions: any[];
	modelsPermissions: any[];
	selectedModels: any[];
	selectedProject: string;
}

export class Projects extends React.PureComponent<IProps, IState> {
	public state = {
		projectsItems: [],
		projectsPermissions: [],
		modelsPermissions: [],
		models: [],
		selectedModels: [],
		selectedProject: '',
		currentView: PERMISSIONS_VIEWS.PROJECTS
	};

	public handleViewChange = () => {
		let updatedView = PERMISSIONS_VIEWS.PROJECTS;

		if (this.state.currentView === updatedView) {
			updatedView = PERMISSIONS_VIEWS.MODELS;
		}

		this.setState({currentView: updatedView});
	}

	public onProjectChange = (projectName) => {
		if (this.props.onProjectChange) {
			this.setState({selectedProject: projectName});
			this.props.onProjectChange(projectName);
		}
	}

	public getFooterLabel = (currentView) => {
		const type = currentView !== PERMISSIONS_VIEWS.MODELS ? 'project' : 'model and federation';
		return `Assign ${type} permissions`;
	}

	public componentDidMount() {
		this.setState({
			projectsItems: getProjectsItems(this.props.projects)
		});
	}

	public componentDidUpdate(prevProps) {
		const changes = {} as IState;

		const projectsChanged = !isEqual(prevProps.projects, this.props.projects);
		if (projectsChanged) {
			changes.projectsItems = getProjectsItems(this.props.projects);
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public render() {
		const {currentProject} = this.props;
		const {currentView, models, modelsPermissions, projectsPermissions, selectedProject, projectsItems} = this.state;

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
								items={projectsItems}
								value={selectedProject}
								placeholder="Project"
								onChange={this.onProjectChange}
							/>
						</SelectContainer>
						<Grid item>
							<SwitchButton
								color="secondary"
								onClick={this.handleViewChange}
							>
								{currentView === PERMISSIONS_VIEWS.MODELS && <IconLeft>keyboard_arrow_left</IconLeft>}
								{currentView !== PERMISSIONS_VIEWS.MODELS ? 'Model & federation permissions' : 'Project permissions'}
								{currentView !== PERMISSIONS_VIEWS.MODELS && <IconRight>keyboard_arrow_right</IconRight>}
							</SwitchButton>
						</Grid>
					</Options>
					<UserManagementTab footerLabel={footerLabel}>
						<>
							{currentView !== PERMISSIONS_VIEWS.MODELS && <ProjectsPermissions />}
							{currentView === PERMISSIONS_VIEWS.MODELS && <ModelsPermissions />}
						</>
					</UserManagementTab>
				</Container>
			</MuiThemeProvider>
		);
	}
}
