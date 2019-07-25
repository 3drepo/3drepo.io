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

import MenuItem from '@material-ui/core/MenuItem';
import Add from '@material-ui/icons/Add';

import { renderWhenTrue } from '../../helpers/rendering';
import { ButtonMenu } from '../components/buttonMenu/buttonMenu.component';
import { Loader } from '../components/loader/loader.component';
import { Panel } from '../components/panel/panel.component';
import FederationDialog from './components/federationDialog/federationDialog.container';
import ModelDialog from './components/modelDialog/modelDialog.container';
import ModelGridItem from './components/modelGridItem/modelGridItem.container';
import ProjectDialog from './components/projectDialog/projectDialog.container';
import ProjectItem from './components/projectItem/projectItem.container';
import TeamspaceItem from './components/teamspaceItem/teamspaceItem.container';
import { LIST_ITEMS_TYPES } from './teamspaces.contants';
import { GridContainer, Head, List, LoaderContainer, MenuButton } from './teamspaces.styles';

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
			}

			if (activeProject && projects[activeProject]) {
				visibleItems[activeProject] = true;
			}

			changes.activeTeamspace = activeTeamspace;
			changes.activeProject = activeProject;
			changes.visibleItems = visibleItems;
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public componentWillUnmount() {
		this.props.setState({
			activeTeamspace: this.state.activeTeamspace,
			activeProject: this.state.activeProject,
			visibleItems: this.state.visibleItems
		});
	}

	private shouldBeVisible = cond([
		[matches({ type: LIST_ITEMS_TYPES.TEAMSPACE }), stubTrue],
		[matches({ type: LIST_ITEMS_TYPES.PROJECT }), ({ teamspace }) => this.state.visibleItems[teamspace]],
		[stubTrue, () => false]
	]);

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

	public openFederationDialog = () => {
		this.props.showDialog({
			title: 'New federation',
			template: FederationDialog
		});
	}

	public openModelDialog = () => {
		this.props.showDialog({
			title: 'New model',
			template: ModelDialog
		});
	}

	private handleVisibilityChange = ({ id: itemId, nested = []}) => {
		this.setState((prevState) => {
			const visibleItems = { ...prevState.visibleItems };
			visibleItems[itemId] = !visibleItems[itemId];

			if (!visibleItems[itemId]) {
				nested.forEach((id) => {
					visibleItems[id] = visibleItems[itemId];
				});
			}

			return { visibleItems };
		});
	}

	private renderModels = (models, projectId) => renderWhenTrue(() => (
		<GridContainer key={`container-${projectId}`}>
			{models.map((props) => (
				<ModelGridItem key={props.model} {...props} />
			))}
		</GridContainer>
	))(models.length && this.state.visibleItems[projectId])

	private renderProject = (props) => ([
		(
			<ProjectItem
				{...props}
				key={props._id}
				onEditClick={this.openProjectDialog}
				disabled={!props.models.length}
				onClick={this.handleVisibilityChange}
			/>
		),
		this.renderModels(props.models, props._id)
	])

	private renderTeamspace = (props) => (
		<TeamspaceItem
			{...props}
			key={props.account}
			name={props.account}
			active={this.state.visibleItems[props.account]}
			isMyTeamspace={this.props.currentTeamspace === props.account}
			onToggle={this.handleVisibilityChange}
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
		[stubTrue, () => null]
	]);

	private renderLoader = renderWhenTrue(() => (
		<LoaderContainer>
			<Loader content="Loading teamspaces..." />
		</LoaderContainer>
	));

	private renderList = renderWhenTrue(() => (
		<SimpleBar>
			{this.props.items.filter(this.shouldBeVisible).map(this.renderListItem)}
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
