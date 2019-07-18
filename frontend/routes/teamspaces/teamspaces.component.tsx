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

import { isEmpty, matches, cond, stubTrue } from 'lodash';
import * as queryString from 'query-string';
import React from 'react';
import SimpleBar from 'simplebar-react';
import { analyticsService, EVENT_ACTIONS, EVENT_CATEGORIES } from '../../services/analytics';

import MenuItem from '@material-ui/core/MenuItem';
import Add from '@material-ui/icons/Add';

import { ButtonMenu } from '../components/buttonMenu/buttonMenu.component';
import { Loader } from '../components/loader/loader.component';
import { Panel } from '../components/panel/panel.component';
import { renderWhenTrue } from '../../helpers/rendering';
import { PERMISSIONS_VIEWS } from '../projects/projects.component';
import FederationDialog from './components/federationDialog/federationDialog.container';
import { ModelDialog } from './components/modelDialog/modelDialog.component';
import { ModelDirectoryItem } from './components/modelDirectoryItem/modelDirectoryItem.component';
import ModelItem from './components/modelItem/modelItem.container';
import ProjectDialog from './components/projectDialog/projectDialog.container';
import ProjectItem from './components/projectItem/projectItem.container';
import RevisionsDialog from './components/revisionsDialog/revisionsDialog.container';
import TeamspaceItem from './components/teamspaceItem/teamspaceItem.container';
import UploadModelFileDialog from './components/uploadModelFileDialog/uploadModelFileDialog.container';
import { FEDERATION_TYPE, MODEL_TYPE, LIST_ITEMS_TYPES } from './teamspaces.contants';
import { Head, List, LoaderContainer, MenuButton } from './teamspaces.styles';

const PANEL_PROPS = {
	title: 'Teamspaces',
	paperProps: {
		height: '100%'
	}
};

interface IProps {
	match: any;
	history: any;
	location: any;
	currentTeamspace: string;
	items: any[];
	isPending: boolean;
	activeTeamspace: string;
	activeProject: string;
	showDialog: (config) => void;
	showConfirmDialog: (config) => void;

	fetchTeamspaces: (username) => void;

	createProject: (teamspace, projectData) => void;
	updateProject: (teamspace, projectName, projectData) => void;
	removeProject: (teamspace, projectName) => void;

	createModel: (teamspace, modelData) => void;

	onModelUpload: () => void;
	onSettingsClick: () => void;
	onDeleteClick: () => void;
	onEditClick: () => void;
	onRevisionsClick: () => void;
	onDownloadClick: () => void;
	onUploadClick: () => void;
	setState: (componentState: any) => void;
}

interface IState {
	activeTeamspace: string;
	activeProject: string;
	teamspacesItems: any[];
	visibileItems: any;
}

export class Teamspaces extends React.PureComponent<IProps, IState> {
	public static defaultProps = {
		teamspaces: []
	};

	public state = {
		activeTeamspace: '',
		activeProject: '',
		teamspacesItems: [],
		visibileItems: {}
	};

	public get activeTeamspace() {
		return this.props.match.params.teamspace || this.state.activeTeamspace;
	}

	public componentDidMount() {
		if (this.props.items.length === 0 ) {
			this.props.fetchTeamspaces(this.props.currentTeamspace);
		}

		const activeTeamspace = this.props.activeTeamspace || this.props.currentTeamspace;
		const activeProject = this.props.activeProject;
		const visibileItems = {};

		if (activeTeamspace) {
			visibileItems[activeTeamspace] = true;
		}

		if (activeProject) {
			visibileItems[activeProject] = true;
		}

		this.setState({ activeTeamspace, activeProject, visibileItems}, () => {
			this.onTeamspaceClick({
				name: this.state.activeTeamspace,
				projects: [this.props.activeProject]
			});
		});
	}

	public componentDidUpdate(prevProps) {
		const changes = {} as IState;

		const currentTeamspaceChanged = this.props.currentTeamspace !== prevProps.currentTeamspace;
		if (currentTeamspaceChanged) {
			changes.activeTeamspace = this.props.currentTeamspace;
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public componentWillUnmount() {
		this.props.setState({
			activeTeamspace: this.state.activeTeamspace,
			activeProject: this.state.activeProject
		});
	}

	public onTeamspaceClick = ({ name, projects }) => {
		this.setState((prevState) => {
			const visibileItems = { ...prevState.visibileItems };

			[...projects, name].forEach((id) => {
				visibileItems[id] = !visibileItems[id];
			});

			return {
				activeTeamspace: name,
				visibileItems
			};
		});
	}

	public openProjectDialog = (event, teamspaceName = '', projectId?, projectName = '') => {
		event.stopPropagation();

		this.props.showDialog({
			title: 'New project',
			template: ProjectDialog,
			data: {
				id: projectId,
				name: projectName,
				teamspace: teamspaceName,
			},
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

/* 	public openUploadModelFileDialog = (teamspaceName = '', modelProps) => (event) => {
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
	}*/

	private renderModel = (props) => (
		<ModelItem
			{...props}
			key={props.model}
			activeTeamspace={this.activeTeamspace}
			actions={[]}
			//onModelUpload={this.openUploadModelFileDialog(this.state.activeTeamspace, props)}
			//onEditClick={this.openFederationDialog(this.state.activeTeamspace, props.projectName, props.name, props.model)}
		/>
	)

	private renderProject = (props) => (
		<ProjectItem
			{...props}
			teamspace={this.activeTeamspace}
			key={props._id}
			onEditClick={this.openProjectDialog}
			active={props.name === this.props.activeProject}
			disabled={!props.models.length}
			onRootClick={this.handleProjectClick}
		/>
	)

	public handleProjectClick = ({ name, models }) => {
		this.setState((prevState) => {
			const visibileItems = { ...prevState.visibileItems };

			models.forEach((id) => {
				visibileItems[id] = !visibileItems[id];
			});

			return {
				activeProject: name,
				visibileItems
			};
		});
	}

	private renderTeamspace = (teamspace, index) => (
		<TeamspaceItem
			{...teamspace}
			key={index}
			active={teamspace.account === this.activeTeamspace}
			isMyTeamspace={index === 0}
			onToggle={this.onTeamspaceClick}
			onAddProject={this.openProjectDialog}
		/>
	)

	private renderMenuButton = (isPending, props) => (
		<MenuButton
			buttonRef={props.buttonRef}
			variant="fab"
			color="secondary"
			aria-label="Toggle menu"
			aria-haspopup="true"
			mini
			onClick={props.onClick}
			disabled={isPending}
		>
			<Add />
		</MenuButton>
	)

	private renderMenu = ({ close }) => {
		const createMenuClickHandler = (onClick, onClose) => (event) => {
			onClick(event);
			onClose(event);
		};
		return (
			<>
				<MenuItem onClick={createMenuClickHandler(this.openProjectDialog, close)}>
					Add project
				</MenuItem>
				<MenuItem onClick={createMenuClickHandler(this.openModelDialog, close)}>
					Add model
				</MenuItem>
				<MenuItem onClick={createMenuClickHandler(this.openFederationDialog, close)}>
					Add federation
				</MenuItem>
			</>
		);
	}

	private renderListItem = cond([
		[matches({ type: LIST_ITEMS_TYPES.TEAMSPACE }), this.renderTeamspace],
		[matches({ type: LIST_ITEMS_TYPES.PROJECT }), this.renderProject],
		[matches({ type: LIST_ITEMS_TYPES.FEDERATION }), this.renderModel],
		[matches({ type: LIST_ITEMS_TYPES.MODEL }), this.renderModel],
		[stubTrue, () => null]
	]);

	private renderLoader = renderWhenTrue(() => (
		<LoaderContainer>
			<Loader content="Loading teamspaces..." />
		</LoaderContainer>
	));

	private renderList = renderWhenTrue(() => (
		<SimpleBar>
			{this.props.items.filter(({ id, type }) => {
				return type === LIST_ITEMS_TYPES.TEAMSPACE || !!this.state.visibileItems[id];
			}).map(this.renderListItem)}
		</SimpleBar>
	));

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
					{this.renderLoader(isPending)}
					{this.renderList(!isPending)}
				</List>
			</Panel>
		);
	}
}
