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

const PANEL_PROPS = {
	title: 'Teamspaces',
	paperProps: {
		height: '100%'
	}
};

const TooltipButton = ({ label, action = null, icon, color = 'inherit' }) => {
	const iconProps = { color, fontSize: 'small' } as any;
	return (
		<Tooltip title={label}>
			<IconButton aria-label={label} onClick={action}>
				<Icon {...iconProps}>{icon}</Icon>
			</IconButton>
		</Tooltip>
	);
};

interface IProps {
	history: any;
	currentTeamspace: string;
	teamspaces: any[];
	isPending: boolean;
	showDialog: (config) => void;
	saveProject: (teamspace, project) => void;
	updateProject: (teamspace, project) => void;
	removeProject: (teamspace, project) => void;

	onPermissionsClick: () => void;
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

	public modelActions = [{
		...ROW_ACTIONS.UPLOAD_FILE,
		action: this.props.onUploadClick
	}, {
		...ROW_ACTIONS.REVISIONS,
		action: this.props.onRevisionsClick
	}, {
		...ROW_ACTIONS.DOWNLOAD,
		action: this.props.onDownloadClick
	}, {
		...ROW_ACTIONS.SETTINGS,
		action: this.props.onSettingsClick
	}, {
		...ROW_ACTIONS.PERMISSIONS,
		action: this.props.onPermissionsClick
	}, {
		...ROW_ACTIONS.DELETE,
		action: this.props.onDeleteClick
	}];

	public federationActions = [{
		...ROW_ACTIONS.EDIT,
		action: this.props.onEditClick
	}, {
		...ROW_ACTIONS.SETTINGS,
		action: this.props.onSettingsClick
	}, {
		...ROW_ACTIONS.PERMISSIONS,
		action: this.props.onPermissionsClick
	}, {
		...ROW_ACTIONS.DELETE,
		action: this.props.onDeleteClick
	}];

	public getTeamspacesItems = (teamspaces) => teamspaces.map(({account}) => ({value: account}));

	public componentDidMount() {
		this.setState({
			activeTeamspace: this.props.currentTeamspace,
			teamspacesItems: this.getTeamspacesItems(this.props.teamspaces)
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
			changes.teamspacesItems = this.getTeamspacesItems(this.props.teamspaces);
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public createRouteHandler = (pathname, params = {}) => () => {
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

		const isNewProject = Boolean(projectName.length);
		this.props.showDialog({
			title: projectName ? 'Edit project' : 'New project',
			template: ProjectDialog,
			data: {
				name: projectName,
				teamspace: teamspaceName,
				teamspaces: teamspacesItems
			},
			onConfirm: ({teamspace, ...project}) => {
				if (isNewProject) {
					this.props.saveProject(teamspace, project);
				} else {
					this.props.updateProject(teamspace, project);
				}
			}
		});
	}

	/**
	 * Render methods
	 */

	public renderModel = (actions, props) => {
		return <ModelItem {...props} actions={actions} />;
	}

	public renderProjectItem = ({actions, ...props}) => {
		return (
			<TreeList
				{...(props as any)}
				level={3}
				renderItem={this.renderModel.bind(this, actions)}
				active={true}
				disableShadow={true}
			/>
		);
	}

	public renderProjectActions = ({name, hovered}) => (
		<RowMenu open={hovered}>
			<TooltipButton
				{...ROW_ACTIONS.EDIT}
				action={(event) => this.openProjectDialog(event, this.state.activeTeamspace, name)}
			/>
			<TooltipButton
				{...ROW_ACTIONS.PERMISSIONS}
				action={this.createRouteHandler(`/${this.props.currentTeamspace}`, {
					page: 'userManagement',
					teamspace: this.state.activeTeamspace,
					project: name,
					tab: TABS_TYPES.PROJECTS
				})}
			/>
			<TooltipButton
				{...ROW_ACTIONS.DELETE}
				action={() => this.props.removeProject(this.state.activeTeamspace, name)}
			/>
		</RowMenu>
	)

	public renderProject = (props) => {
		const {federations = [], models } = groupBy(props.models, ({federate}) => {
			return federate ? 'federations' : 'models';
		});
		const items = [{
			name: 'Federations',
			items: federations,
			actions: this.federationActions,
			renderActions: () => (
				<TooltipButton
					{...ROW_ACTIONS.ADD_NEW}
					label="Add new federation"
					action={this.handleAddProject}
				/>
			)
		}, {
			name: 'Models',
			items: models,
			actions: this.modelActions,
			renderActions: () => (
				<TooltipButton
					{...ROW_ACTIONS.ADD_NEW}
					label="Add new model"
					action={this.handleAddProject}
				/>
			)
		}];

		return (
			<TreeList
				key={props.key}
				name={props.name}
				level={2}
				items={items}
				renderItem={this.renderProjectItem}
				renderActions={this.renderProjectActions}
			/>
		);
	}

	public renderTeamspaces = (teamspaces) => {
		return teamspaces.map((teamspace, index) => {
			const TeamspaceItem = (
				<TreeList
					key={index}
					name={teamspace.account}
					level={1}
					items={teamspace.projects}
					onRootClick={this.onTeamspaceClick.bind(this, teamspace)}
					active={teamspace.account === this.state.activeTeamspace}
					renderItem={this.renderProject}
					renderRoot={index === 0 ? MyTeamspaceItem : null}
					renderActions={() => (
						<TooltipButton
							{...ROW_ACTIONS.ADD_NEW}
							label="Add new project"
							action={(event) => this.openProjectDialog(event, teamspace.account)}
						/>
					)}
				/>
			);

			return TeamspaceItem;
		});
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
				<MenuItem onClick={close}>Add project</MenuItem>
				<MenuItem>Add model</MenuItem>
				<MenuItem>Add federation</MenuItem>
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
