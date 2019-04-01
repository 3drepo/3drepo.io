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
import { Checkbox, FilterContainer, FilterPanel } from './compareFilters.styles';

interface IProps {
	selectedFilters: any[];
	onCheckboxChange: (modelProps) => void;
	onFilterChange: (selectedFilters) => void;
}

export class CompareFilters extends React.PureComponent<IProps, any> {
	public static defaultProps = {
		selected: false
	};

	public render() {
		const { selectedFilters, onCheckboxChange, onFilterChange } = this.props;
		return (
			<FilterContainer>
				<Checkbox
					color="primary"
					onChange={onCheckboxChange}
				/>
				<FilterPanel
					filters={[]}
					onChange={onFilterChange}
					selectedFilters={selectedFilters}
					hideMenu={true}
					placeholder={'Search'}
				/>
			</FilterContainer>
		);
	}
}
