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
import { CompareDiffItem } from '../compareDiffItem/compareDiffItem.component';
import { CompareFilters } from '../compareFilters/compareFilters.component';
import { Container, List } from './compareDiff.styles';
import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { EmptyStateInfo } from '../../../views/views.styles';

interface IProps {
	className: string;
	selectedItemsMap: any[];
	selectedFilters: any[];
	compareModels: any[];
	isAllSelected: boolean;
	setComponentState: (state) => void;
}

export class CompareDiff extends React.PureComponent<IProps, any> {
  public handleFilterChange = (selectedFilters) => {
		this.props.setComponentState({ selectedFilters });
  }

	public renderEmptyState = renderWhenTrue(() => (
		<EmptyStateInfo>No models matched</EmptyStateInfo>
	));

	public renderList = renderWhenTrue(() => (
		<List>
			{this.props.compareModels.map(this.renderListItem)}
		</List>
	));

	public render() {
		return (
			<Container className={this.props.className}>
				{this.renderFilterPanel()}
				{this.renderEmptyState(!this.props.compareModels.length)}
				{this.renderList(this.props.compareModels.length)}
			</Container>
		);
	}

	private renderFilterPanel = () => (
		<CompareFilters
			onCheckboxChange={this.handleAllItemsSelect}
			onFilterChange={this.handleFilterChange}
			selectedFilters={this.props.selectedFilters}
			allSelected={this.props.isAllSelected}
		/>
	)

	private handleRevisionChange = (modelProps) => () => {
	}

	private handleItemSelect = (modelProps) => (event, selected) => {
		const { selectedItemsMap, setComponentState } = this.props;
		setComponentState({
			diffSelected: {
				...selectedItemsMap,
				[modelProps._id]: selected
			}
		});
	}

	private handleAllItemsSelect = (event, selected) => {
		const { setComponentState, compareModels } = this.props;
		const diffSelected = compareModels.reduce((map, obj) => {
			map[obj._id] = selected;
			return map;
		}, {});

		setComponentState({ diffSelected });
	}

	private renderListItem = (modelProps) => {
		const { selectedItemsMap } = this.props;
		const isSelected = selectedItemsMap[modelProps._id];
		return (
			<CompareDiffItem
				key={modelProps._id}
				name={modelProps.name}
				baseRevision={modelProps.baseRevision}
				currentRevision={modelProps.currentRevision}
				revisions={modelProps.revisions}
				selected={isSelected}
				onSelectionChange={this.handleItemSelect(modelProps)}
				onRevisionChange={this.handleRevisionChange(modelProps)}
			/>
		);
	}
}
