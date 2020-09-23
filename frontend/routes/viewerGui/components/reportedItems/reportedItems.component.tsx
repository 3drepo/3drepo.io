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

import React from 'react';

import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import ArrowBack from '@material-ui/icons/ArrowBack';
import Check from '@material-ui/icons/Check';
import { isEmpty, isEqual } from 'lodash';

import { CREATE_ISSUE, VIEW_ISSUE } from '../../../../constants/issue-permissions';
import { hasPermissions } from '../../../../helpers/permissions';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { searchByFilters } from '../../../../helpers/searching';
import { sortByDate } from '../../../../helpers/sorting';
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
import { PreviewListItem } from '../previewListItem/previewListItem.component';
import { ListContainer, Summary } from '../risks/risks.styles';
import { ViewerPanel } from '../viewerPanel/viewerPanel.component';
import { ViewerPanelButton, ViewerPanelContent, ViewerPanelFooter } from '../viewerPanel/viewerPanel.styles';

interface IHeaderMenuItem {
	label: string;
	enabled?: boolean;
	Icon?: any;
	isSorting?: boolean;
	onClick?: (event?) => void;
}

interface IProps {
	className?: string;
	type: string;
	items: any[];
	searchEnabled: boolean;
	selectedFilters: any[];
	permissions: any[];
	filters: any[];
	headerMenuItems: IHeaderMenuItem[];
	activeItemId?: string;
	showDefaultHiddenItems: boolean;
	isModelLoaded: boolean;
	title?: string;
	isPending?: boolean;
	revision?: string;
	fetchingDetailsIsPending?: boolean;
	showDetails?: boolean;
	Icon?: any;
	isImportingBCF?: boolean;
	sortOrder?: string;
	setState: (componentState: any) => void;
	onNewItem: () => void;
	onActiveItem: (item) => void;
	onShowDetails: (item) => void;
	onCloseDetails: () => void;
	onToggleFilters: (isActive) => void;
	onChangeFilters: (selectedFilters) => void;
	toggleShowPins: (showPins: boolean, filteredItems) => void;
	renderDetailsView: (statement) => React.ReactChildren[];
}

interface IState {
	filteredItems: any[];
	prevScroll: number;
}

export class ReportedItems extends React.PureComponent<IProps, IState> {

	get activeItemIndex() {
		return this.state.filteredItems.findIndex((item) => item._id === this.props.activeItemId);
	}

	get filteredItems() {
		const { items, selectedFilters, showDefaultHiddenItems } = this.props;
		return sortByDate(
			searchByFilters(items, selectedFilters, showDefaultHiddenItems, ['name', 'desc', 'number']),
			{ order: this.props.sortOrder }
		);
	}

	get listFooterText() {
		if (this.props.isImportingBCF) {
			return 'Uploading BCF...';
		}
		if (this.props.isModelLoaded) {
			return `${this.state.filteredItems.length} results displayed`;
		}
		return 'Model is loading';
	}
	public state = {
		filteredItems: [],
		prevScroll: 0
	};

	public listViewRef = React.createRef<HTMLElement>();
	public listContainerRef = React.createRef<any>();

	public renderItemsList = renderWhenTrue(() => (
		<ListContainer ref={this.listContainerRef}>
			{this.state.filteredItems.map((item, index) => (
				<PreviewListItem
					{...item}
					key={index}
					onItemClick={this.handleItemFocus(item)}
					onArrowClick={this.handleShowItemDetails(item)}
					active={this.props.activeItemId === item._id}
					hasViewPermission={this.hasPermission(VIEW_ISSUE)}
					modelLoaded={this.props.isModelLoaded}
					panelName={this.props.type}
				/>
			))}
		</ListContainer>
	));

	public renderListView = renderWhenTrue(() => (
		<>
			<ViewerPanelContent ref={this.listViewRef}>
				{this.renderEmptyState(!this.props.searchEnabled && !this.state.filteredItems.length)}
				{this.renderNotFound(this.props.searchEnabled && !this.state.filteredItems.length)}
				{this.renderItemsList(this.state.filteredItems.length)}
			</ViewerPanelContent>
			<ViewerPanelFooter alignItems="center" justify="space-between">
				<Summary>{this.listFooterText}</Summary>
				<ViewerPanelButton
					aria-label="Add item"
					onClick={this.handleAddNewItem}
					color="secondary"
					variant="fab"
					disabled={!this.hasPermission(CREATE_ISSUE) || !this.props.isModelLoaded}
				>
					<AddIcon />
				</ViewerPanelButton>
			</ViewerPanelFooter>
		</>
	));

	public renderFilterPanel = renderWhenTrue(() => (
		<FilterPanel
			onChange={this.props.onChangeFilters}
			filters={this.props.filters as any}
			selectedFilters={this.props.selectedFilters}
		/>
	));

	public renderHeaderNavigation = () => {
		const initialIndex = this.state.filteredItems.findIndex(({ _id }) => this.props.activeItemId === _id);
		return (
			<ListNavigation
				panelType={this.props.type}
				initialIndex={initialIndex}
				lastIndex={this.state.filteredItems.length - 1}
				onChange={this.handleNavigationChange}
			/>
		);
	}

	public renderEmptyState = renderWhenTrue(() => (
		<EmptyStateInfo>No entries have been created yet</EmptyStateInfo>
	));

	public renderNotFound = renderWhenTrue(() => (
		<EmptyStateInfo>No entry matched</EmptyStateInfo>
	));

	public componentDidMount() {
		this.setState({ filteredItems: this.filteredItems });
	}

	public componentDidUpdate(prevProps) {
		const { items, selectedFilters, showDefaultHiddenItems, searchEnabled, sortOrder, showDetails } = this.props;
		const itemsChanged = !isEqual(prevProps.items, items);
		const sortingChanged = prevProps.sortOrder !== sortOrder;
		const filtersChanged = prevProps.selectedFilters.length !== selectedFilters.length;
		const showDefaultHiddenItemsChanged = prevProps.showDefaultHiddenItems !== showDefaultHiddenItems;
		const searchEnabledChange = prevProps.searchEnabled !== searchEnabled;
		const detailsWasClosed = prevProps.showDetails !== showDetails && !showDetails;

		const changes = {} as IState;

		if (itemsChanged || filtersChanged || showDefaultHiddenItemsChanged || searchEnabledChange || sortingChanged) {
			changes.filteredItems = this.filteredItems;
		}

		const filteredItems = changes.filteredItems || this.state.filteredItems;
		if (detailsWasClosed && this.listViewRef.current && this.props.activeItemId && filteredItems.length) {
			this.listViewRef.current.scrollTop = this.state.prevScroll;
		}

		if (this.listViewRef.current) {
			this.setState({prevScroll: this.listViewRef.current.scrollTop});
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public hasPermission = (permission) => {
		const { permissions: modelPermissions } = this.props;
		if (modelPermissions) {
			return hasPermissions(permission, modelPermissions);
		}
		return false;
	}

	public getFilterValues(property) {
		return property.map(({ value, name }) => {
			return {
				label: name,
				value
			};
		});
	}

	public handleItemFocus = (item) => () => this.props.onActiveItem(item);
	public handleShowItemDetails = (item) => () => this.props.onShowDetails(item);

	public handleAddNewItem = () => {
		this.props.onNewItem();
	}

	public handleCloseSearchMode = () => {
		this.props.onToggleFilters(false);
		this.props.onChangeFilters([]);
		this.setState({
			filteredItems: this.props.items
		});
	}

	public handleOpenSearchMode = () => this.props.onToggleFilters(true);

	public renderTitleIcon = () => {
		const { showDetails, Icon } = this.props;

		if (showDetails) {
			return (
				<IconButton onClick={this.props.onCloseDetails} >
					<ArrowBack />
				</IconButton>
			);
		}
		return <Icon />;
	}

	public renderSortIcon = (Icon) => {
		if (this.props.sortOrder === 'asc') {
			return <Icon.ASC IconProps={{ fontSize: 'small' }} /> ;
		}
		return <Icon.DESC IconProps={{ fontSize: 'small' }} /> ;
	}

	public renderActionsMenu = () => (
		<MenuList>
			{this.props.headerMenuItems.map(({ label, Icon, onClick, enabled, isSorting }, index) => {
				return (
					<StyledListItem key={index} button onClick={onClick}>
						<IconWrapper>
							{isSorting ? this.renderSortIcon(Icon) : <Icon fontSize="small" />}
						</IconWrapper>
						<StyledItemText>
							{label}
							{enabled && <Check fontSize="small" />}
						</StyledItemText>
					</StyledListItem>
				);
			})}
		</MenuList>
	)

	public handleNavigationChange = (currentIndex) => {
		const itemToShow = this.state.filteredItems[currentIndex] || this.state.filteredItems[0];
		this.props.onShowDetails(itemToShow);
	}

	public renderActions = () => {
		if (this.props.showDetails && this.props.activeItemId) {
			const canBeNavigated = this.state.filteredItems.length > 1 ||
					(this.state.filteredItems.length === 1 && this.state.filteredItems[0]._id !== this.props.activeItemId);
			return canBeNavigated ?
					this.renderHeaderNavigation() : <PanelBarActions type={this.props.type} hideSearch hideMenu />;
		}

		return (
			<PanelBarActions
				type={this.props.type}
				menuLabel="Show filters menu"
				menuActions={this.renderActionsMenu}
				isSearchEnabled={this.props.searchEnabled}
				onSearchOpen={this.handleOpenSearchMode}
				onSearchClose={this.handleCloseSearchMode}
			/>
		);
	}

	public render() {
		const { className, title, isPending, searchEnabled, showDetails } = this.props;

		return (
			<ViewerPanel
				className={className}
				title={title}
				Icon={this.renderTitleIcon()}
				renderActions={this.renderActions}
				pending={isPending}
			>
				{this.renderFilterPanel(searchEnabled && !showDetails)}
				{this.renderListView(!showDetails)}
				{this.props.renderDetailsView(showDetails)}
			</ViewerPanel>
		);
	}
}
