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
import { cond, matches, stubTrue } from 'lodash';
import memoizeOne from 'memoize-one';
import React from 'react';
import SimpleBar from 'simplebar-react';

import { IconButton, MenuItem, Tabs } from '@material-ui/core';
import Add from '@material-ui/icons/Add';
import Check from '@material-ui/icons/Check';

import { encodeElementId } from '../../helpers/html';
import { renderWhenTrue } from '../../helpers/rendering';
import { sortModels } from '../../modules/teamspaces/teamspaces.helpers';
import { ButtonMenu } from '../components/buttonMenu/buttonMenu.component';
import { EmptyStateInfo } from '../components/components.styles';
import { Body, BodyWrapper } from '../components/customTable/customTable.styles';
import {
	MenuList,
	StyledItemText,
	StyledListItem
} from '../components/filterPanel/components/filtersMenu/filtersMenu.styles';
import { FilterPanel, FILTER_TYPES } from '../components/filterPanel/filterPanel.component';
import { Loader } from '../components/loader/loader.component';
import { MenuButton as MenuButtonComponent } from '../components/menuButton/menuButton.component';
import { ViewerPanel } from '../viewerGui/components/viewerPanel/viewerPanel.component';
import FederationDialog from './components/federationDialog/federationDialog.container';
import ModelDialog from './components/modelDialog/modelDialog.container';
import ModelGridItem from './components/modelGridItem/modelGridItem.container';
import ProjectDialog from './components/projectDialog/projectDialog.container';
import ProjectItem from './components/projectItem/projectItem.container';
import TeamspaceItem from './components/teamspaceItem/teamspaceItem.container';
import {
	LIST_ITEMS_TYPES,
	MODEL_SUBTYPES,
	SORTING_BY_LAST_UPDATED,
	SORTING_BY_NAME,
	TEAMSPACE_FILTER_RELATED_FIELDS,
	TEAMSPACES_DATA_TYPES,
	TEAMSPACES_FILTERS,
	TEAMSPACES_PANEL_ACTIONS_MENU,
} from './teamspaces.contants';
import {
	Action,
	AddModelButton,
	AddModelButtonOption,
	GridContainer,
	Head,
	Label,
	List,
	LoaderContainer,
	MenuButton,
	OtherTeamspacesLabel,
	StyledTab,
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
	searchEnabled: boolean;
	selectedFilters: any[];
	selectedDataTypes: any[];
	modelCodes: string[];
	starredModelsMap: any;
	modelsMap: any;
	activeSorting: string;
	activeSortingDirection: string;
	nameSortingDescending: boolean;
	dateSortingDescending: boolean;
	showDialog: (config) => void;
	showConfirmDialog: (config) => void;
	fetchTeamspaces: (username) => void;
	fetchStarredModels: () => void;
	leaveTeamspace: (Teamspace) => void;
	setState: (componentState: any) => void;
	subscribeOnChanges: () => void;
	unsubscribeFromChanges: () => void;
}

interface IState {
	teamspacesItems: any[];
	visibleItems: any;
	lastVisibleItems: any;
}

const getSearchQuery = memoizeOne((selectedFilters) => selectedFilters.reduce((query, filter) => {
	if (filter.type === FILTER_TYPES.QUERY) {
		query = `${query} ${filter.value.value}`;
	}
	return query;
}, '').trim());

const iconProps = { fontSize: 'small' };

const PanelMenuButton = (props) => <MenuButtonComponent ariaLabel="Show Teamspaces menu" {...props} />;

const SortingIcon = ({Icon, isDesc}) => {
	if (isDesc) {
		return <Icon.DESC IconProps={iconProps} />;
	}
	return <Icon.ASC IconProps={iconProps} />;
};
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

	private get searchQuery() {
		return getSearchQuery(this.props.selectedFilters);
	}

	private get myTeamspace() {
		return this.props.items[0];
	}

	public componentDidMount() {
		const {
			items,
			fetchTeamspaces,
			currentTeamspace,
			visibleItems,
			starredVisibleItems,
			fetchStarredModels,
			showStarredOnly,
			subscribeOnChanges,
		} = this.props;

		if (!items.length) {
			fetchTeamspaces(currentTeamspace);
			fetchStarredModels();
		}

		this.setState({
			visibleItems: showStarredOnly ? starredVisibleItems : visibleItems,
			lastVisibleItems: visibleItems
		});

		subscribeOnChanges();
	}

	public componentDidUpdate(prevProps) {
		const { items, searchEnabled, selectedFilters} = this.props;
		const filtersCleared = !selectedFilters.length && prevProps.selectedFilters.length;
		const isFilterChanged = prevProps.selectedFilters.length !== selectedFilters.length;

		if (filtersCleared) {
			const visibleItems = {
				[this.props.currentTeamspace]: true
			};
			this.setState({ visibleItems });
		} else if (searchEnabled && isFilterChanged) {
			const visibleItems = { ...this.state.visibleItems };

			items.forEach(({ collapsed, id }) => {
				if (collapsed) {
					delete visibleItems[id];
				} else {
					visibleItems[id] = true;
				}
			});
			this.setState({ visibleItems });
		}
	}

	public componentWillUnmount() {
		if (this.props.showStarredOnly) {
			this.props.setState({
				starredVisibleItems: this.state.visibleItems
			});
		} else {
			this.props.setState({
				visibleItems: this.state.visibleItems
			});
		}
		this.props.unsubscribeFromChanges();
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

	public onLeaveTeamspace = (teamspace) => (event) => {
		event.stopPropagation();
		this.props.showConfirmDialog({
			title: 'Leave teamspace',
			content: `
				Do you really want to leave teamspace <b>${teamspace}</b>? <br /><br />
				This will remove you from the teamspace,
				and you wont have any access to it's projects and models!
			`,
			onConfirm: () => {
				this.props.leaveTeamspace(teamspace);
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

	private getSearchButton = () => {
		if (this.props.searchEnabled) {
			return <IconButton onClick={this.handleCloseSearchMode}><CancelIcon /></IconButton>;
		}
		return <IconButton onClick={this.handleOpenSearchMode}><SearchIcon /></IconButton>;
	}

	private handleSortingItemClick = (sortingType, isNameSortingActive) => {
		const { nameSortingDescending, dateSortingDescending } = this.props;
		const newState = {} as any;
		const isNameSortingClicked = sortingType === SORTING_BY_NAME;

		newState.activeSorting = sortingType;

		if (isNameSortingClicked) {
			newState.nameSortingDescending = isNameSortingActive ? !nameSortingDescending : nameSortingDescending;
		} else {
			newState.dateSortingDescending = !isNameSortingActive ? !dateSortingDescending : dateSortingDescending;
		}

		this.props.setState(newState);
	}

	private renderActionsMenu = () =>  {
		const { activeSorting, nameSortingDescending, dateSortingDescending } = this.props;
		const isNameSortingActive = activeSorting === SORTING_BY_NAME;

		return(
			<MenuList>
				{TEAMSPACES_PANEL_ACTIONS_MENU.map(({ sortingType, label, Icon }) => {
					const isDesc = {
						[SORTING_BY_NAME]: nameSortingDescending,
						[SORTING_BY_LAST_UPDATED]: dateSortingDescending
					};

					return(
						<StyledListItem key={label} button onClick={() => this.handleSortingItemClick(sortingType, isNameSortingActive)}>
							<StyledItemText>
								<Action>
									<SortingIcon Icon={Icon} isDesc={isDesc[sortingType]} />
									<Label>{label}</Label>
								</Action>
								{(activeSorting === sortingType) && <Check fontSize="small" />}
							</StyledItemText>
						</StyledListItem>
					);
				})}
			</MenuList>
		);
	}

	public getPanelMenuButton = () => {
		return (
			<ButtonMenu
				renderButton={PanelMenuButton}
				renderContent={() => {
					return this.renderActionsMenu();
				}}
			/>
		);
	}

	private handleCloseSearchMode = () => {
		this.props.setState({ searchEnabled: false, selectedFilters: [] });
	}

	private handleOpenSearchMode = () => {
		this.props.setState({ searchEnabled: true });
	}

	private handleFilterChange = (selectedFilters) => {
		this.props.setState({ selectedFilters });
	}

	private handleDataTypeChange = (selectedDataTypes) => {
		this.props.setState({ selectedDataTypes });
	}

	private renderActions = () => {
		return (
			<>
				{this.getSearchButton()}
				{this.getPanelMenuButton()}
			</>
		);
	}

	private renderFilterPanel = renderWhenTrue(() => (
		<FilterPanel
			onChange={this.handleFilterChange}
			onDataTypeChange={this.handleDataTypeChange}
			filters={this.filters}
			selectedFilters={this.props.selectedFilters}
			selectedDataTypes={this.props.selectedDataTypes}
			dataTypes={TEAMSPACES_DATA_TYPES}
			left
		/>
	));

	private getStarredVisibleItems = () => {
		const visibleItemsMap = {};

		Object.keys(this.props.starredModelsMap).forEach((starredKey) => {
			const [ teamspace, modelId ] = starredKey.split('/');
			visibleItemsMap[teamspace] = true;

			if (this.props.modelsMap[modelId]) {
				visibleItemsMap[this.props.modelsMap[modelId].projectName] = true;
			}
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

	private renderModels = (models) => renderWhenTrue(() => {
		const sortedModels = sortModels(models, this.props.activeSorting, this.props.activeSortingDirection);

		return sortedModels.map((props: any) => (
			<ModelGridItem
				{...props}
				key={props.model}
				query={this.searchQuery}
			/>
		));
	})(models.length)

	private renderProjectContainer = (models, project) => renderWhenTrue(() => (
		<GridContainer  key={`container-${project.id}`} id={`models-container-${encodeElementId(project.name)}`}>
			{this.renderAddModelGridItem(project.teamspace, project.id)}
			{this.renderModels(models)}
		</GridContainer>
	))(this.state.visibleItems[project.id] && (!this.props.showStarredOnly || project.models.length))

	private renderProject = (props) => ([
		(
			<ProjectItem
				{...props}
				active={this.state.visibleItems[props.id]}
				key={props._id}
				isEmpty={!props.models.length}
				query={this.searchQuery}
				onClick={this.handleVisibilityChange}
				showStarredOnly={this.props.showStarredOnly}
			/>
		),
		this.renderProjectContainer(props.models, props),
	])

	private renderTeamspace = (props) => (
		<TeamspaceItem
			{...props}
			key={props.account}
			highlightedTextkey={props.account}
			name={props.account}
			active={this.state.visibleItems[props.account] && props.projects.length}
			isMyTeamspace={this.props.currentTeamspace === props.account}
			onToggle={this.handleVisibilityChange}
			onAddProject={this.openProjectDialog}
			disabled={!props.projects.length}
			showStarredOnly={this.props.showStarredOnly}
			onLeaveTeamspace={this.onLeaveTeamspace(props.account)}
			history={this.props.history}
		/>
	)

	private renderMenuButton = (isPending, props) => (
		<MenuButton
			buttonRef={props.buttonRef}
			color="secondary"
			aria-label="Toggle menu"
			aria-haspopup="true"
			size="small"
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

	public renderEmptyState = renderWhenTrue(() => (
		<EmptyStateInfo>No favourites models have been added yet</EmptyStateInfo>
	));

	public renderMyTeamspace = () => {
		return this.props.items
			.slice(0, this.myTeamspace.projects.length + 1)
			.filter(this.shouldBeVisible)
			.map(this.renderListItem);
	}

	public renderOtherTeamspaces = () => {
		return (
			<>
				<OtherTeamspacesLabel>Other Teamspaces:</OtherTeamspacesLabel>
				{this.props.items
					.slice(this.myTeamspace.projects.length + 1)
					.filter(this.shouldBeVisible)
					.map(this.renderListItem)}
			</>
		);
	}

	private renderList = renderWhenTrue(() => (
		<BodyWrapper>
			<Body>
				<SimpleBar>
					{this.renderMyTeamspace()}
					{this.renderOtherTeamspaces()}
				</SimpleBar>
			</Body>
		</BodyWrapper>
	));

	public render() {
		const { isPending, showStarredOnly, searchEnabled } = this.props;

		return (
			<ViewerPanel
				title="Models & Federations"
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
						<StyledTab label="All" />
						<StyledTab label="Favourites" />
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
					{this.renderList(!isPending && this.props.items.length)}
					{this.renderEmptyState(!isPending && showStarredOnly && !this.props.starredModelsMap.length)}
				</List>
			</ViewerPanel>
		);
	}
}
