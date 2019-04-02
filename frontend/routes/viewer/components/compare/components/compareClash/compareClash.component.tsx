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

import { CompareClashItem } from '../compareClashItem/compareClashItem.component';
import { modelsMock } from '../../../../../../constants/compare';
import { CompareFilters } from '../compareFilters/compareFilters.component';
import { Container, List } from './compareClash.styles';

interface IProps {
	className: string;
	selectedItemsMap: any[];
	selectedFilters: any[];
	compareModels: any[];
	setComponentState: (state) => void;
}

export class CompareClash extends React.PureComponent<IProps, any> {
  public handleFilterChange = (selectedFilters) => {
		this.props.setComponentState({ selectedFilters });
  }

	public render() {
		return (
			<Container className={this.props.className}>
				{this.renderFilterPanel()}
				{this.renderList()}
			</Container>
		);
	}

	private handleComparingTypeChange = (modelProps) => () => {
		console.log('Type of', modelProps.name, 'changed');
	}

	private handleRevisionChange = (modelProps) => () => {
		console.log('Revision of', modelProps.name, 'changed');
	}

	private renderFilterPanel = () => (
		<CompareFilters
			onCheckboxChange={this.handleAllItemsSelect}
			onFilterChange={this.handleFilterChange}
			selectedFilters={this.props.selectedFilters}
		/>
	)

	private handleItemSelect = (modelProps) => (event, selected) => {
		const { selectedItemsMap, setComponentState } = this.props;
		setComponentState({
			clashSelected: {
				...selectedItemsMap,
				[modelProps._id]: selected
			}
		});
	}

	private handleAllItemsSelect = (modelProps) => (event, selected) => {
		const { selectedItemsMap, setComponentState } = this.props;
		setComponentState({
			clashSelected: {
				...selectedItemsMap,
				[modelProps._id]: selected
			}
		});
	}

	private renderList = () => {
		return (
			<List>
				{this.props.compareModels.map(this.renderListItem)}
			</List>
		);
	}

	private renderListItem = (modelProps) => {
		const { selectedItemsMap } = this.props;
		const isSelected = selectedItemsMap[modelProps._id];
		return (
			<CompareClashItem
				key={modelProps._id}
				name={modelProps.name}
				revisions={modelProps.revisions}
				baseRevision={modelProps.baseRevision}
				currentRevision={modelProps.currentRevision}
				selected={isSelected}
				onSelectionChange={this.handleItemSelect(modelProps)}
				onRevisionChange={this.handleRevisionChange(modelProps)}
				onComparingTypeChange={this.handleComparingTypeChange(modelProps)}
			/>
		);
	}
}
