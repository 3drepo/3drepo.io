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
import { IconButton, Tabs, Tab } from '@material-ui/core';
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
import { Container, EmptyStateInfo } from './bim.styles';
import { ViewerPanelContent } from '../viewerPanel/viewerPanel.styles';

interface IProps {
	className: string;
	teamspace: string;
	model: string;
	isPending: boolean;
	metadata: IMetaRecord[];
	searchEnabled: boolean;
	showStarred: boolean;
	selectedFilters: ISelectedFilter[];
	starredMetadataKeys: string[];
	setComponentState: (componentState) => void;
	clearStarredMetadata: (teamspace, model) => void;
	addMetaRecordToStarred?: (key) => void;
	removeMetaRecordFromStarred?: (key) => void;
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
			[BIM_ACTIONS_ITEMS.CLEAR_STARRED]: () => clearStarredMetadata(teamspace, model)
		};
	}

	get metadata() {
		if (this.props.showStarred) {
			const tempStarredList = [] as any;
			return this.props.metadata.filter(({ key }) => {
				return tempStarredList.includes(key);
			});
		}
		return [];
	}

	private renderFilterPanel = renderWhenTrue(() => (
		<FilterPanel
			onChange={this.handleFilterChange}
			selectedFilters={this.props.selectedFilters}
		/>
	));

	public componentDidUpdate() {
		console.log(this.props);
	}

	public render() {
		return (
			<ViewerPanel
				title="BIM"
				Icon={this.getTitleIcon()}
				renderActions={this.renderActions}
				pending={this.props.isPending}
			>
				{this.renderFilterPanel(this.props.searchEnabled)}
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
			ButtonProps={{ disabled: false }}
		/>
	)

	private handleCloseSearchMode = () => {
		this.props.setComponentState({ searchEnabled: false, selectedFilters: [] });
	}

	private handleOpenSearchMode = () => this.props.setComponentState({ searchEnabled: true });

	private handleTabChange = (event, activeTab) => this.props.setComponentState({
		showStarred: Boolean(activeTab),
	});

	private renderMetaRecord = () => {
		return (
			<div>test</div>
		)
	}

	private renderEmptyState = renderWhenTrue(() => (
		<EmptyStateInfo>No data</EmptyStateInfo>
	));

	private renderNotFound = renderWhenTrue(() => (
		<EmptyStateInfo>No data matched</EmptyStateInfo>
	));

	private renderList = () => {
		const { selectedFilters, showStarred } = this.props;
		const areFiltersActive = !!selectedFilters.length;
		const hasMetadata = Boolean(this.metadata.length);
		return (
			<ViewerPanelContent className="height-catcher">
				<Tabs
					indicatorColor="primary"
					textColor="primary"
					fullWidth
					value={Number(showStarred)}
					onChange={this.handleTabChange}
				>
					<Tab label="All" />
					<Tab label="Starred" />
				</Tabs>
				<Container>
					{this.metadata.map(this.renderMetaRecord)}
					{this.renderEmptyState(!areFiltersActive && !hasMetadata)}
					{this.renderNotFound(areFiltersActive && !hasMetadata)}
				</Container>
			</ViewerPanelContent>
		)
	}

	private renderActionsMenu = () => (
		<MenuList>
			{BIM_ACTIONS_MENU.map(({ name, label }) => (
				<StyledListItem key={name} button onClick={this.menuActionsMap[name]}>
					<StyledItemText>{label}</StyledItemText>
				</StyledListItem>
			))}
		</MenuList>
	)

	private renderActions = () => {
		return (
			<>
				{this.getSearchButton()}
				{this.getMenuButton()}
			</>
		);
	}
}
