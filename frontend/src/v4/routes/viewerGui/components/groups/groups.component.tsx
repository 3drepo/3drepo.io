/**
 *  Copyright (C) 2020 3D Repo Ltd
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
import { PureComponent, createRef, SyntheticEvent, MouseEvent } from 'react';
import fileDialog from 'file-dialog';

import { FormattedMessage } from 'react-intl';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Check from '@mui/icons-material/Check';
import InvertColors from '@mui/icons-material/InvertColors';
import Visibility from '@mui/icons-material/VisibilityOutlined';
import { isEmpty, isEqual, size, stubTrue } from 'lodash';

import { GroupsListComponent } from '@/v5/ui/routes/viewer/groups/groupsList.component';
import { getSortedGroups } from '@/v5/ui/routes/viewer/groups/groupsList.helpers';
import {
	DEFAULT_OVERRIDE_COLOR,
	GROUP_PANEL_NAME,
	GROUPS_ACTIONS_ITEMS,
	GROUPS_ACTIONS_MENU
} from '../../../../constants/groups';
import { CREATE_ISSUE } from '../../../../constants/issue-permissions';
import { VIEWER_EVENTS } from '../../../../constants/viewer';
import { VIEWER_PANELS } from '../../../../constants/viewerGui';
import { hasPermissions } from '../../../../helpers/permissions';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { searchByFilters } from '../../../../helpers/searching';
import { EmptyStateInfo } from '../../../components/components.styles';
import {
	IconWrapper,
	MenuList,
	StyledItemText,
	StyledListItem
} from '../../../components/filterPanel/components/filtersMenu/filtersMenu.styles';
import { FilterPanel } from '../../../components/filterPanel/filterPanel.component';
import { ListNavigation } from '../listNavigation/listNavigation.component';
import { PanelBarActions } from '../panelBarActions';
import { ViewerPanelButton, ViewerPanelContent, ViewerPanelFooter } from '../viewerPanel/viewerPanel.styles';
import { Summary } from '../reportedItems/reportedItems.styles';
import { GroupDetails } from './components/groupDetails';
import { GroupsContainer, GroupIcon } from './groups.styles';

interface IProps {
	viewer: any;
	teamspace: string;
	model: any;
	revision?: string;
	isAllOverridden: boolean;
	showSmart: boolean;
	showStandard: boolean;
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
	showGroupDetails: (group) => void;
	closeDetails: () => void;
	setActiveGroup: (group) => void;
	saveGroup: (teamspace, model, group) => void;
	toggleColorOverride: (group) => void;
	setOverrideAll: (overrideAll) => void;
	setShowSmartGroups: (enabled) => void;
	setShowStandardGroups: (enabled) => void;
	deleteGroups: (teamspace, model, groups) => void;
	showConfirmDialog: (config) => void;
	downloadGroups: (teamspace, model) => void;
	exportGroups: (teamspace, model) => void;
	importGroups: (teamspace, model, file) => void;
	resetToSavedSelection: (groupId) => void;
	resetActiveGroup: () => void;
	subscribeOnChanges: (teamspace, modelId) => void;
	unsubscribeFromChanges: (teamspace, modelId) => void;
	id?: string	;
}

interface IState {
	collapse: object;
	groups: any[];
}

export class Groups extends PureComponent<IProps, IState> {
	public state = {
		collapse: {},
		groups: [],
	};

	get type() {
		return VIEWER_PANELS.GROUPS;
	}

	get filters() {
		return [];
	}

	get menuActionsMap() {
		const {
			setOverrideAll, setShowStandardGroups, setShowSmartGroups,
			teamspace, 	model,
			downloadGroups, exportGroups, importGroups,
			isAllOverridden, showStandard, showSmart
		} = this.props;

		return {
			[GROUPS_ACTIONS_ITEMS.SHOW_STANDARD]: () => setShowStandardGroups(!showStandard),
			[GROUPS_ACTIONS_ITEMS.SHOW_SMART]: () => setShowSmartGroups(!showSmart),
			[GROUPS_ACTIONS_ITEMS.EXPORT]: () => exportGroups(teamspace, model),
			[GROUPS_ACTIONS_ITEMS.IMPORT]: () => fileDialog({accept: '.json'}, (files) => importGroups(teamspace, model, files[0])),
			[GROUPS_ACTIONS_ITEMS.OVERRIDE_ALL]: () => setOverrideAll(!isAllOverridden),
			[GROUPS_ACTIONS_ITEMS.DELETE_ALL]: () => this.handleDeleteGroups(),
			[GROUPS_ACTIONS_ITEMS.DOWNLOAD]: () => downloadGroups(teamspace, model),
		};
	}

	get overridesAllGroups() {
		const { colorOverrides } = this.props;
		return Boolean(this.state.groups.length) && this.state.groups.length === size(colorOverrides);
	}

	public get canAddOrUpdate() {
		const { isModelLoaded, modelSettings } = this.props;
		if (isModelLoaded && modelSettings && modelSettings.permissions) {
			return hasPermissions(CREATE_ISSUE, modelSettings.permissions);
		}
		return false;
	}
	public groupsContainerRef = createRef<any>();

	public renderHeaderNavigation = () => {
		const initialIndex = this.state.groups.findIndex(({ _id }) => this.props.activeGroupId === _id);

		return (
			<ListNavigation
				panelType={this.type}
				initialIndex={initialIndex}
				itemsCount={this.state.groups.length}
				onChange={this.handleNavigationChange}
			/>
		);
	}

	public renderGroupsList = renderWhenTrue(() =>
		<GroupsListComponent
			groups={this.state.groups}
			collapse={[this.state.collapse, (collapse) => this.setState({ ...this.state, collapse })]}
			disabled={!this.props.isModelLoaded}
		/>
	);

	public renderEmptyState = renderWhenTrue(() => (
		<EmptyStateInfo>No groups have been created yet</EmptyStateInfo>
	));

	public renderNotFound = renderWhenTrue(() => (
		<EmptyStateInfo>No groups matched</EmptyStateInfo>
	));

	public renderListView = renderWhenTrue(() => (
		<>
			<ViewerPanelContent onClick={this.resetActiveGroup}>
				<div onClick={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()}>
					{this.renderEmptyState(!this.props.searchEnabled && !this.state.groups.length)}
					{this.renderNotFound(this.props.searchEnabled && !this.state.groups.length)}
					{this.renderGroupsList(this.state.groups.length)}
				</div>
			</ViewerPanelContent>
			<ViewerPanelFooter onClick={this.resetActiveGroup} container alignItems="center" justifyContent="space-between">
				<Summary>
					<FormattedMessage
						id="groups.list.numberOfGroups"
						defaultMessage="{groups, plural, =0 {No groups displayed} one {# group displayed} other {# groups displayed}}"
						values={{ groups: this.state.groups.length }}
					/>
				</Summary>
				<ViewerPanelButton
					aria-label="Add group"
					onClick={(e) => {
						e.stopPropagation();
						this.props.setNewGroup();
					}}
					color="secondary"
					variant="fab"
					disabled={!this.canAddOrUpdate}
					id={this.props.id + '-add-new-button'}
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
			resetToSavedSelection={this.handleResetToSavedSelection}
			canUpdate={this.canAddOrUpdate}
			deleteGroup={this.handleGroupDelete}
		/>
	));

	public componentDidMount() {
		const { subscribeOnChanges, teamspace, model } = this.props;
		this.toggleViewerEvents();
		subscribeOnChanges(teamspace, model);
		this.setState({ ...this.state, groups: getSortedGroups(this.props.groups) });
	}

	public componentDidUpdate(prevProps, prevState) {
		const { groups, selectedFilters, activeGroupId } = this.props;
		const groupsChanged = !isEqual(prevProps.groups, groups);
		const filtersChanged = prevProps.selectedFilters.length !== selectedFilters.length;

		if (groupsChanged) {
			this.setState({ ...this.state, groups: getSortedGroups(this.props.groups) });
		}

		if (filtersChanged && activeGroupId) {
			const isSelectedGroupVisible = prevProps.groups.some(({ _id }) => {
				return _id === activeGroupId;
			});

			if (!isSelectedGroupVisible) {
				this.resetActiveGroup();
			}
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
		if (this.props.viewer) {
		this.props.viewer[eventHandler](VIEWER_EVENTS.BACKGROUND_SELECTED, this.resetActiveGroup);
		}
	}

	public handleCloseSearchMode = () => {
		this.props.setState({ ...this.state, searchEnabled: false, selectedFilters: [] });
	}

	public handleOpenSearchMode = () => {
		this.props.setState({ ...this.state, searchEnabled: true });
	}

	public renderTitleIcon = () => {
		if (this.props.showDetails) {
			return (
                <IconButton onClick={this.props.closeDetails} size="large">
					<ArrowBack />
				</IconButton>
            );
		}
		return <GroupIcon />;
	}

	public handleDeleteGroups = () => {
		const { deleteGroups, teamspace, model } = this.props;

		this.props.showConfirmDialog({
			title: 'Delete groups',
			content: `Delete all groups?`,
			onConfirm: () => {
				const allGroups = this.state.groups.map((group) => group._id).join(',');
				deleteGroups(teamspace, model, allGroups);
			}
		});
	}

	public renderActionsMenu = () => {
		const shouldDisble = (name) => {
			if (!this.canAddOrUpdate && [GROUPS_ACTIONS_ITEMS.DELETE_ALL, GROUPS_ACTIONS_ITEMS.IMPORT].includes(name)) {
				return true;
			}

			const optionsToDisableWhenGroupsIsEmpty = [
				GROUPS_ACTIONS_ITEMS.DELETE_ALL,
				GROUPS_ACTIONS_ITEMS.EXPORT,
				GROUPS_ACTIONS_ITEMS.OVERRIDE_ALL,
				GROUPS_ACTIONS_ITEMS.DOWNLOAD,
			]
			return !this.state.groups.length && optionsToDisableWhenGroupsIsEmpty.includes(name);
		}
		return (
			<MenuList>
				{GROUPS_ACTIONS_MENU.map(({ name, Icon, label }) => {
					return (
						<StyledListItem key={name} onClick={this.menuActionsMap[name]} disabled={shouldDisble(name)}>
							<IconWrapper><Icon fontSize="small" /></IconWrapper>
							<StyledItemText>
								{label}
								{(name === GROUPS_ACTIONS_ITEMS.OVERRIDE_ALL && this.props.isAllOverridden) && <Check fontSize="small" />}
								{(name === GROUPS_ACTIONS_ITEMS.SHOW_SMART && this.props.showSmart) && <Check fontSize="small" />}
								{(name === GROUPS_ACTIONS_ITEMS.SHOW_STANDARD && this.props.showStandard) && <Check fontSize="small" />}
							</StyledItemText>
						</StyledListItem>
					);
				})}
			</MenuList>
		);
	}

	public handleNavigationChange = (currentIndex) => {
		this.props.showGroupDetails(this.state.groups[currentIndex]);
	}

	public renderActions = () => {
		if (this.props.showDetails) {
			const canBeNavigated = this.props.activeGroupId && this.state.groups.length >= 2;
			return canBeNavigated ?
					this.renderHeaderNavigation() : <PanelBarActions type={this.type} hideSearch hideMenu />;
		}

		return (
			<PanelBarActions
				type={this.type}
				menuLabel="Show groups menu"
				menuActions={this.renderActionsMenu}
				isSearchEnabled={this.props.searchEnabled}
				onSearchOpen={this.handleOpenSearchMode}
				onSearchClose={this.handleCloseSearchMode}
			/>
		);
	}

	public isHighlighted = (group) => {
		return Boolean(this.props.highlightedGroups.has(group._id));
	}

	public isActive = (group) => {
		return this.props.activeGroupId === group._id;
	}

	public handleGroupDelete = (id) => {
		const { teamspace, model, deleteGroups, closeDetails } = this.props;
		if (id) {
			deleteGroups(teamspace, model, id);
		} else {
			closeDetails();
		}
	}

	public handleFilterChange = (selectedFilters) => {
		this.props.setState({ ...this.state, selectedFilters });
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
				id={this.props.id + (this.props.showDetails ? '-details' : '' )}
			>
				{this.renderFilterPanel(this.props.searchEnabled && !this.props.showDetails)}
				{this.renderListView(!this.props.showDetails)}
				{this.renderDetailsView(this.props.showDetails)}
			</GroupsContainer>
		);
	}
}
