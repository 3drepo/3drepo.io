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

import { PureComponent } from 'react';
import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { EmptyStateInfo } from '../../../../../components/components.styles';
import { CompareDiffItem } from '../compareDiffItem/compareDiffItem.component';
import { CompareFilters } from '../compareFilters/compareFilters.component';
import { Container, List } from './compareDiff.styles';

interface IProps {
	className: string;
	selectedItemsMap: any[];
	selectedFilters: any[];
	compareModels: any[];
	isAllSelected: boolean;
	targetModels: any;
	isCompareProcessed: boolean;
	renderComparisonLoader: () => any;
	setTargetModel: (modelId, isTarget) => void;
	setComponentState: (state) => void;
	setTargetRevision: (modelId, targetRevision, isDiff) => void;
	handleAllItemsSelect: () => void;
	handleItemSelect: (modelProps) => (event, selected) => void;
}

export class CompareDiff extends PureComponent<IProps, any> {

	public renderEmptyState = renderWhenTrue(() => (
		<EmptyStateInfo>No models matched</EmptyStateInfo>
	));

	public renderList = renderWhenTrue(() => (
		<List>
			{this.props.compareModels.map(this.renderListItem)}
		</List>
	));

	public handleFilterChange = (selectedFilters) => {
		this.props.setComponentState({ selectedFilters });
	}

	public render() {
		const { className, renderComparisonLoader, compareModels } = this.props;

		return (
			<Container className={className}>
				{renderComparisonLoader()}
				{this.renderFilterPanel()}
				{this.renderEmptyState(!compareModels.length)}
				{this.renderList(compareModels.length)}
			</Container>
		);
	}

	private renderFilterPanel = () => (
		<CompareFilters
			onCheckboxChange={this.props.handleAllItemsSelect}
			onFilterChange={this.handleFilterChange}
			selectedFilters={this.props.selectedFilters}
			allSelected={this.props.isAllSelected}
		/>
	)

	private handleRevisionChange = (modelProps) => (revision) => {
		this.props.setTargetRevision(modelProps._id, revision, true);
	}

	private renderListItem = (modelProps) => {
		const { selectedItemsMap } = this.props;
		const isSelected = modelProps.baseRevision ? selectedItemsMap[modelProps._id] : false;

		return (
			<CompareDiffItem
				key={modelProps._id}
				name={modelProps.name}
				baseRevision={modelProps.baseRevision || {}}
				currentRevision={modelProps.currentRevision}
				targetDiffRevision={modelProps.targetDiffRevision}
				revisions={modelProps.revisions}
				selected={isSelected}
				onSelectionChange={this.props.handleItemSelect(modelProps)}
				onRevisionChange={this.handleRevisionChange(modelProps)}
			/>
		);
	}
}
