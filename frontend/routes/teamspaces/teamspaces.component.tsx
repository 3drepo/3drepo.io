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

import { cond, isEmpty, matches, stubTrue } from 'lodash';
import React from 'react';
import SimpleBar from 'simplebar-react';
import { analyticsService, EVENT_ACTIONS, EVENT_CATEGORIES } from '../../services/analytics';

import MenuItem from '@material-ui/core/MenuItem';
import Add from '@material-ui/icons/Add';

import { renderWhenTrue } from '../../helpers/rendering';
import { ButtonMenu } from '../components/buttonMenu/buttonMenu.component';
import { Loader } from '../components/loader/loader.component';
import { Panel } from '../components/panel/panel.component';
import { PERMISSIONS_VIEWS } from '../projects/projects.component';
import FederationDialog from './components/federationDialog/federationDialog.container';
import { ModelDialog } from './components/modelDialog/modelDialog.component';
import { ModelDirectoryItem } from './components/modelDirectoryItem/modelDirectoryItem.component';
import ProjectDialog from './components/projectDialog/projectDialog.container';
import ProjectItem from './components/projectItem/projectItem.container';
import ModelGridItem from './components/modelGridItem/modelGridItem.container';
import ModelListItem from './components/modelListItem/modelListItem.container';
import RevisionsDialog from './components/revisionsDialog/revisionsDialog.container';
import TeamspaceItem from './components/teamspaceItem/teamspaceItem.container';
import UploadModelFileDialog from './components/uploadModelFileDialog/uploadModelFileDialog.container';
import { FEDERATION_TYPE, LIST_ITEMS_TYPES, MODEL_TYPE } from './teamspaces.contants';
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
	teamspaces: any;
	projects: any;
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
	visibleItems: any;
}

export class Teamspaces extends React.PureComponent<IProps, IState> {
	public static defaultProps = {
		teamspaces: []
	};

	public state = {
		activeTeamspace: '',
		activeProject: '',
		teamspacesItems: [],
		visibleItems: {}
	};

	public get activeTeamspace() {
		return this.props.match.params.teamspace || this.state.activeTeamspace;
	}

	public componentDidMount() {
		const {items, fetchTeamspaces, currentTeamspace} = this.props;
		if (!items.length) {
			fetchTeamspaces(currentTeamspace);
		}
	}

	public componentDidUpdate(prevProps, prevState) {
		const changes = {} as IState;
		const { isPending, teamspaces, currentTeamspace, activeProject, projects } = this.props;

		const isPendingChanged = isPending !== prevProps.isPending;
		if (isPendingChanged) {
			const activeTeamspace = this.props.activeTeamspace || currentTeamspace;
			const visibleItems = { ...prevState.visibleItems };

			if (activeTeamspace && teamspaces[activeTeamspace]) {
				visibleItems[activeTeamspace] = true;
				[...teamspaces[activeTeamspace].projects, activeTeamspace].forEach((id) => {
					visibleItems[id] = true;
				});
			}

			if (activeProject && projects[activeProject]) {
				visibleItems[activeProject] = true;
				projects[activeProject].models.forEach((id) => {
					visibleItems[id] = true;
				});
			}

			changes.activeTeamspace = activeTeamspace;
			changes.activeProject = activeProject;
			changes.visibleItems = visibleItems;

			changes.visibleItems = visibleItems;
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

	public handleTeamspaceClick = ({ name, projects }) => {
		this.setState((prevState) => {
			const visibleItems = { ...prevState.visibleItems };

			[...projects, name].forEach((id) => {
				visibleItems[id] = !visibleItems[id];
			});

			return {
				activeTeamspace: visibleItems[name] ? name : '',
				visibleItems
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

	public createShareModelHandler = (props) => (event) => {
		event.stopPropagation();
		console.log('Share model', props);
	}
/*
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
		<ModelGridItem
			{...props}
			key={props.model}
			activeTeamspace={this.activeTeamspace}
			actions={[]}
			// onModelUpload={this.openUploadModelFileDialog(this.state.activeTeamspace, props)}
			// onEditClick={this.openFederationDialog(this.state.activeTeamspace, props.projectName, props.name, props.model)}
		/>
	)

	private renderProject = (props) => (
		<ProjectItem
			{...props}
			teamspace={this.activeTeamspace}
			key={props._id}
			onEditClick={this.openProjectDialog}
			disabled={!props.models.length}
			onClick={this.handleProjectClick}
		/>
	)

	public handleProjectClick = ({ id: projectId, models }) => {
		this.setState((prevState) => {
			const visibleItems = { ...prevState.visibleItems };

			models.forEach((id) => {
				visibleItems[id] = !visibleItems[id];
			});

			return {
				activeProject: projectId,
				visibleItems
			};
		});
	}

	private renderTeamspace = (props) => (
		<TeamspaceItem
			{...props}
			key={props.account}
			name={props.account}
			active={this.state.visibleItems[props.account]}
			isMyTeamspace={this.props.currentTeamspace === props.account}
			onToggle={this.handleTeamspaceClick}
			onAddProject={this.openProjectDialog}
			disabled={!props.projects.length}
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
				return type === LIST_ITEMS_TYPES.TEAMSPACE || !!this.state.visibleItems[id];
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
