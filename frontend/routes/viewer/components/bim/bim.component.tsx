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
import { isEmpty } from 'lodash';
import { IconButton, Tab } from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';
import MoreIcon from '@material-ui/icons/MoreVert';
import SearchIcon from '@material-ui/icons/Search';
import CancelIcon from '@material-ui/icons/Cancel';

import { FilterPanel, ISelectedFilter } from '../../../components/filterPanel/filterPanel.component';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { IMetaRecord } from '../../../../modules/bim/bim.redux';
import { BIM_ACTIONS_ITEMS, BIM_ACTIONS_MENU } from '../../../../constants/bim';
import {
	MenuList,
	StyledListItem,
	StyledItemText
} from '../../../components/filterPanel/components/filtersMenu/filtersMenu.styles';
import { ButtonMenu } from '../../../components/buttonMenu/buttonMenu.component';
import { ViewerPanel } from '../viewerPanel/viewerPanel.component';
import { getFilters } from '../../../../helpers/bim';
import { ViewerPanelContent } from '../viewerPanel/viewerPanel.styles';
import { MetaRecord } from './components/metaRecord/metaRecord.component';
import { Container, EmptyStateInfo, Tabs } from './bim.styles';

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

const MenuButton = ({ IconProps, Icon, ...props }) => (
	<IconButton
		{...props}
		aria-label="Show filters menu"
		aria-haspopup="true"
	>
		<MoreIcon {...IconProps} />
	</IconButton>
);

export class Bim extends React.PureComponent<IProps, any> {
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
				title="BIM"
				Icon={this.getTitleIcon()}
				renderActions={this.renderActions}
				pending={isPending}
			>
				{this.renderFilterPanel(searchEnabled)}
				{this.renderList()}
			</ViewerPanel>
		);
	}

	public getSearchButton = () => {
		if (this.props.searchEnabled) {
			return <IconButton onClick={this.handleCloseSearchMode}><CancelIcon /></IconButton>;
		}
		return <IconButton onClick={this.handleOpenSearchMode}><SearchIcon /></IconButton>;
	}

	private handleFilterChange = (selectedFilters) => {
		this.props.setComponentState({ selectedFilters });
	}

	private getTitleIcon = () => <InfoIcon />;

	private getMenuButton = () => (
		<ButtonMenu
			renderButton={MenuButton}
			renderContent={this.renderActionsMenu}
			PaperProps={{ style: { overflow: 'initial', boxShadow: 'none' } }}
			PopoverProps={{ anchorOrigin: { vertical: 'center', horizontal: 'left' } }}
			ButtonProps={{ disabled: isEmpty(this.props.starredMetaMap) }}
		/>
	)

	private handleCloseSearchMode = () => {
		this.props.setComponentState({ searchEnabled: false, selectedFilters: [] });
	}

	private handleOpenSearchMode = () => this.props.setComponentState({ searchEnabled: true });

	private handleTabChange = (event, activeTab) => this.props.setComponentState({
		showStarred: Boolean(activeTab)
	})

	private toggleStarredRecord = (key, isStarred) => () => {
		if (isStarred) {
			this.props.removeMetaRecordFromStarred(key);
		} else {
			this.props.addMetaRecordToStarred(key);
		}
	}

	private renderMetaRecord = ({ key, value }) => {
		const isStarred = Boolean(this.props.starredMetaMap[key]);

		return (
			<MetaRecord
				onStarClick={this.toggleStarredRecord(key, isStarred)}
				value={value}
				name={key}
				key={key}
				starred={isStarred}
			/>
		);
	}

	private renderList = () => {
		const { selectedFilters, showStarred } = this.props;
		const areFiltersActive = !!selectedFilters.length;
		const hasMetadata = Boolean(this.metadata.length);
		return (
				<>
					<Tabs
						className="height-catcher-omitted"
						indicatorColor="primary"
						textColor="primary"
						fullWidth
						value={Number(showStarred)}
						onChange={this.handleTabChange}
					>
						<Tab label="All" />
						<Tab label="Starred" />
					</Tabs>
					<ViewerPanelContent className="height-catcher">
						<Container className="height-catcher">
							{this.metadata.map((meta) => this.renderMetaRecord(meta))}
							{this.renderEmptyState(!areFiltersActive && !hasMetadata)}
							{this.renderNotFound(areFiltersActive && !hasMetadata)}
						</Container>
					</ViewerPanelContent>
			</>
		);
	}

	private renderActionsMenu = (menu) =>  {
		return(
			<MenuList>
				{BIM_ACTIONS_MENU.map(({ name, label }) => (
					<StyledListItem key={name} button onClick={(e) => {
						menu.close(e);
						this.menuActionsMap[name]();
					}}>
						<StyledItemText>{label}</StyledItemText>
					</StyledListItem>
				))}
			</MenuList>
		);
	}

	private renderActions = () => {
		return (
			<>
				{this.getSearchButton()}
				{this.getMenuButton()}
			</>
		);
	}
}
