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
import CopyFile from '@material-ui/icons/FileCopyOutlined';

import { ViewerPanel } from '../viewerPanel/viewerPanel.component';
import { Container } from './bim.styles';
import { FilterPanel, ISelectedFilter } from '../../../components/filterPanel/filterPanel.component';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { IMetaRecord } from '../../../../modules/bim/bim.redux';
import { BIM_ACTIONS_ITEMS, BIM_ACTIONS_MENU } from '../../../../constants/bim';
import { MenuList } from '../../../components/filterPanel/components/filtersMenu/filtersMenu.styles';

interface IProps {
	className: string;
	teamspace: string;
	model: string;
	isPending: boolean;
	metadata: IMetaRecord[];
	searchEnabled: string;
	showStarred: boolean;
	selectedFilters: ISelectedFilter[];
	starredMetadataKeys: string[];
	setComponentState: (componentState) => void;
	clearStarredMetadata: (teamspace, model) => void;
	addMetaRecordToStarred?: (key) => void;
	removeMetaRecordFromStarred?: (key) => void;
}

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

	private getTitleIcon = () => <CopyFile />;

	private renderList = () => {
		return <Container>Test</Container>;
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
		if (this.props.showDetails) {
			if (!this.props.activeRiskId || this.state.filteredRisks.length < 2) {
				return [];
			}
			return [{ Button: this.getPrevButton }, { Button: this.getNextButton }];
		}
		return [{ Button: this.getSearchButton }, { Button: this.getMenuButton }];
	}

	private handleFilterChange = (selectedFilters) => {
		this.props.setComponentState({ selectedFilters });
	}
}
