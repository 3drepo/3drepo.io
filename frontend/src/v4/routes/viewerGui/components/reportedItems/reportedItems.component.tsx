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
import { PureComponent, ReactChildren, useEffect, useRef } from 'react';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import ArrowBack from '@mui/icons-material/ArrowBack';

import { formatMessage } from '@/v5/services/intl';
import { InvisibleContainer } from '@controls/invisibleContainer/invisibleContainer.styles';
import { CREATE_ISSUE, VIEW_ISSUE } from '../../../../constants/issue-permissions';
import { hasPermissions } from '../../../../helpers/permissions';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { renderActionsMenu, IHeaderMenuItem } from '../../../../helpers/reportedItems';
import { EmptyStateInfo } from '../../../components/components.styles';

import { FilterPanel } from '../../../components/filterPanel/filterPanel.component';
import { ListNavigation } from '../listNavigation/listNavigation.component';
import { PanelBarActions } from '../panelBarActions';
import { PreviewListItem } from '../previewListItem/previewListItem.component';
import { ViewerPanel } from '../viewerPanel/viewerPanel.component';
import { ViewerPanelButton, ViewerPanelContent, ViewerPanelFooter } from '../viewerPanel/viewerPanel.styles';
import { ListContainer, Summary } from './reportedItems.styles';

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
	onDeactivateItem?: () => void;
	onShowDetails: (item) => void;
	onCloseDetails: () => void;
	onToggleFilters: (isActive) => void;
	onChangeFilters: (selectedFilters) => void;
	toggleShowPins: (showPins: boolean) => void;
	renderDetailsView: (statement) => ReactChildren[];
	sortByField?: string;
	id?: string;
}

const PreviewListSingleItem = ({ active, index, ...props }) => {
	const ref = useRef<HTMLDivElement>(undefined);

	useEffect(() => {
		if (active && ref.current) {
			// @ts-expect-error
			ref.current.firstElementChild.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'start' });
		}
	}, [active]);

	return (
		<InvisibleContainer ref={ref}>
			{/* @ts-expect-error */}
			<PreviewListItem {...props} active={active} key={index} />
		</InvisibleContainer>
	);
};

export class ReportedItems extends PureComponent<IProps> {

	get activeItemIndex() {
		return this.props.items.findIndex((item) => item._id === this.props.activeItemId);
	}

	get listFooterText() {
		if (this.props.isImportingBCF) {
			return 'Uploading BCF...';
		}
		if (this.props.isModelLoaded) {
			return formatMessage({
				id: 'reportedItems.numberOfItems',
				defaultMessage: '{items, plural, =0 {No results displayed} one {# result displayed} other {# results displayed}}',
			}, {
				items: this.props.items.length,
			})
		}
		return 'Model is loading';
	}

	public handleClickOutside = () => {
		const { onDeactivateItem } = this.props;

		if (onDeactivateItem) {
			onDeactivateItem();
		}
	}

	public renderItemsList = renderWhenTrue(() => {
		return (
			<ListContainer>
				{this.props.items.map((item, index) => (
					<PreviewListSingleItem
						{...item}
						key={index}
						index={index}
						onItemClick={this.handleItemFocus(item)}
						onArrowClick={this.handleShowItemDetails(item)}
						active={this.props.activeItemId === item._id}
						hasViewPermission={this.hasPermission(VIEW_ISSUE)}
						modelLoaded={this.props.isModelLoaded}
						panelName={this.props.type}
					/>
				))}
			</ListContainer>
		);
	});

	public renderListView = renderWhenTrue(() => (
		<>
			<ViewerPanelContent onClick={this.handleClickOutside}>
				<div onClick={(event: React.MouseEvent<HTMLDivElement>) => event.stopPropagation()}>
					{this.renderEmptyState(!this.props.searchEnabled && !this.props.items.length)}
					{this.renderNotFound(this.props.searchEnabled && !this.props.items.length)}
					{this.renderItemsList(this.props.items)}
				</div>
			</ViewerPanelContent>
			<ViewerPanelFooter onClick={this.handleClickOutside} container alignItems="center" justifyContent="space-between">
				<Summary>{this.listFooterText}</Summary>
				<ViewerPanelButton
					aria-label="Add item"
					onClick={this.handleAddNewItem}
					color="secondary"
					variant="fab"
					disabled={!this.hasPermission(CREATE_ISSUE) || !this.props.isModelLoaded}
					id={this.props.id + '-add-new-button'}
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
			defaultFiltersCollapsed
		/>
	));

	public renderHeaderNavigation = () => {
		const initialIndex = this.props.items.findIndex(({ _id }) => this.props.activeItemId === _id);
		return (
			<ListNavigation
				panelType={this.props.type}
				initialIndex={initialIndex}
				itemsCount={this.props.items.length}
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
	}

	public handleOpenSearchMode = () => this.props.onToggleFilters(true);

	public renderTitleIcon = () => {
		const { showDetails, Icon } = this.props;

		if (showDetails) {
			return (
                <IconButton onClick={this.props.onCloseDetails} size="large">
					<ArrowBack />
				</IconButton>
            );
		}
		return <Icon />;
	}

	public handleNavigationChange = (currentIndex) => {
		const itemToShow = this.props.items[currentIndex] || this.props.items[0];
		this.props.onShowDetails(itemToShow);
	}

	public renderActions = () => {
		if (this.props.showDetails && this.props.activeItemId) {
			return this.renderHeaderNavigation();
		}

		return (
			<PanelBarActions
				type={this.props.type}
				menuLabel="Show filters menu"
				menuActions={() => renderActionsMenu(this.props.headerMenuItems)}
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
				id={this.props.id + (showDetails ? '-details' : '' )}
			>
				{this.renderFilterPanel(searchEnabled && !showDetails)}
				{this.renderListView(!showDetails)}
				{this.props.renderDetailsView(showDetails)}
			</ViewerPanel>
		);
	}
}
