/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import React from 'react';

import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import * as queryString from 'query-string';
import { Route } from 'react-router-dom';

import { CellSelect } from '../components/customTable/components/cellSelect/cellSelect.component';
import { Container } from '../components/customTable/customTable.styles';
import { UserManagementTab } from '../components/userManagementTab/userManagementTab.component';
import { ModelsPermissions } from '../modelsPermissions';
import { IconLeft, IconRight, Options, SelectContainer, SwitchButton } from './projects.styles';
import { ProjectsPermissions } from './projectsPermissions';

export const PERMISSIONS_VIEWS = {
	PROJECTS: 0,
	MODELS: 1
};

const getProjectsItems = (projects) => projects.map(({name}) => ({value: name}));

interface IProps {
	match: any;
	location: any;
	history: any;
	projects: any[];
	project: any;
	users: any[];
	selectedProject?: string;
	onProjectChange?: (project) => void;
}

interface IState {
	currentView?: number;
	projectsItems: any[];
	projectsPermissions: any[];
	modelsPermissions: any[];
	selectedModels: any[];
}

export class Projects extends React.PureComponent<IProps, IState> {
	public static getDerivedStateFromProps = (nextProps) => {
		const queryParams = queryString.parse(nextProps.location.search);
		return {
			currentView: Number(queryParams.view || PERMISSIONS_VIEWS.PROJECTS)
		};
	}

	public state = {
		projectsItems: [],
		projectsPermissions: [],
		modelsPermissions: [],
		models: [],
		selectedModels: [],
		selectedProject: '',
		currentView: PERMISSIONS_VIEWS.PROJECTS
	};

	public get isProjectViewActive() {
		return this.state.currentView !== PERMISSIONS_VIEWS.MODELS;
	}

	public updateUrlParams = (params) => {
		const {location: {pathname, search}} = this.props;
		const queryParams = { ...queryString.parse(search), ...params };
		const updatedQueryString = queryString.stringify(queryParams);
		this.props.history.push(`${pathname}?${updatedQueryString}`);
	}

	public handleViewChange = () => {
		const {currentView} = this.state;
		let updatedView = PERMISSIONS_VIEWS.PROJECTS;
		if (currentView === updatedView) {
			updatedView = PERMISSIONS_VIEWS.MODELS;
		}

		this.updateUrlParams({view: updatedView});
	}

	public onProjectChange = (event, projectName) => {
		this.updateUrlParams({project: projectName});
	}

	public getFooterLabel = () => {
		const type = this.isProjectViewActive ? 'project' : 'model and federation';
		return `Assign ${type} permissions`;
	}

	public componentDidMount() {
		this.props.onProjectChange(this.props.selectedProject);
	}

	public componentDidUpdate(prevProps) {
		const selectedProjectChanged = this.props.selectedProject !== prevProps.selectedProject;
		if (selectedProjectChanged && this.props.onProjectChange) {
			this.props.onProjectChange(this.props.selectedProject);
		}
	}

	public renderPermissionsView = () => (
		<>
			{this.isProjectViewActive && <ProjectsPermissions />}
			{!this.isProjectViewActive && <ModelsPermissions />}
		</>
	)

	public render() {
		const { match, projects, selectedProject } = this.props;
		const { currentView } = this.state;

		return (
			<UserManagementTab footerLabel={this.getFooterLabel()} >
				<Container>
					<Options
						container
						direction="row"
						justify="space-between"
						alignContent="center"
					>
						<SelectContainer item>
							<FormControl fullWidth>
								<InputLabel shrink htmlFor="project">
									Project
								</InputLabel>
								<CellSelect
									items={getProjectsItems(projects)}
									value={selectedProject}
									placeholder="Select a project"
									disabledPlaceholder
									onChange={this.onProjectChange}
									inputId="project"
								/>
							</FormControl>
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
					<Route path={match.url} render={this.renderPermissionsView} />
				</Container>
			</UserManagementTab>
		);
	}
}
