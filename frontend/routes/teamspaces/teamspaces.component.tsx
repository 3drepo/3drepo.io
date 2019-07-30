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

import CancelIcon from '@material-ui/icons/Cancel';
import SearchIcon from '@material-ui/icons/Search';
import { cond, isEmpty, matches, stubTrue } from 'lodash';
import React from 'react';
import SimpleBar from 'simplebar-react';

import { MenuItem, Tab, Tabs } from '@material-ui/core';
import Add from '@material-ui/icons/Add';

import { renderWhenTrue } from '../../helpers/rendering';
import { ButtonMenu } from '../components/buttonMenu/buttonMenu.component';
import { FilterPanel } from '../components/filterPanel/filterPanel.component';
import { Loader } from '../components/loader/loader.component';
import { Panel } from '../components/panel/panel.component';
import { ViewerPanel } from '../viewerGui/components/viewerPanel/viewerPanel.component';
import FederationDialog from './components/federationDialog/federationDialog.container';
import ModelDialog from './components/modelDialog/modelDialog.container';
import ModelGridItem from './components/modelGridItem/modelGridItem.container';
import ProjectDialog from './components/projectDialog/projectDialog.container';
import ProjectItem from './components/projectItem/projectItem.container';
import TeamspaceItem from './components/teamspaceItem/teamspaceItem.container';
import { LIST_ITEMS_TYPES, TEAMSPACE_FILTER_RELATED_FIELDS, MODEL_SUBTYPES, TEAMSPACES_FILTERS } from './teamspaces.contants';
import {
	AddModelButton,
	AddModelButtonOption,
	GridContainer,
	Head,
	List,
	LoaderContainer,
	MenuButton
} from './teamspaces.styles';

interface IProps {
	match: any;
	history: any;
	location: any;
	teamspaces: any;
	currentTeamspace: string;
	items: any[];
	isPending: boolean;
	visibleItems: any[];
	revisions?: any[];
	starredVisibleItems: any[];
	showStarredOnly: boolean;
	starredModelsMap: any;
	modelsMap: any;
	searchEnabled: boolean;
	selectedFilters: any[];
	modelCodes: string[];
	showDialog: (config) => void;
	showConfirmDialog: (config) => void;
	showRevisionsDialog: (config) => void;
	hideDialog: () => void;
	fetchTeamspaces: (username) => void;
	fetchStarredModels: () => void;
	setState: (componentState: any) => void;
}

interface IState {
	teamspacesItems: any[];
	visibleItems: any;
	lastVisibleItems: any;
}

export class Teamspaces extends React.PureComponent<IProps, IState> {
	public static defaultProps = {
		teamspaces: []
	};

	public state = {
		teamspacesItems: [],
		visibleItems: {},
		lastVisibleItems: {}
	};

	private get filtersValuesMap() {
		const { modelCodes } = this.props;
		return {
			[TEAMSPACE_FILTER_RELATED_FIELDS.DATA_TYPE]: [],
			[TEAMSPACE_FILTER_RELATED_FIELDS.MODEL_TYPE]: MODEL_SUBTYPES.map(({ value }) => ({ value, label: value })),
			[TEAMSPACE_FILTER_RELATED_FIELDS .MODEL_CODE]: modelCodes.map((code) => ({ value: code, label: code })),
		};
	}

	private get filters() {
		const filterValuesMap = this.filtersValuesMap;
		return TEAMSPACES_FILTERS.map((teamspaceFilter) => {
			teamspaceFilter.values = filterValuesMap[teamspaceFilter.relatedField] || [];
			return teamspaceFilter;
		});
	}

	public componentDidMount() {
		const {
			items,
			fetchTeamspaces,
			currentTeamspace,
			visibleItems,
			starredVisibleItems,
			fetchStarredModels,
			showStarredOnly
		} = this.props;

		if (!items.length) {
			fetchTeamspaces(currentTeamspace);
			fetchStarredModels();
		}

		if (isEmpty(visibleItems)) {
			visibleItems[currentTeamspace] = true;
			this.setState({visibleItems});
		} else {
			this.setState({
				visibleItems: showStarredOnly ? starredVisibleItems : visibleItems,
				lastVisibleItems: visibleItems
			});
		}
	}

	public componentWillUnmount() {
		if (this.props.showStarredOnly) {
			this.props.setState({
				starredVisibleItems: this.state.visibleItems
			});
		} else {
			this.props.setState({
				visibleItems: this.state.lastVisibleItems
			});
		}

	}

	private shouldBeVisible = cond([
		[matches({ type: LIST_ITEMS_TYPES.TEAMSPACE }), stubTrue],
		[matches({ type: LIST_ITEMS_TYPES.PROJECT }), ({ teamspace }) => this.state.visibleItems[teamspace]],
		[stubTrue, () => false]
	]);

	private openProjectDialog = (event, teamspaceName = '', projectId?, projectName = '') => {
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

	private openFederationDialog = ({ project, teamspace }: { project?: string, teamspace?: string }) => {
		this.props.showDialog({
			title: 'New federation',
			template: FederationDialog,
			data: {
				teamspace,
				project
			}
		});
	}

	private openModelDialog = ({ project, teamspace }: { project?: string, teamspace?: string }) => {
		this.props.showDialog({
			title: 'New model',
			template: ModelDialog,
			data: {
				teamspace,
				project
			}
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

	public getSearchButton = () => {
		if (this.props.searchEnabled) {
			return <IconButton onClick={this.handleCloseSearchMode}><CancelIcon /></IconButton>;
		}
		return <IconButton onClick={this.handleOpenSearchMode}><SearchIcon /></IconButton>;
	}

	private getStarredVisibleItems = () => {
		const starredVisibleItems = new Set();
		const visibleItemsMap = {};

		Object.keys(this.props.starredModelsMap).forEach((starredKey) => {
			const [ teamspace, modelId ] = starredKey.split('/');
			starredVisibleItems.add(teamspace);
			if (this.props.modelsMap[modelId]) {
				starredVisibleItems.add(this.props.modelsMap[modelId].projectName);
			}
		});

		starredVisibleItems.forEach((item) => {
			visibleItemsMap[item] = true;
		});

		return visibleItemsMap;
	}

	private handleTabChange = (event, activeTab) => {
		const starredVisibleItems = this.getStarredVisibleItems();

		this.props.setState({
			showStarredOnly: Boolean(activeTab),
		});

		if (activeTab) {
			this.setState({
				lastVisibleItems: this.state.visibleItems,
			});
		}

		this.setState({
			visibleItems: activeTab ? starredVisibleItems : this.state.lastVisibleItems
		});
	}

	private renderAddModelGridItem = (teamspace, project) => (
		<AddModelButton>
			<AddModelButtonOption
				onClick={() => this.openModelDialog({ teamspace, project })}
			>Model</AddModelButtonOption>
			<AddModelButtonOption
				onClick={() => this.openFederationDialog({ teamspace, project })}
			>Federation</AddModelButtonOption>
		</AddModelButton>
	)

    private handleCloseSearchMode = () => {
        this.props.setState({ searchEnabled: false, selectedFilters: [] });
    }

    private handleOpenSearchMode = () => {
        this.props.setState({ searchEnabled: true });
    }

    private handleFilterChange = (selectedFilters) => {
        this.props.setState({ selectedFilters });
    }

    private renderActions = () => (
        <>
        {this.getSearchButton()}
        </>
    )

	private renderFilterPanel = renderWhenTrue(() => (
		<FilterPanel
			onChange={this.handleFilterChange}
			filters={this.filters}
			selectedFilters={this.props.selectedFilters}
		left/>
	));

	private renderModels = (models) => renderWhenTrue(() =>
		models.map((props) => (<ModelGridItem key={props.model} {...props}	/>))
	)(models.length)

	private renderProjectContainer = (models, project) => renderWhenTrue(() => (
		<GridContainer key={`container-${project.id}`}>
			{this.renderAddModelGridItem(project.teamspace, project.id)}
			{this.renderModels(models)}
		</GridContainer>
	))(this.state.visibleItems[project.id])

	private renderProject = (props) => ([
		(
			<ProjectItem
				{...props}
				key={props._id}
				isEmpty={!props.models.length}
				onClick={this.handleVisibilityChange}
			/>
		),
		this.renderProjectContainer(props.models, props),
	])

	private renderTeamspace = (props) => {
		return (
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
		);
	}

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
		const { isPending, showStarredOnly, searchEnabled } = this.props;

		return (
			<ViewerPanel
				title="Teamspaces"
				paperProps={{ height: '100%' }}
				renderActions={this.renderActions}
			>
				{this.renderFilterPanel(searchEnabled)}
				<Head>
					<Tabs
						indicatorColor="primary"
						textColor="primary"
						value={Number(showStarredOnly)}
						onChange={this.handleTabChange}
					>
						<Tab label="3D Models & Federations" />
						<Tab label="Starred" />
					</Tabs>
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
			</ViewerPanel>
		)
	}
}
