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
import { Container } from './compareDiff.styles';
import { modelsMock } from '../../../../../../constants/compare';

interface IProps {
	className: string;
	selectedItemsMap: any[];
	setComponentState: (state) => void;
}

export class CompareDiff extends React.PureComponent<IProps, any> {
	public render() {
		return (
			<Container className={this.props.className}>
				{this.renderList()}
			</Container>
		);
	}

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

	private renderListItem = (modelProps) => {
		const { selectedItemsMap } = this.props;
		const isSelected = selectedItemsMap[modelProps._id];
		return (
			<CompareDiffItem
				key={modelProps._id}
				name={modelProps.name}
				revisions={modelProps.revisions}
				selected={isSelected}
				onSelectionChange={this.handleItemSelect(modelProps)}
				onRevisionChange={this.handleRevisionChange(modelProps)}
			/>
		);
	}

	private renderList = () => {
		return modelsMock.map(this.renderListItem);
	}
}
