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

import { debounce } from 'lodash';
import React from 'react';

import { SortLabel } from '../tableHeading/tableHeading.styles';
import { SearchField, SearchIcon } from './cellUserSearch.styles';

interface IProps {
	label: string;
	activeSort: boolean;
	sortOrder: 'asc' | 'desc';
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

	public debouncedOnChange = debounce((searchText) => {
		this.props.onChange(searchText);
	}, 200);

	public handleChange = (event) => {
		event.persist();
		const searchText = event.target.value;
		this.setState({searchText});
		this.debouncedOnChange(searchText);
	}

	public render() {
		const {label, activeSort, sortOrder, onClick} = this.props;
		const {searchText} = this.state;
		return (
			<>
				<SortLabel
					active={activeSort}
					direction={sortOrder}
					onClick={onClick}
				/>
				<SearchIcon />
				<SearchField
					label={label}
					value={searchText}
					onChange={this.handleChange}
					InputProps={ {
						disableUnderline: false
					} }
				/>
			</>
		);
	}
}
