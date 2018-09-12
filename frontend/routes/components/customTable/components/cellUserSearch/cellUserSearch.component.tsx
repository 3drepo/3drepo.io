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

import { SearchField } from './cellUserSearch.styles';
import { SortLabel } from '../../customTable.styles';
import { SORT_ORDER_TYPES } from '../../../../../constants/sorting';

interface IProps {
	cell: any;
	sortBy: number;
	order: any;
	onClick: () => void;
	onChange: (searchText: string) => void;
}

interface IState {
	searchText: string;
}

export class CellUserSearch extends React.PureComponent<IProps, IState> {
	public state = {
		searchText: ''
	};

	public handleChange = (event) => {
		this.setState({searchText: event.target.value});
		this.props.onChange(this.state.searchText);
	}

	public render() {
		const {cell, sortBy, order, onClick} = this.props;
		const {searchText} = this.state;
		return (
			<>
				<SortLabel
					active={sortBy === cell.type}
					direction={sortBy === cell.type ? order : SORT_ORDER_TYPES.ASCENDING}
					onClick={onClick}
				></SortLabel>
				<SearchField
					label={cell.name}
					value={searchText}
					onChange={this.handleChange}
					InputProps={{
						disableUnderline: false
					}}
				/>
			</>
		);
	}
}
