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
import { groupBy, isEmpty, isEqual } from 'lodash';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';

import { ButtonMenu } from '../components/buttonMenu/buttonMenu.component';
import { Loader } from '../components/loader/loader.component';
import { Panel } from '../components/panel/panel.component';
import { TreeList } from '../components/treeList/treeList.component';
import { ModelItem } from './components/modelItem/modelItem.component';
import { MyTeamspaceItem } from './components/myTeamspaceItem/myTeamspaceItem.component';
import { ROW_ACTIONS } from './teamspaces.contants';
import { Head, List, LoaderContainer, MenuButton } from './teamspaces.styles';
import { RowMenu } from './components/rowMenu/rowMenu.component';
import { TABS_TYPES } from '../userManagement/userManagement.component';
import { runAngularTimeout } from '../../helpers/migration';
import { ProjectDialog } from './components/projectDialog/projectDialog.component';
import { ModelDialog } from './components/modelDialog/modelDialog.component';
import { PERMISSIONS_VIEWS } from '../projects/projects.component';
import { TeamspaceItem } from './components/teamspaceItem/teamspaceItem.component';
import { TooltipButton } from './components/tooltipButton/tooltipButton.component';
import { ProjectItem } from './components/projectItem/projectItem.component';
import { ModelDirectoryItem } from './components/modelDirectoryItem/modelDirectoryItem.component';
import { MODEL_TYPE, FEDERATION_TYPE } from './teamspaces.contants';

const PANEL_PROPS = {
	title: 'Teamspaces',
	paperProps: {
		height: '100%'
	}
};

const getTeamspacesItems = (teamspaces) => teamspaces.map(({ account, projects }) => ({ value: account, projects }));

interface IProps {
	history: any;
	currentTeamspace: string;
	teamspaces: any[];
	isPending: boolean;
	showDialog: (config) => void;
	showConfirmDialog: (config) => void;

	createProject: (teamspace, projectData) => void;
	updateProject: (teamspace, projectName, projectData) => void;
	removeProject: (teamspace, projectName) => void;

	createModel: (teamspace, modelData, type) => void;
	updateModel: (teamspace, modelName, modelData, type) => void;
	removeModel: (teamspace, modelName, type) => void;

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
		this.setState({
			activeTeamspace: this.props.currentTeamspace,
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

	public createRouteHandler = (pathname, params = {}) => (event) => {
		event.stopPropagation();

		// TODO: Remove `runAngularTimeout` after migration of old routing
		runAngularTimeout(() => {
			this.props.history.push({ pathname, search: `?${queryString.stringify(params)}` });
		});
	}

	public onTeamspaceClick = (teamspace) => {
		this.setState({ activeTeamspace: teamspace.account });
	}

	/**
	 * Dialog handlers
	 */
	public openProjectDialog = (event, teamspaceName = '', projectName = '') => {
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
			onConfirm: ({teamspace, ...projectData}) => {
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

	public openModelDialog = (event, type = MODEL_TYPE, teamspaceName = '', modelName = '') => {
		event.stopPropagation();
		const { teamspacesItems } = this.state as IState;
		const isNewModel = !modelName.length;

		this.props.showDialog({
			title: modelName ? `Edit ${type}` : `New ${type}`,
			template: ModelDialog,
			data: {
				name: modelName,
				teamspace: teamspaceName,
				teamspaces: teamspacesItems,
				type
			},
			onConfirm: ({ teamspace, ...modelData }) => {
				if (isNewModel) {
					this.props.createModel(teamspace, modelData);
				} else {
					this.props.updateModel(teamspace, modelName, modelData);
				}
			}
		});
	}

	/**
	 * Render methods
	 */
	public renderModel = (props) => {
		return <ModelItem {...props} actions={[]} />;
	}

	public renderModelDirectory = (props) => (
		<ModelDirectoryItem
			{...props}
			renderChildItem={this.renderModel}
			onAddClick={this.openModelDialog}
		/>
	)

	public renderProject = (props) => (
		<ProjectItem
			{...props}
			renderChildItem={this.renderModelDirectory}
			onEditClick={(event) => this.openProjectDialog(event, this.state.activeTeamspace, props.name)}
			onPermissionsClick={this.createRouteHandler(`/${this.props.currentTeamspace}`, {
				page: 'userManagement',
				teamspace: this.state.activeTeamspace,
				project: props.name,
				tab: TABS_TYPES.PROJECTS
			})}
			onRemoveClick={this.createRemoveProjectHandler(props.name)}
		/>
	)

	public renderTeamspaces = (teamspaces) => {
		return teamspaces.map((teamspace, index) => (
			<TeamspaceItem
				{...teamspace}
				key={index}
				active={teamspace.account === this.state.activeTeamspace}
				isMyTeamspace={index === 0}
				renderChildItem={this.renderProject}
				onToggle={this.onTeamspaceClick.bind(this, teamspace)}
				onAddProject={(event) => this.openProjectDialog(event, teamspace.account)}
			/>
		));
	}

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
			<Icon>add</Icon>
		</MenuButton>
	)

	public renderMenu = ({ close }) => {
		return (
			<>
				<MenuItem onClick={(event) => { this.openProjectDialog(event); close(event); }}> Add project </MenuItem>
				<MenuItem onClick={(event) => { this.openModelDialog(event, MODEL_TYPE); close(event); }}>Add model</MenuItem>
				<MenuItem onClick={(event) => { this.openModelDialog(event, FEDERATION_TYPE); close(event); }}>Add federation</MenuItem>
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
						icon="add"
						renderButton={this.renderMenuButton.bind(this, isPending)}
						renderContent={this.renderMenu}
						PopoverProps={{
							anchorOrigin: {
								vertical: 'center',
								horizontal: 'left'
							},
							transformOrigin: {
								vertical: 'top',
								horizontal: 'right'
							}
						}}
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
