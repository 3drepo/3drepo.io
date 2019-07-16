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
import { Body, BodyWrapper } from '../components/customTable/customTable.styles';
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
import { TeamspaceItem } from './components/teamspaceItem/teamspaceItem.component';
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
	setState: (componentState: any) => void;
}

interface IState {
	activeTeamspace: string;
	activeProject: string;
	teamspacesItems: any[];
}

export class Teamspaces extends React.PureComponent<IProps, IState> {
	public static defaultProps = {
		teamspaces: []
	};

	public state = {
		activeTeamspace: '',
		activeProject: '',
		teamspacesItems: []
	};

	public get activeTeamspace() {
		const { teamspace } = this.props.match.params;

		if (teamspace) {
			return teamspace;
		}

		return this.state.activeTeamspace;
	}

	public componentDidMount() {
		if (this.props.items.length === 0 ) {
			this.props.fetchTeamspaces(this.props.currentTeamspace);
		}

		this.setState({
			activeTeamspace: this.props.activeTeamspace || this.props.currentTeamspace,
			activeProject: this.props.activeProject
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

	public createRouteHandler = (pathname, params = {}) => (event) => {
		event.stopPropagation();

		this.props.history.push({ pathname, search: `?${queryString.stringify(params)}` });
	}

	public onTeamspaceClick = ({ name }) => {
		this.setState({ activeTeamspace: name });
	}

	/**
	 * Dialog handlers
	 */
	public openProjectDialog = (teamspaceName = '', projectId?, projectName = '') => (event) => {
		event.stopPropagation();

		this.props.showDialog({
			title: projectName ? 'Edit project' : 'New project',
			template: ProjectDialog,
			data: {
				id: projectId,
				name: projectName,
				teamspace: teamspaceName,
			},
		});
	}

/* 	public createRemoveModelHandler = (modelName, modelId, projectName, type) => (event) => {
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
	} */
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
	} */

/* 	public openFederationDialog =
		(teamspaceName = '', projectName = '', modelName = '', modelId = '') => (event) => {
			event.stopPropagation();
			const { teamspacesItems } = this.state as IState;
			const isNewModel = !modelName.length;
			const teamspaces = teamspacesItems.filter((teamspace) => teamspace.projects.length);

			this.props.showDialog({
				title: modelName ? 'Edit federation' : 'New federation',
				template: FederationDialog,
				data: {
					name: modelName,
					modelName,
					teamspace: teamspaceName,
					teamspaces,
					project:  projectName ,
					projects: teamspaceName ? this.getTeamspaceProjects(teamspaceName) : [],
					editMode: !!modelName,
					modelId
				},
				DialogProps: {
					maxWidth: 'lg'
				},
				onConfirm: ({ teamspace, ...modelData }) => {
					if (isNewModel) {
						this.props.createModel(teamspace, modelData);
					} else {
						this.props.updateModel(teamspace, modelId, modelData);
					}
				}
		});
	} */

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
	} */

/* 	public createModelItemClickHandler = (props) => (event) => {
		const { activeTeamspace } = this.state;
		if (props.timestamp) {
			event.persist();
			this.createRouteHandler(`/viewer/${activeTeamspace}/${props.model}`)(event);

			analyticsService.sendEvent(EVENT_CATEGORIES.MODEL, EVENT_ACTIONS.VIEW);
		} else {
			this.openUploadModelFileDialog(activeTeamspace, props)(event);
		}
	}

	public createDownloadModelHandler = (activeTeamspace, modelId) => () => {
		this.props.downloadModel(activeTeamspace, modelId);
	} */

	/**
	 * Render methods
	 */
	// public renderModel = (props, ) => {
	// 	const type = props.federate ? FEDERATION_TYPE : MODEL_TYPE;
	// 	const { activeTeamspace } = this.state;
	// 	const { match } = this.props;

	// 	return (
	// 		<ModelItem
	// 			{...props}
	// 			key={props.model}
	// 			activeTeamspace={activeTeamspace}
	// 			actions={[]}
	// 			onModelItemClick={this.createModelItemClickHandler(props)}
	// 			onPermissionsClick={this.createRouteHandler(`/dashboard/user-management/${activeTeamspace}/projects`, {
	// 				project: props.projectName,
	// 				view: PERMISSIONS_VIEWS.MODELS,
	// 				modelId: props.model
	// 			})}
	// 			onSettingsClick={this.createRouteHandler(`${match.url}/${activeTeamspace}/models/${props.model}`, {
	// 				project: props.projectName
	// 			})}
	// 			onDeleteClick={this.createRemoveModelHandler(props.name, props.model, props.projectName, type)}
	// 			onDownloadClick={this.createDownloadModelHandler(this.state.activeTeamspace, props.model)}
	// 			onRevisionsClick={this.openModelRevisionsDialog(props)}
	// 			onModelUpload={this.openUploadModelFileDialog(this.state.activeTeamspace, props)}
	// 			onEditClick={this.openFederationDialog(this.state.activeTeamspace, props.projectName, props.name, props.model)}
	// 		/>
	// 	);
	// }

/* 	public createModelDirectoryAddHandler = (props) => {
		return props.type === FEDERATION_TYPE
			? this.openFederationDialog(this.state.activeTeamspace, props.projectName)
			: this.openModelDialog(this.state.activeTeamspace, props.projectName);
	} */

/*
	public renderModelDirectory = (permissions, props) => (
		<ModelDirectoryItem
			{...props}
			permissions={permissions}
			renderChildItem={this.renderModelDirectoryItem(props.projectName)}
			onAddClick={this.createModelDirectoryAddHandler(props)}
		/>
	) */

/* 	public isActiveProject = (projectName) => projectName === this.props.activeProject; */

	public renderProject = (props) => {
		return (
			<ProjectItem
				{...props}
				teamspace={this.activeTeamspace}
				key={props._id}
				onEditClick={this.openProjectDialog(this.activeTeamspace, props._id, props.name)}
				active={props.name === this.props.activeProject}
				onRootClick={this.handleProjectClick}
			/>
		);
	}

	public handleProjectClick = ({ active, name }) => {
		this.setState({ activeProject: active ? name : ''	});
	}

	public renderTeamspace = (teamspace, index) => (
		<TeamspaceItem
			{...teamspace}
			key={index}
			active={teamspace.account === this.activeTeamspace}
			isMyTeamspace={index === 0}
			onToggle={this.onTeamspaceClick}
			onAddProject={this.openProjectDialog(teamspace.account)}
		/>
	)

	public renderMenuButton = (isPending, props) => (
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
{/* 				<MenuItem onClick={createMenuClickHandler(this.openModelDialog(), close)}>
					Add model
				</MenuItem>
				<MenuItem onClick={createMenuClickHandler(this.openFederationDialog(), close)}>
					Add federation
				</MenuItem> */}
			</>
		);
	}

	public renderListItem = cond([
		[matches({ type: LIST_ITEMS_TYPES.TEAMSPACE }), this.renderTeamspace],
		[matches({ type: LIST_ITEMS_TYPES.PROJECT }), this.renderProject],
		[stubTrue, () => null]
/* 		[matches({ type: LIST_ITEMS_TYPES.FEDERATION }), this.renderModel],
		[matches({ type: LIST_ITEMS_TYPES.MODEL }), this.renderModel], */
	])

	public renderLoader = renderWhenTrue(() => (
        <List>
            <LoaderContainer>
                <Loader content="Loading teamspaces..." />
            </LoaderContainer>
        </List>
	))

	public renderList = renderWhenTrue(() => (
        <BodyWrapper>
            <Body>
                <SimpleBar>
                    {this.props.items.map(this.renderListItem)}
                </SimpleBar>
            </Body>
        </BodyWrapper>
	))

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
