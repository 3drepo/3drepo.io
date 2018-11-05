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
import * as queryString from 'query-string';
import { Link, Route } from 'react-router-dom';
import {isEqual, isEmpty} from 'lodash';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';

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
	match: any;
	location: any;
	history: any;
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

	public updateUrlParams = (params) => {
		const {location: {pathname, search}} = this.props;
		const queryParams = Object.assign({}, queryString.parse(search), params);
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
		if (this.props.onProjectChange) {
			this.props.onProjectChange(projectName);
		}
	}

	public getFooterLabel = (currentView) => {
		const type = currentView !== PERMISSIONS_VIEWS.MODELS ? 'project' : 'model and federation';
		return `Assign ${type} permissions`;
	}

	public componentDidMount() {
		const {projects, location} = this.props;
		const state = {
			projectsItems: getProjectsItems(projects)
		} as any;
		const queryParams = queryString.parse(location.search);

		const project = projects.find(({ name }) => name === queryParams.project);

		if (project) {
			state.selectedProject = queryParams.project;
			this.onProjectChange(null, queryParams.project);
		} else {
			state.selectedProject = '';
		}

		this.setState(state);
	}

	public componentDidUpdate(prevProps, prevState) {
		const changes = {} as IState;

		const projectsChanged = !isEqual(prevProps.projects, this.props.projects);
		if (projectsChanged) {
			changes.projectsItems = getProjectsItems(this.props.projects);
		}

		const selectedProjectChanged = this.state.selectedProject !== prevState.selectedProject;
		if (selectedProjectChanged && this.props.onProjectChange) {
			this.props.onProjectChange(this.state.selectedProject);
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public renderPermissionsView = () => {
		const { currentView } = this.state;

		return (
			<>
				{ currentView !== PERMISSIONS_VIEWS.MODELS && <ProjectsPermissions /> }
				{ currentView === PERMISSIONS_VIEWS.MODELS && <ModelsPermissions /> }
			</>
		);
	}

	public render() {
		const {match} = this.props;
		const {currentView, selectedProject, projectsItems} = this.state;
		const footerLabel = this.getFooterLabel(currentView);
		return (
			<Container>
				<UserManagementTab footerLabel={footerLabel}>
					<>
						<Options
							container
							direction="row"
							justify="space-between"
							alignContent="center"
						>
							<SelectContainer item>
								<FormControl fullWidth={true}>
									<InputLabel shrink htmlFor="project">
											Project
									</InputLabel>
									<CellSelect
										items={projectsItems}
										value={selectedProject}
										placeholder="Select a project"
										disabledPlaceholder={true}
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
						<Route path={match.url} render={this.renderPermissionsView}/>
					</>
				</UserManagementTab>
			</Container>
		);
	}
}
