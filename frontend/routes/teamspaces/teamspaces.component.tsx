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
import SimpleBar from 'simplebar-react';
import * as queryString from 'query-string';
import { isEmpty, isEqual } from 'lodash';
import Add from '@material-ui/icons/Add';
import MenuItem from '@material-ui/core/MenuItem';

import { ButtonMenu } from '../components/buttonMenu/buttonMenu.component';
import { Loader } from '../components/loader/loader.component';
import { Panel } from '../components/panel/panel.component';
import ModelItem from './components/modelItem/modelItem.container';
import { Head, List, LoaderContainer, MenuButton } from './teamspaces.styles';
import { getAngularService, runAngularTimeout } from '../../helpers/migration';
import { ProjectDialog } from './components/projectDialog/projectDialog.component';
import UploadModelFileDialog from './components/uploadModelFileDialog/uploadModelFileDialog.container';
import RevisionsDialog from './components/revisionsDialog/revisionsDialog.container';
import { ModelDialog } from './components/modelDialog/modelDialog.component';
import FederationDialog from './components/federationDialog/federationDialog.container';
import { TeamspaceItem } from './components/teamspaceItem/teamspaceItem.component';
import { ProjectItem } from './components/projectItem/projectItem.component';
import { ModelDirectoryItem } from './components/modelDirectoryItem/modelDirectoryItem.component';
import { MODEL_TYPE, FEDERATION_TYPE } from './teamspaces.contants';
import { PERMISSIONS_VIEWS } from '../projects/projects.component';

const PANEL_PROPS = {
	title: 'Teamspaces',
	paperProps: {
		height: '100%'
	}
};

const getTeamspacesItems = (teamspaces) => teamspaces.map(({ account, projects }) => ({ value: account, projects }));

interface IProps {
	match: any;
	history: any;
	location: any;
	currentTeamspace: string;
	teamspaces: any[];
	isPending: boolean;
	showDialog: (config) => void;
	showConfirmDialog: (config) => void;

	fetchTeamspaces: (username) => void;

	createProject: (teamspace, projectData) => void;
	updateProject: (teamspace, projectName, projectData) => void;
	removeProject: (teamspace, projectName) => void;

	createModel: (teamspace, modelData) => void;
	updateModel: (teamspace, modelName, modelData) => void;
	removeModel: (teamspace, modelData) => void;
	downloadModel: (teamspace, modelId) => void;

	onModelUpload: () => void;
	onSettingsClick: () => void;
	onDeleteClick: () => void;
	onEditClick: () => void;
	onRevisionsClick: () => void;
	onDownloadClick: () => void;
	onUploadClick: () => void;
}

interface IState {
	activeTeamspace: string;
	teamspacesItems: any[];
}

export class Teamspaces extends React.PureComponent<IProps, IState> {
	public static defaultProps = {
		teamspaces: []
	};

	public state = {
		activeTeamspace: '',
		teamspacesItems: []
	};

	public componentDidMount() {
		if (this.props.teamspaces.length === 0 ) {
			this.props.fetchTeamspaces(this.props.currentTeamspace);
		}

		const { teamspace } = queryString.parse(this.props.location.search);
		const lastTeamspace = localStorage.getItem('lastTeamspace');

		this.setState({
			activeTeamspace: lastTeamspace || teamspace || this.props.currentTeamspace,
			teamspacesItems: getTeamspacesItems(this.props.teamspaces)
		});
	}

	public componentDidUpdate(prevProps) {
		const changes = {} as IState;

		const currentTeamspaceChanged = this.props.currentTeamspace !== prevProps.currentTeamspace;
		if (currentTeamspaceChanged) {
			changes.activeTeamspace = this.props.currentTeamspace;
		}

		const teamspacesChanged = !isEqual(this.props.teamspaces, prevProps.teamspaces);

		if (teamspacesChanged) {
			changes.teamspacesItems = getTeamspacesItems(this.props.teamspaces);
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public componentWillUnmount() {
		if (!this.props.history.location.pathname.startsWith('/viewer')) {
			localStorage.removeItem('lastTeamspace');
			localStorage.removeItem('lastProject');
		}
	}

	public getTeamspaceProjects = (teamspaceName) => {
		const teamspace = this.props.teamspaces.find((teamspaceItem) => teamspaceItem.account === teamspaceName);
		return teamspace.projects.map(({ name, models }) => ({ value: name, models }));
	}

	public createRouteHandler = (pathname, params = {}) => (event) => {
		event.stopPropagation();

		this.props.history.push({ pathname, search: `?${queryString.stringify(params)}` });
	}

	public onTeamspaceClick = (teamspace) => {
		this.setState({ activeTeamspace: teamspace.account });
	}

	/**
	 * Dialog handlers
	 */
	public openProjectDialog = (teamspaceName = '', projectName = '') => (event) => {
		event.stopPropagation();
		const { teamspacesItems } = this.state as IState;

		const isNewProject = !projectName.length;
		this.props.showDialog({
			title: projectName ? 'Edit project' : 'New project',
			template: ProjectDialog,
			data: {
				name: projectName,
				teamspace: teamspaceName,
				teamspaces: teamspacesItems
			},
			onConfirm: ({ teamspace, ...projectData }) => {
				if (isNewProject) {
					this.props.createProject(teamspace, projectData);
				} else {
					this.props.updateProject(teamspace, projectName, projectData);
				}
			}
		});
	}

	public createRemoveProjectHandler = (projectName) => (event) => {
		event.stopPropagation();
		this.props.showConfirmDialog({
			title: 'Delete project',
			content: `
				Do you really want to delete project <b>${projectName}</b>? <br /><br />
				This will remove the project from your teamspace,
				deleting all the models inside of it!
			`,
			onConfirm: () => {
				this.props.removeProject(this.state.activeTeamspace, projectName);
			}
		});
	}

	public createRemoveModelHandler = (modelName, modelId, projectName, type) => (event) => {
		event.stopPropagation();

		this.props.showConfirmDialog({
			title: `Delete ${type}`,
			content: `
				Do you really want to delete ${type} <b>${modelName}</b>? <br /><br />
				Your data will be lost permanently and will not be recoverable.
			`,
			onConfirm: () => {
				this.props.removeModel(this.state.activeTeamspace, {
					id: modelId, name: modelName, project: projectName
				});
			}
		});
	}

	public openModelDialog =
		(teamspaceName = '', projectName = '', modelName = '', modelId = '') => (event) => {
		event.stopPropagation();
		const { teamspacesItems } = this.state as IState;
		const teamspaces = teamspacesItems.filter((teamspace) => teamspace.projects.length);

		this.props.showDialog({
			title: 'New model',
			template: ModelDialog,
			data: {
				modelName,
				teamspace: teamspaceName,
				teamspaces,
				project: projectName,
				projects: teamspaceName ? this.getTeamspaceProjects(teamspaceName) : [],
				modelId
			},
			onConfirm: ({ teamspace, ...modelData }) => {
				this.props.createModel(teamspace, modelData);
			}
		});
	}

	public openFederationDialog =
		(teamspaceName = '', projectName = '', modelName = '', modelId = '') => (event) => {
			event.stopPropagation();
			const { teamspacesItems } = this.state as IState;
			const isNewModel = !modelName.length;
			const teamspaces = teamspacesItems.filter((teamspace) => teamspace.projects.length);

			this.props.showDialog({
				title: modelName ? 'Edit federation' : 'New federation',
				template: FederationDialog,
				data: {name: modelName,
				modelName,
				teamspace: teamspaceName,
				teamspaces,
				project:  projectName ,
				projects: teamspaceName ? this.getTeamspaceProjects(teamspaceName) : [],

				editMode: !!modelName,
				modelId
			},
			onConfirm: ({ teamspace, ...modelData }) => {
				if (isNewModel) {
					this.props.createModel(teamspace, modelData);
				} else {
					this.props.updateModel(teamspace, modelId, modelData);
				}
			}
		});
	}

	public openUploadModelFileDialog = (teamspaceName = '', modelProps) => (event) => {
		event.stopPropagation();

		this.props.showDialog({
			title: `Upload Model`,
			template: UploadModelFileDialog,
			data: {
				teamspaceName,
				modelName: modelProps.name,
				modelId: modelProps.model,
				canUpload: modelProps.canUpload,
				projectName: modelProps.projectName
			}
		});
	}

	public openModelRevisionsDialog = (props) => (event) => {
		event.stopPropagation();

		this.props.showDialog({
			title: `${props.name} - Revisions`,
			template: RevisionsDialog,
			data: {
				teamspace: this.state.activeTeamspace,
				modelId: props.model
			}
		});
	}

	public createModelItemClickHandler = (props) => (event) => {
		const { activeTeamspace } = this.state;
		if (props.timestamp) {
			event.persist();
			runAngularTimeout(() => {
				this.createRouteHandler(`/viewer/${activeTeamspace}/${props.model}`)(event);
			});

			localStorage.setItem('lastProject', props.projectName);
			localStorage.setItem('lastTeamspace', activeTeamspace);
			const analyticService = getAngularService('AnalyticService') as any;
			analyticService.sendEvent({ eventCategory: 'Model', eventAction: 'view' });
		} else {
			this.openUploadModelFileDialog(activeTeamspace, props)(event);
		}
	}

	public createDownloadModelHandler = (activeTeamspace, modelId) => () => {
		this.props.downloadModel(activeTeamspace, modelId);
	}

	/**
	 * Render methods
	 */
	public renderModel = (props) => {
		const type = props.federate ? FEDERATION_TYPE : MODEL_TYPE;
		const { activeTeamspace } = this.state;
		const { match } = this.props;

		return (
			<ModelItem
				{...props}
				key={props.model}
				activeTeamspace={activeTeamspace}
				actions={[]}
				onModelItemClick={this.createModelItemClickHandler(props)}
				onPermissionsClick={ this.createRouteHandler(`/dashboard/user-management/${activeTeamspace}/projects`, {
					project: props.projectName,
					view: PERMISSIONS_VIEWS.MODELS,
					modelId: props.model
				})}
				onSettingsClick={this.createRouteHandler(`${match.url}/${activeTeamspace}/models/${props.model}`, {
					project: props.projectName
				})}
				onDeleteClick={this.createRemoveModelHandler(props.name, props.model, props.projectName, type)}
				onDownloadClick={this.createDownloadModelHandler(this.state.activeTeamspace, props.model)}
				onRevisionsClick={this.openModelRevisionsDialog(props)}
				onModelUpload={this.openUploadModelFileDialog(this.state.activeTeamspace, props)}
				onEditClick={this.openFederationDialog(this.state.activeTeamspace, props.projectName, props.name, props.model)}
			/>
		);
	}

	public createModelDirectoryAddHandler = (props) => {
		return props.type === FEDERATION_TYPE
			? this.openFederationDialog(this.state.activeTeamspace, props.projectName)
			: this.openModelDialog(this.state.activeTeamspace, props.projectName);
	}

	public renderModelDirectoryItem = (projectName) =>
		(modelProps) => this.renderModel({ ...modelProps, projectName })

	public renderModelDirectory = (permissions, props) => (
		<ModelDirectoryItem
			{...props}
			permissions={permissions}
			renderChildItem={this.renderModelDirectoryItem(props.projectName)}
			onAddClick={this.createModelDirectoryAddHandler(props)}
		/>
	)

	public isActiveProject = (projectName) => {
		const queryParams = queryString.parse(this.props.location.search);
		const { project } = queryParams;
		const lastProject = localStorage.getItem('lastProject');

		if (project) {
			return projectName === project;
		} else if (lastProject) {
			return projectName === lastProject;
		}
		return false;
	}

	public isActiveTeamspace = (account) => {
		const { teamspace } = this.props.match.params;

		if (teamspace) {
			return account === teamspace;
		}

		return account === this.state.activeTeamspace;
	}

	public renderProject = (props) => {
		const { activeTeamspace } = this.state;

		return (
			<ProjectItem
				{...props}
				renderChildItem={this.renderModelDirectory.bind(this, props.permissions)}
				onEditClick={this.openProjectDialog(activeTeamspace, props.name)}
				onPermissionsClick={
					this.createRouteHandler(`/dashboard/user-management/${activeTeamspace}/projects`, {
						project: props.name
					})}
				onRemoveClick={this.createRemoveProjectHandler(props.name)}
				active={this.isActiveProject(props.name)}
			/>
		);
	}

	public renderTeamspaces = (teamspaces) => teamspaces.map((teamspace, index) => (
		<TeamspaceItem
			{...teamspace}
			key={index}
			active={this.isActiveTeamspace(teamspace.account)}
			isMyTeamspace={index === 0}
			renderChildItem={this.renderProject}
			onToggle={this.onTeamspaceClick.bind(this, teamspace)}
			onAddProject={this.openProjectDialog(teamspace.account)}
		/>
	))

	public renderMenuButton = (isPending, props) => (
		<MenuButton
			buttonRef={props.buttonRef}
			variant="fab"
			color="secondary"
			aria-label="Toggle menu"
			aria-haspopup="true"
			mini={true}
			onClick={props.onClick}
			disabled={isPending}
		>
			<Add />
		</MenuButton>
	)

	public renderMenu = ({ close }) => {
		const createMenuClickHandler = (onClick, onClose) => (event) => {
			onClick(event);
			onClose(event);
		};
		return (
			<>
				<MenuItem onClick={createMenuClickHandler(this.openProjectDialog(), close)}>
					Add project
				</MenuItem>
				<MenuItem onClick={createMenuClickHandler(this.openModelDialog(), close)}>
					Add model
				</MenuItem>
				<MenuItem onClick={createMenuClickHandler(this.openFederationDialog(), close)}>
					Add federation
				</MenuItem>
			</>
		);
	}

	public render() {
		const { isPending } = this.props;

		return (
			<Panel {...PANEL_PROPS}>
				<Head>
					3D MODELS & FEDERATIONS
					<ButtonMenu
						renderButton={this.renderMenuButton.bind(this, isPending)}
						renderContent={this.renderMenu}
						PopoverProps={ {
							anchorOrigin: {
								vertical: 'center',
								horizontal: 'left'
							},
							transformOrigin: {
								vertical: 'top',
								horizontal: 'right'
							}
						} }
					/>
				</Head>
				<List>
					{
						isPending ? (
							<LoaderContainer>
								<Loader content="Loading teamspaces..." />
							</LoaderContainer>
						) : (
							<SimpleBar>
								{this.renderTeamspaces(this.props.teamspaces)}
							</SimpleBar>
						)
					}
				</List>
			</Panel>
		);
	}
}
