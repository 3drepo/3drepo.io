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

import { ViewerPanel } from '../viewerPanel/viewerPanel.component';
import { Container } from './bim.styles';
import { FilterPanel } from '../../../components/filterPanel/filterPanel.component';
import { renderWhenTrue } from '../../../../helpers/rendering';

interface IProps {
	className: string;
	isPending: boolean;
	searchEnabled: string;
}

export class Bim extends React.PureComponent<IProps, any> {
	public renderTitleIcon = () => <ReportProblem />;

	public renderFilterPanel = renderWhenTrue(() => (
		<FilterPanel
			onChange={this.handleFilterChange}
			filters={this.filters as any}
			selectedFilters={this.props.selectedFilters}
		/>
	));

	public renderActionsMenu = () => (
		<MenuList>
			{RISKS_ACTIONS_MENU.map(({ name, Icon, label }) => {
				return (
					<StyledListItem key={name} button onClick={this.menuActionsMap[name]}>
						<IconWrapper><Icon fontSize="small" /></IconWrapper>
						<StyledItemText>
							{label}
							{(name === RISKS_ACTIONS_ITEMS.SHOW_PINS && this.props.showPins) && <Check fontSize="small" />}
						</StyledItemText>
					</StyledListItem>
				);
			})}
		</MenuList>
	)

	public renderActions = () => {
		if (this.props.showDetails) {
			if (!this.props.activeRiskId || this.state.filteredRisks.length < 2) {
				return [];
			}
			return [{ Button: this.getPrevButton }, { Button: this.getNextButton }];
		}
		return [{ Button: this.getSearchButton }, { Button: this.getMenuButton }];
	}

	public renderList = renderWhenTrue(() => {
		return null;
	});

	public render() {
		console.log('rendered');
		return (
			<ViewerPanel
				title="SafetiBase"
				Icon={this.renderTitleIcon()}
				actions={this.renderActions()}
				pending={this.props.isPending}
			>
				{this.renderFilterPanel(this.props.searchEnabled)}
				{this.renderList(!this.props.showDetails)}
			</ViewerPanel>
		);
	}
}
