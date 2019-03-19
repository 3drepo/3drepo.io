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
import { isEmpty, isEqual, stubTrue, size } from 'lodash';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import ArrowBack from '@material-ui/icons/ArrowBack';
import CancelIcon from '@material-ui/icons/Cancel';
import Check from '@material-ui/icons/Check';
import GroupWork from '@material-ui/icons/GroupWork';
import MoreIcon from '@material-ui/icons/MoreVert';
import SearchIcon from '@material-ui/icons/Search';
import Delete from '@material-ui/icons/Delete';
import InvertColors from '@material-ui/icons/InvertColors';
import Visibility from '@material-ui/icons/VisibilityOutlined';

import {
	DEFAULT_OVERRIDE_COLOR,
	GROUPS_ACTIONS_ITEMS,
	GROUPS_ACTIONS_MENU,
	GROUP_PANEL_NAME
} from '../../../../constants/groups';
import { CREATE_ISSUE } from '../../../../constants/issue-permissions';
import { VIEWER_EVENTS } from '../../../../constants/viewer';
import { hexToRgba } from '../../../../helpers/colors';
import { hasPermissions } from '../../../../helpers/permissions';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { searchByFilters } from '../../../../helpers/searching';
import { Viewer } from '../../../../services/viewer/viewer';
import { ButtonMenu } from '../../../components/buttonMenu/buttonMenu.component';
import {
	IconWrapper,
	MenuList,
	StyledItemText,
	StyledListItem
} from '../../../components/filterPanel/components/filtersMenu/filtersMenu.styles';
import { FilterPanel } from '../../../components/filterPanel/filterPanel.component';
import { TooltipButton } from '../../../teamspaces/components/tooltipButton/tooltipButton.component';
import { ListNavigation } from '../listNavigation/listNavigation.component';
import { ViewerPanel } from '../viewerPanel/viewerPanel.component';
import { ViewerPanelButton, ViewerPanelContent, ViewerPanelFooter } from '../viewerPanel/viewerPanel.styles';
import { EmptyStateInfo } from '../views/views.styles';
import { ListContainer, Summary } from './../risks/risks.styles';
import { GroupDetails } from './components/groupDetails';
import { GroupListItem, StyledIcon } from './groups.styles';

interface IProps {
	teamspace: string;
	model: any;
	revision?: string;
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
	setState: (componentState: any) => void;
	setNewGroup: () => void;
	showGroupDetails: (group, revision?) => void;
	closeDetails: () => void;
	setActiveGroup: (group, revision?) => void;
	saveGroup: (teamspace, model, group) => void;
	toggleColorOverride: (group) => void;
	toggleColorOverrideAll: (overrideAll) => void;
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
	modelLoaded: boolean;
	filteredGroups: any[];
}

const MenuButton = ({ IconProps, Icon, ...props }) => (
  <IconButton
    {...props}
    aria-label="Show filters menu"
    aria-haspopup="true"
  >
    <MoreIcon {...IconProps} />
  </IconButton>
);

export class Groups extends React.PureComponent<IProps, IState> {
	public state = {
		modelLoaded: false,
		filteredGroups: []
	};

	public groupsContainerRef = React.createRef<any>();

	public componentDidMount() {
		const { subscribeOnChanges, teamspace, model } = this.props;

		this.setState({ filteredGroups: this.filteredGroups });

		if (Viewer.viewer.model && !this.state.modelLoaded) {
			this.setState({ modelLoaded: true });
		}

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

	get filteredGroups() {
		const { groups, selectedFilters } = this.props;
		return searchByFilters(groups, selectedFilters, false);
	}

	get filters() {
		return [];
	}

	get menuActionsMap() {
		const { toggleColorOverrideAll, teamspace, model, downloadGroups } = this.props;
		return {
			[GROUPS_ACTIONS_ITEMS.OVERRIDE_ALL]: () => toggleColorOverrideAll(!this.overridesAllGroups),
			[GROUPS_ACTIONS_ITEMS.DELETE_ALL]: () => this.handleDeleteGroups(),
			[GROUPS_ACTIONS_ITEMS.DOWNLOAD]: () => downloadGroups(teamspace, model)
		};
	}

	get overridesAllGroups() {
		const { groups, colorOverrides } = this.props;
		return Boolean(groups.length) && groups.length === size(colorOverrides);
	}

	public resetActiveGroup = () => {
		this.props.resetActiveGroup();
	}

	public toggleViewerEvents = (enabled = true) => {
		const eventHandler = enabled ? 'on' : 'off';
		Viewer[eventHandler](VIEWER_EVENTS.MODEL_LOADED, () => {
			this.setState({ modelLoaded: true });
		});
		Viewer[eventHandler](VIEWER_EVENTS.BACKGROUND_SELECTED, this.resetActiveGroup);
	}

	public getOverridedColor = (groupId, color) => {
		const overrided = this.isOverrided(groupId);
		return overrided ? hexToRgba(color) : DEFAULT_OVERRIDE_COLOR;
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
		return <GroupWork />;
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
							{(name === GROUPS_ACTIONS_ITEMS.OVERRIDE_ALL && this.overridesAllGroups) && <Check fontSize="small" />}
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

	public isOverrided = (groupId) => Boolean(this.props.colorOverrides[groupId]);

	public get canAddOrUpdate() {
		if (this.props.modelSettings && this.props.modelSettings.permissions) {
			return hasPermissions(CREATE_ISSUE, this.props.modelSettings.permissions) && this.state.modelLoaded;
		}
		return false;
	}

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

	public handleColorOverride = (group) => () => this.props.toggleColorOverride(group);

	public handleGroupIsolate = (group) => () => this.props.isolateGroup(group);

	public renderGroupActions = (group) => () => (
		<>
			<TooltipButton
				label="Isolate"
				action={this.handleGroupIsolate(group)}
				Icon={Visibility}
				disabled={!this.state.modelLoaded}
			/>
			<TooltipButton
				label="Toggle Colour Override"
				action={this.handleColorOverride(group)}
				Icon={this.renderTintIcon(group)}
				disabled={!this.state.modelLoaded}
			/>
			<TooltipButton
				label="Delete"
				action={this.handleGroupDelete(group._id)}
				Icon={Delete}
				disabled={!this.state.modelLoaded}
			/>
		</>
	)

	public renderTintIcon = (group) => () => (
		<StyledIcon color={this.getOverridedColor(group._id, group.color)}>
			<InvertColors color="inherit" fontSize="inherit" />
		</StyledIcon>
	)

	public renderObjectsNumber = (objectsNumber) => {
		if (objectsNumber === 1) {
			return `${objectsNumber} object`;
		}
		return `${objectsNumber} objects`;
	}

	public renderGroupsList = renderWhenTrue(() => {
		const Items = this.state.filteredGroups.map((group) => (
			<GroupListItem
				{...group}
				key={group._id}
				hideThumbnail
				statusColor={this.getOverridedColor(group._id, group.color)}
				highlighted={this.isHighlighted(group)}
				roleColor={group.color}
				onItemClick={this.setActiveGroup(group)}
				onArrowClick={this.handleShowGroupDetails(group)}
				active={this.isActive(group)}
				modelLoaded={this.state.modelLoaded}
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
			<ViewerPanelContent className="height-catcher">
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

  public handleFilterChange = (selectedFilters) => {
		this.props.setState({ selectedFilters });
		this.setState({ filteredGroups: this.filteredGroups });
  }

	public renderFilterPanel = renderWhenTrue(() => (
		<FilterPanel
			filters={this.filters}
			onChange={this.handleFilterChange}
			selectedFilters={this.props.selectedFilters}
			hideMenu={true}
		/>
	));

	public handleSaveGroup = (teamspace, model, group) => {
		this.props.saveGroup(teamspace, model, group);
	}

	public handleResetToSavedSelection = () => {
		this.props.resetToSavedSelection(this.props.activeGroupId);
	}

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

	public render() {
		return (
			<ViewerPanel
				title="Groups"
				Icon={this.renderTitleIcon()}
				renderActions={this.renderActions}
				pending={this.props.isPending}
			>
				{this.renderFilterPanel(this.props.searchEnabled && !this.props.showDetails)}
				{this.renderListView(!this.props.showDetails)}
				{this.renderDetailsView(this.props.showDetails)}
			</ViewerPanel>
		);
	}
}
