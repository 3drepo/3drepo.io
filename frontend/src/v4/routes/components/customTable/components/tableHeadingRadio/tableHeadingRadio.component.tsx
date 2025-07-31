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
import { Grid } from '@mui/material';

import { SortLabel } from '../tableHeading/tableHeading.styles';
import {
	TableHeadingRadioButton,
	RadioContainer,
} from './tableHeadingRadio.styles';

interface IProps {
	label: string;
	value: any;
	activeSort: boolean;
	sortOrder: 'asc' | 'desc';
	disabled?: boolean;
	checked?: boolean;
	name?: string;
	tooltipText?: string;
	className?: string;
	width?: string;
	onChange?: (event, value) => void;
	onClick?: () => void;
	ref?: any;
}

export const TableHeadingRadio = (({
	activeSort,
	label,
	name,
	onClick,
	onChange,
	sortOrder,
	tooltipText,
	value,
	checked,
	disabled,
	ref,
	...otherProps
}: IProps) => {

	const handleChange = (event) => {
		onChange(event, value);
	}

	return (
		<RadioContainer
			container
			direction="column"
			justifyContent="center"
			alignItems="center"
			ref={ref}
			{...otherProps}
		>
			<Grid item>
				<SortLabel
					active={activeSort}
					direction={sortOrder}
					onClick={onClick}
				>
					{label}
				</SortLabel>
			</Grid>
			<Grid item>
				<TableHeadingRadioButton
					checked={checked}
					name={name || label}
					disabled={disabled}
					value={value}
					onChange={handleChange}
				/>
			</Grid>
		</RadioContainer>
	);
});
