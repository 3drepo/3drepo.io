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

import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import ArrowBack from '@material-ui/icons/ArrowBack';
import CancelIcon from '@material-ui/icons/Cancel';
import Check from '@material-ui/icons/Check';
import Delete from '@material-ui/icons/Delete';
import InvertColors from '@material-ui/icons/InvertColors';
import SearchIcon from '@material-ui/icons/Search';
import Visibility from '@material-ui/icons/VisibilityOutlined';
import { isEmpty, isEqual, size, stubTrue } from 'lodash';
import React from 'react';

import {
	DEFAULT_OVERRIDE_COLOR,
	GROUP_PANEL_NAME,
	GROUPS_ACTIONS_ITEMS,
	GROUPS_ACTIONS_MENU
} from '../../../../constants/groups';
import { CREATE_ISSUE } from '../../../../constants/issue-permissions';
import { VIEWER_EVENTS } from '../../../../constants/viewer';
import { hexToRgba } from '../../../../helpers/colors';
import { hasPermissions } from '../../../../helpers/permissions';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { searchByFilters } from '../../../../helpers/searching';
import { ButtonMenu } from '../../../components/buttonMenu/buttonMenu.component';
import {
	IconWrapper,
	MenuList,
	StyledItemText,
	StyledListItem
} from '../../../components/filterPanel/components/filtersMenu/filtersMenu.styles';
import { FilterPanel } from '../../../components/filterPanel/filterPanel.component';
import { MenuButton as MenuButtonComponent } from '../../../components/menuButton/menuButton.component';
import { TooltipButton } from '../../../teamspaces/components/tooltipButton/tooltipButton.component';
import { ListNavigation } from '../listNavigation/listNavigation.component';
import { ViewerPanelButton, ViewerPanelContent, ViewerPanelFooter } from '../viewerPanel/viewerPanel.styles';
import { EmptyStateInfo } from '../views/views.styles';
import { ListContainer, Summary } from './../risks/risks.styles';
import { GroupDetails } from './components/groupDetails';
import { GroupsContainer, GroupIcon, GroupListItem, StyledIcon } from './groups.styles';

interface IProps {
	viewer: any;
	teamspace: string;
	model: any;
	revision?: string;
	isAllOverridden: boolean;
	isPending?: boolean;
	showDetails?: boolean;
	groups: any[];
	groupsMap: any;
	activeGroupId: string;
	highlightedGroups: any;
	searchEnabled: boolean;
	selectedFilters: any[];
	colorOverrides: any;
	modelSettings: any;
	isModelLoaded: boolean;
	setState: (componentState: any) => void;
	setNewGroup: () => void;
	showGroupDetails: (group, revision?) => void;
	closeDetails: () => void;
	setActiveGroup: (group, revision?) => void;
	saveGroup: (teamspace, model, group) => void;
	toggleColorOverride: (group) => void;
	setOverrideAll: (overrideAll) => void;
	deleteGroups: (teamspace, model, groups) => void;
	showConfirmDialog: (config) => void;
	isolateGroup: (group) => void;
	downloadGroups: (teamspace, model) => void;
	resetToSavedSelection: (groupId) => void;
	resetActiveGroup: () => void;
	subscribeOnChanges: (teamspace, modelId) => void;
	unsubscribeFromChanges: (teamspace, modelId) => void;
}

interface IState {
	filteredGroups: any[];
}

const MenuButton = (props) => <MenuButtonComponent ariaLabel="Show groups menu" {...props} />;

export class Groups extends React.PureComponent<IProps, IState> {

	get filteredGroups() {
		const { groups, selectedFilters } = this.props;
		return searchByFilters(groups, selectedFilters, false);
	}

	get filters() {
		return [];
	}

	get menuActionsMap() {
		const { setOverrideAll, teamspace, model, downloadGroups, isAllOverridden } = this.props;
		return {
			[GROUPS_ACTIONS_ITEMS.OVERRIDE_ALL]: () => setOverrideAll(!isAllOverridden),
			[GROUPS_ACTIONS_ITEMS.DELETE_ALL]: () => this.handleDeleteGroups(),
			[GROUPS_ACTIONS_ITEMS.DOWNLOAD]: () => downloadGroups(teamspace, model)
		};
	}

	get overridesAllGroups() {
		const { groups, colorOverrides } = this.props;
		return Boolean(groups.length) && groups.length === size(colorOverrides);
	}

	public get canAddOrUpdate() {
		const { isModelLoaded, modelSettings } = this.props;
		if (isModelLoaded && modelSettings && modelSettings.permissions) {
			return hasPermissions(CREATE_ISSUE, modelSettings.permissions);
		}
		return false;
	}
	public state = {
		filteredGroups: []
	};

	public groupsContainerRef = React.createRef<any>();

	public renderHeaderNavigation = renderWhenTrue(() => {
		const initialIndex = this.state.filteredGroups.findIndex(({ _id }) => this.props.activeGroupId === _id);

		return (
			<ListNavigation
				initialIndex={initialIndex}
				lastIndex={this.state.filteredGroups.length - 1}
				onChange={this.handleNavigationChange}
			/>
		);
	});

	public renderGroupsList = renderWhenTrue(() => {
		const Items = this.state.filteredGroups.map((group) => (
			<GroupListItem
					{...group}
					key={group._id}
					hideThumbnail
					statusColor={this.getOverriddenColor(group._id, group.color)}
					highlighted={this.isHighlighted(group)}
					roleColor={group.color}
					onItemClick={this.setActiveGroup(group)}
					onArrowClick={this.handleShowGroupDetails(group)}
					active={this.isActive(group)}
					modelLoaded={this.props.isModelLoaded}
					renderActions={this.renderGroupActions(group)}
					hasViewPermission={stubTrue}
					panelName={GROUP_PANEL_NAME}
					extraInfo={this.renderObjectsNumber(group.totalSavedMeshes)}
			/>
		));

		return <ListContainer className="groups-list" ref={this.groupsContainerRef}>{Items}</ListContainer>;
	});

	public renderEmptyState = renderWhenTrue(() => (
		<EmptyStateInfo>No groups have been created yet</EmptyStateInfo>
	));

	public renderNotFound = renderWhenTrue(() => (
		<EmptyStateInfo>No groups matched</EmptyStateInfo>
	));

	public renderListView = renderWhenTrue(() => (
		<>
			<ViewerPanelContent>
				{this.renderEmptyState(!this.props.searchEnabled && !this.state.filteredGroups.length)}
				{this.renderNotFound(this.props.searchEnabled && !this.state.filteredGroups.length)}
				{this.renderGroupsList(this.state.filteredGroups.length)}
			</ViewerPanelContent>
			<ViewerPanelFooter alignItems="center" justify="space-between">
				<Summary>
					{`${this.state.filteredGroups.length} groups displayed`}
				</Summary>
				<ViewerPanelButton
					aria-label="Add group"
					onClick={this.props.setNewGroup}
					color="secondary"
					variant="fab"
					disabled={!this.canAddOrUpdate}
				>
					<AddIcon />
				</ViewerPanelButton>
			</ViewerPanelFooter>
		</>
	)
	);

	public renderFilterPanel = renderWhenTrue(() => (
		<FilterPanel
			filters={this.filters}
			onChange={this.handleFilterChange}
			selectedFilters={this.props.selectedFilters}
			hideMenu
		/>
	));

	public renderDetailsView = renderWhenTrue(() => (
		<GroupDetails
			teamspace={this.props.teamspace}
			model={this.props.model}
			revision={this.props.revision}
			saveGroup={this.props.saveGroup}
			resetToSavedSelection={this.handleResetToSavedSelection}
			canUpdate={this.canAddOrUpdate}
		/>
	));

	public componentDidMount() {
		const { subscribeOnChanges, teamspace, model } = this.props;

		this.setState({ filteredGroups: this.filteredGroups });

		this.toggleViewerEvents();
		subscribeOnChanges(teamspace, model);
	}

	public componentDidUpdate(prevProps, prevState) {
		const { groups, selectedFilters, activeGroupId } = this.props;
		const groupsChanged = !isEqual(prevProps.groups, groups);
		const filtersChanged = prevProps.selectedFilters.length !== selectedFilters.length;

		const changes = {} as IState;

		if (groupsChanged || filtersChanged) {
			changes.filteredGroups = this.filteredGroups;
		}

		if (filtersChanged && activeGroupId) {
			const isSelectedGroupVisible = prevState.filteredGroups.some(({ _id }) => {
				return _id === activeGroupId;
			});

			if (!isSelectedGroupVisible) {
				this.resetActiveGroup();
			}
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public componentWillUnmount() {
		const { teamspace, model, unsubscribeFromChanges } = this.props;
		unsubscribeFromChanges(teamspace, model);
		this.toggleViewerEvents(false);
	}

	public resetActiveGroup = () => {
		this.props.resetActiveGroup();
	}

	public toggleViewerEvents = (enabled = true) => {
		const eventHandler = enabled ? 'on' : 'off';
		this.props.viewer[eventHandler](VIEWER_EVENTS.BACKGROUND_SELECTED, this.resetActiveGroup);
	}

	public getOverriddenColor = (groupId, color) => {
		const overridden = this.isOverridden(groupId);
		return overridden ? hexToRgba(color) : DEFAULT_OVERRIDE_COLOR;
	}

	public handleCloseSearchMode = () => {
		this.props.setState({ searchEnabled: false, selectedFilters: [] });
	}

	public handleOpenSearchMode = () => {
		this.props.setState({ searchEnabled: true });
	}

	public getSearchButton = () => {
		if (this.props.searchEnabled) {
			return <IconButton onClick={this.handleCloseSearchMode}><CancelIcon /></IconButton>;
		}
		return <IconButton onClick={this.handleOpenSearchMode}><SearchIcon /></IconButton>;
	}

	public renderTitleIcon = () => {
		if (this.props.showDetails) {
			return (
				<IconButton onClick={this.props.closeDetails}>
					<ArrowBack />
				</IconButton>
			);
		}
		return <GroupIcon />;
	}

	public handleDeleteGroups = () => {
		const { groups, deleteGroups, teamspace, model } = this.props;

		this.props.showConfirmDialog({
			title: 'Delete groups',
			content: `Delete all groups?`,
			onConfirm: () => {
				const allGroups = groups.map((group) => group._id).join(',');
				deleteGroups(teamspace, model, allGroups);
			}
		});
	}

	public renderActionsMenu = () => (
		<MenuList>
			{GROUPS_ACTIONS_MENU.map(({ name, Icon, label }) => {
				return (
					<StyledListItem key={name} button onClick={this.menuActionsMap[name]}>
						<IconWrapper><Icon fontSize="small" /></IconWrapper>
						<StyledItemText>
							{label}
							{(name === GROUPS_ACTIONS_ITEMS.OVERRIDE_ALL && this.props.isAllOverridden) && <Check fontSize="small" />}
						</StyledItemText>
					</StyledListItem>
				);
			})}
		</MenuList>
	)

	public getMenuButton = () => (
		<ButtonMenu
			renderButton={MenuButton}
			renderContent={this.renderActionsMenu}
			PaperProps={{ style: { overflow: 'initial', boxShadow: 'none' } }}
			PopoverProps={{ anchorOrigin: { vertical: 'center', horizontal: 'left' } }}
			ButtonProps={{ disabled: false }}
		/>
	)

	public handleNavigationChange = (currentIndex) => {
		this.props.showGroupDetails(this.state.filteredGroups[currentIndex], this.props.revision);
	}

	public renderActions = () => {
		if (this.props.showDetails) {
			return this.renderHeaderNavigation(this.props.activeGroupId && this.state.filteredGroups.length >= 2);
		}

		return (
			<>
				{this.getSearchButton()}
				{this.getMenuButton()}
			</>
		);
	}

	public setActiveGroup = (group) => () => {
		this.props.setActiveGroup(group);
	}

	public handleShowGroupDetails = (group) => () => {
		this.props.showGroupDetails(group, this.props.revision);
	}

	public isOverridden = (groupId) => this.props.colorOverrides.includes(groupId);

	public isHighlighted = (group) => {
		return Boolean(this.props.highlightedGroups[group._id]);
	}

	public isActive = (group) => {
		return this.props.activeGroupId === group._id;
	}

	public handleGroupDelete = (groupId) => () => {
		const { teamspace, model, deleteGroups } = this.props;
		deleteGroups(teamspace, model, groupId);
	}

	public handleColorOverride = (group) => () => this.props.toggleColorOverride(group._id);

	public handleGroupIsolate = (group) => () => this.props.isolateGroup(group);

	public renderGroupActions = (group) => () => (
		<>
			<TooltipButton
				label="Isolate"
				action={this.handleGroupIsolate(group)}
				Icon={Visibility}
				disabled={!this.props.isModelLoaded}
			/>
			<TooltipButton
				label="Toggle Colour Override"
				action={this.handleColorOverride(group)}
				Icon={this.renderTintIcon(group)}
				disabled={!this.props.isModelLoaded}
			/>
			<TooltipButton
				label="Delete"
				action={this.handleGroupDelete(group._id)}
				Icon={Delete}
				disabled={!this.props.isModelLoaded}
			/>
		</>
	)

	public renderTintIcon = (group) => () => (
		<StyledIcon color={this.getOverriddenColor(group._id, group.color)}>
			<InvertColors color="inherit" fontSize="inherit" />
		</StyledIcon>
	)

	public renderObjectsNumber = (objectsNumber) => {
		if (objectsNumber === 1) {
			return `${objectsNumber} object`;
		}
		return `${objectsNumber} objects`;
	}

	public handleFilterChange = (selectedFilters) => {
		this.props.setState({ selectedFilters });
		this.setState({ filteredGroups: this.filteredGroups });
	}

	public handleSaveGroup = (teamspace, model, group) => {
		this.props.saveGroup(teamspace, model, group);
	}

	public handleResetToSavedSelection = () => {
		this.props.resetToSavedSelection(this.props.activeGroupId);
	}

	public render() {
		return (
			<GroupsContainer
				Icon={this.renderTitleIcon()}
				renderActions={this.renderActions}
				pending={this.props.isPending}
			>
				{this.renderFilterPanel(this.props.searchEnabled && !this.props.showDetails)}
				{this.renderListView(!this.props.showDetails)}
				{this.renderDetailsView(this.props.showDetails)}
			</GroupsContainer>
		);
	}
}
