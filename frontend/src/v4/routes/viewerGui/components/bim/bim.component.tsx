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

import { PureComponent } from 'react';

import { Tab } from '@mui/material';
import InfoIcon from '@assets/icons/viewer/info.svg';
import { isEmpty } from 'lodash';

import { BIM_ACTIONS_ITEMS, BIM_ACTIONS_MENU } from '@/v4/constants/bim';
import { getFilters, sortMetadata, transformMetadataToNestedList } from '@/v4/helpers/bim';
import { renderWhenTrue } from '@/v4/helpers/rendering';
import { IMetaRecord } from '@/v4/modules/bim/bim.redux';
import { EmptyStateInfo } from '../../../components/components.styles';
import {
	MenuList,
	StyledItemText,
	StyledListItem
} from '../../../components/filterPanel/components/filtersMenu/filtersMenu.styles';
import { FilterPanel } from '../../../components/filterPanel/filterPanel.component';
import { ISelectedFilter } from '../../../components/filterPanel/filterPanel';
import { PanelBarActions } from '../panelBarActions';
import { ViewerPanelContent } from '../viewerPanel/viewerPanel.styles';
import { Container, Tabs, ViewerPanel } from './bim.styles';
import { MetaRecord } from './components/metaRecord/';

interface IProps {
	className: string;
	teamspace: string;
	model: string;
	activeMeta: string;
	isPending: boolean;
	metadata: IMetaRecord[];
	searchEnabled: boolean;
	showStarred: boolean;
	selectedFilters: ISelectedFilter[];
	starredMetaMap: any;
	metaKeys: string[];
	fetchMetadata: (teamspace, model, meta) => void;
	setComponentState: (componentState) => void;
	clearStarredMetadata: (teamspace, model) => void;
	addMetaRecordToStarred?: (key) => void;
	removeMetaRecordFromStarred?: (key) => void;
	showConfirmDialog: (config) => void;
}

export class Bim extends PureComponent<IProps, any> {
	get menuActionsMap() {
		const { clearStarredMetadata, teamspace, model } = this.props;
		return {
			[BIM_ACTIONS_ITEMS.CLEAR_STARRED]: () => {
				this.setState({
					shouldCloseButtonMenu: true
				}, () => {
					this.props.showConfirmDialog({
						title: 'Clear starred',
						content: `Are you sure you want to clear your starred items?`,
						onConfirm: () => {
							clearStarredMetadata(teamspace, model);
						}
					});
				});
			}
		};
	}

	get metadata() {
		const { showStarred, metadata, starredMetaMap } = this.props;
		if (showStarred) {
			return metadata.filter(({ key }) => starredMetaMap[key]);
		}
		return metadata;
	}

	get filters() {
		return getFilters(this.props.metaKeys);
	}

	private renderFilterPanel = renderWhenTrue(() => (
		<FilterPanel
			filters={this.filters}
			onChange={this.handleFilterChange}
			selectedFilters={this.props.selectedFilters}
		/>
	));

	private renderEmptyState = renderWhenTrue(() => (
		<EmptyStateInfo>No data</EmptyStateInfo>
	));

	private renderNotFound = renderWhenTrue(() => (
		<EmptyStateInfo>No data matched</EmptyStateInfo>
	));

	public render() {
		const { isPending, searchEnabled } = this.props;
		return (
			<ViewerPanel
				title="Attribute Data"
				Icon={this.getTitleIcon()}
				renderActions={this.renderActions}
				pending={isPending}
				flexHeight
			>
				{this.renderFilterPanel(searchEnabled)}
				{this.renderList()}
			</ViewerPanel>
		);
	}

	private handleFilterChange = (selectedFilters) => {
		this.props.setComponentState({ selectedFilters });
	};

	private getTitleIcon = () => <InfoIcon />;

	private handleCloseSearchMode = () => {
		this.props.setComponentState({ searchEnabled: false, selectedFilters: [] });
	};

	private handleOpenSearchMode = () => this.props.setComponentState({ searchEnabled: true });

	private handleTabChange = (event, activeTab) => this.props.setComponentState({
		showStarred: Boolean(activeTab)
	});

	private toggleStarredRecord = (key, isStarred) => () => {
		if (isStarred) {
			this.props.removeMetaRecordFromStarred(key);
		} else {
			this.props.addMetaRecordToStarred(key);
		}
	};

	private renderMetadata = () =>
		Object.entries(transformMetadataToNestedList(this.metadata)).sort(sortMetadata).map(
			([index, data]) => (
				<MetaRecord
					key={index}
					name={index}
					data={data}
					toggleStarredRecord={this.toggleStarredRecord}
					starredMetaMap={this.props.starredMetaMap}
					showStarred={this.props.showStarred}
					isSearch={!!this.props.selectedFilters.length}
				/>
			)
		);

	private renderList = () => {
		const { selectedFilters, showStarred } = this.props;
		const areFiltersActive = !!selectedFilters.length;
		const hasMetadata = Boolean(this.metadata.length);
		return (
			<>
				<Tabs
					indicatorColor="primary"
					textColor="primary"
					value={Number(showStarred)}
					onChange={this.handleTabChange}
				>
					<Tab label="All data" />
					<Tab label="Starred" />
				</Tabs>
				<ViewerPanelContent>
					<Container>
						{this.renderMetadata()}
						{this.renderEmptyState(!areFiltersActive && !hasMetadata)}
						{this.renderNotFound(areFiltersActive && !hasMetadata)}
					</Container>
				</ViewerPanelContent>
			</>
		);
	};

	private renderActionsMenu = (menu) =>  {
		return(
			<MenuList>
				{BIM_ACTIONS_MENU.map(({ name, label }) => (
					<StyledListItem key={name} onClick={(e) => {
						menu.close(e);
						this.menuActionsMap[name]();
					}}>
						<StyledItemText>{label}</StyledItemText>
					</StyledListItem>
				))}
			</MenuList>
		);
	};

	private renderActions = () => (
		<PanelBarActions
			hideLock
			menuLabel="Show BIM menu"
			menuActions={this.renderActionsMenu}
			menuDisabled={isEmpty(this.props.starredMetaMap)}
			isSearchEnabled={this.props.searchEnabled}
			onSearchOpen={this.handleOpenSearchMode}
			onSearchClose={this.handleCloseSearchMode}
		/>
	);
}
