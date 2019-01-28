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
import { isEqual, isEmpty } from 'lodash';

import ArrowBack from '@material-ui/icons/ArrowBack';
import AddIcon from '@material-ui/icons/Add';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import CancelIcon from '@material-ui/icons/Cancel';
import MoreIcon from '@material-ui/icons/MoreVert';
import Check from '@material-ui/icons/Check';

import { hasPermissions } from '../../../../helpers/permissions';
import { ButtonMenu } from '../../../components/buttonMenu/buttonMenu.component';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { PreviewListItem } from '../previewListItem/previewListItem.component';
import { ViewerPanel } from '../viewerPanel/viewerPanel.component';
import { ListContainer, Summary } from '../risks/risks.styles';
import { ViewerPanelContent, ViewerPanelFooter, ViewerPanelButton } from '../viewerPanel/viewerPanel.styles';
import {
	MenuList,
	StyledListItem,
	StyledItemText,
	IconWrapper
} from '../../../components/filterPanel/components/filtersMenu/filtersMenu.styles';
import { FilterPanel } from '../../../components/filterPanel/filterPanel.component';
import { CREATE_ISSUE, VIEW_ISSUE } from '../../../../constants/issue-permissions';
import { searchByFilters } from '../../../../helpers/searching';
import { Viewer } from '../../../../services/viewer/viewer';
import { VIEWER_EVENTS } from '../../../../constants/viewer';
import { ListNavigation } from '../listNavigation/listNavigation.component';

const MenuButton = ({ IconProps, Icon, ...props }) => (
	<IconButton
		{...props}
		aria-label="Show filters menu"
		aria-haspopup="true"
	>
		<MoreIcon {...IconProps} />
	</IconButton>
);

interface IHeaderMenuItem {
	label: string;
	enabled?: boolean;
	Icon?: any;
	onClick?: (event?) => void;
}

interface IProps {
	title: string;
	type: string;
	items: any[];
	searchEnabled: boolean;
	selectedFilters: any[];
	permissions: any[];
	filters: any[];
	headerMenuItems: IHeaderMenuItem[];
	revision?: string;
	isPending?: boolean;
	activeItemId?: string;
	showDetails?: boolean;
	showDefaultHiddenItems: boolean;
	Icon?: any;
	setState: (componentState: any) => void;
	onNewItem: () => void;
	onActiveItem: (item) => void;
	onShowDetails: (item) => void;
	onCloseDetails: () => void;
	onToggleFilters: (isActive) => void;
	onChangeFilters: (selectedFilters) => void;
	toggleShowPins: (showPins: boolean, filteredItems) => void;
	renderDetailsView: (statement) => void;
}

interface IState {
	filteredItems: any[];
	modelLoaded: boolean;
}

export class ReportedItems extends React.PureComponent<IProps, IState> {
	public state = {
		filteredItems: [],
		modelLoaded: true
	};

	get activeItemIndex() {
		return this.state.filteredItems.findIndex((item) => item._id === this.props.activeItemId);
	}

	get filteredItems() {
		const { items, selectedFilters, showDefaultHiddenItems } = this.props;
		return searchByFilters(items, selectedFilters, showDefaultHiddenItems);
	}

	get listFooterText() {
		if (this.state.modelLoaded) {
			return `${this.state.filteredItems.length} results displayed`;
		}
		return 'Model is loading';
	}

	public componentDidMount() {
		if (Viewer.viewer.model && !this.state.modelLoaded) {
			this.setState({ modelLoaded: true });
		}

		this.toggleRiskPinEvent(true);
		this.toggleModelLoadedEvent(true);
		this.setState({ filteredItems: this.filteredItems });
	}

	public componentDidUpdate(prevProps) {
		const { items, selectedFilters, showDefaultHiddenItems, searchEnabled } = this.props;
		const itemsChanged = !isEqual(prevProps.items, items);
		const filtersChanged = prevProps.selectedFilters.length !== selectedFilters.length;
		const showDefaultHiddenItemsChanged = prevProps.showDefaultHiddenItems !== showDefaultHiddenItems;
		const searchEnabledChange = prevProps.searchEnabled !== searchEnabled;

		const changes = {} as IState;

		if (itemsChanged || filtersChanged || showDefaultHiddenItemsChanged || searchEnabledChange) {
			changes.filteredItems = this.filteredItems;
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public componentWillUnmount() {
		this.toggleRiskPinEvent(false);
		this.toggleModelLoadedEvent(false);
	}

	public toggleRiskPinEvent = (enabled: boolean) => {
		const resolver = enabled ? 'on' : 'off';
		Viewer[resolver](VIEWER_EVENTS.CLICK_PIN, this.handlePinClick);
	}

	public toggleModelLoadedEvent = (enabled: boolean) => {
		const resolver = enabled ? 'on' : 'off';
		Viewer[resolver](VIEWER_EVENTS.MODEL_LOADED, this.handleLoadedModel);
	}

	public handleLoadedModel = () => {
		this.setState({ modelLoaded: true });
	}

	public handlePinClick = ({ id }) => {
		const relatedRisk = this.state.filteredItems.find((item) => item._id === id);

		if (relatedRisk) {
			this.handleItemFocus(relatedRisk)();
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
	public handleShowRiskDetails = (item) => () => this.props.onShowDetails(item);

	public handleAddNewItem = () => {
		this.props.onNewItem();
	}

	public handleCloseSearchMode = () => {
		this.props.onToggleFilters(false);
		this.setState({
			filteredItems: this.props.items
		});
	}

	public handleOpenSearchMode = () => this.props.onToggleFilters(true);

	public handlePrevItem = () => {
		const index = this.activeItemIndex;

		const prevIndex = index === 0 ? this.state.filteredItems.length - 1 : index - 1;
		this.props.onShowDetails(this.state.filteredItems[prevIndex]);
	}

	public handleNextItem = () => {
		const index = this.activeItemIndex;
		const lastIndex = this.state.filteredItems.length - 1;
		const nextIndex = index === lastIndex ? 0 : index + 1;

		this.props.onShowDetails(this.state.filteredItems[nextIndex]);
	}

	public getMenuButton = () => (
		<ButtonMenu
			renderButton={MenuButton}
			renderContent={this.renderActionsMenu}
			PaperProps={{ style: { overflow: 'initial', boxShadow: 'none' } }}
			PopoverProps={{ anchorOrigin: { vertical: 'center', horizontal: 'left' } }}
			ButtonProps={{ disabled: false }}
		/>
	)

	public getSearchButton = () => {
		if (this.props.searchEnabled) {
			return <IconButton onClick={this.handleCloseSearchMode}><CancelIcon /></IconButton>;
		}
		return <IconButton onClick={this.handleOpenSearchMode}><SearchIcon /></IconButton>;
	}

	public renderItemsList = renderWhenTrue(() => (
		<ListContainer>
			{this.state.filteredItems.map((item, index) => (
				<PreviewListItem
					{...item}
					key={index}
					onItemClick={this.handleItemFocus(item)}
					onArrowClick={this.handleShowRiskDetails(item)}
					active={this.props.activeItemId === item._id}
					hasViewPermission={this.hasPermission(VIEW_ISSUE)}
					modelLoaded={this.state.modelLoaded}
					panelName={this.props.type}
				/>
			))}
		</ListContainer>
	));

	public renderListView = renderWhenTrue(() => (
		<>
			<ViewerPanelContent className="height-catcher" padding="0">
				{this.renderItemsList(this.state.filteredItems.length)}
			</ViewerPanelContent>
			<ViewerPanelFooter alignItems="center" justify="space-between">
				<Summary>{this.listFooterText}</Summary>
				<ViewerPanelButton
					aria-label="Add item"
					onClick={this.handleAddNewItem}
					color="secondary"
					variant="fab"
					disabled={!this.hasPermission(CREATE_ISSUE) || !this.state.modelLoaded}
				>
					<AddIcon />
				</ViewerPanelButton>
			</ViewerPanelFooter>
		</>
	));

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

	public renderFilterPanel = renderWhenTrue(() => (
		<FilterPanel
			onChange={this.props.onChangeFilters}
			filters={this.props.filters as any}
			selectedFilters={this.props.selectedFilters}
		/>
	));

	public renderActionsMenu = () => (
		<MenuList>
			{this.props.headerMenuItems.map(({ label, Icon, onClick, enabled }, index) => {
				return (
					<StyledListItem key={index} button onClick={onClick}>
						<IconWrapper><Icon fontSize="small" /></IconWrapper>
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
		this.props.onShowDetails(this.state.filteredItems[currentIndex]);
	}

	public renderHeaderNavigation = renderWhenTrue(() => {
		const initialIndex = this.state.filteredItems.findIndex(({ _id }) => this.props.activeItemId === _id);

		return (
			<ListNavigation
				initialIndex={initialIndex}
				lastIndex={this.state.filteredItems.length - 1}
				onChange={this.handleNavigationChange}
			/>
		);
	});

	public renderActions = () => {
		if (this.props.showDetails) {
			return this.renderHeaderNavigation(this.props.activeItemId && this.state.filteredItems.length >= 2);
		}

		return (
			<>
				{this.getSearchButton()}
				{this.getMenuButton()}
			</>
		);
	}

	public render() {
		return (
			<ViewerPanel
				title={this.props.title}
				Icon={this.renderTitleIcon()}
				renderActions={this.renderActions}
				pending={this.props.isPending}
			>
				{this.renderFilterPanel(this.props.searchEnabled && !this.props.showDetails)}
				{this.renderListView(!this.props.showDetails)}
				{this.props.renderDetailsView(this.props.showDetails)}
			</ViewerPanel>
		);
	}
}
