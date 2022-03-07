/**
 *  Copyright (C) 2022 3D Repo Ltd
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
import { SelectProps as MuiSelectProps } from '@mui/material/Select';
import { Children, useState } from 'react';
import { StyledSelectMenu } from './selectMenu.styles';

type SelectProps = MuiSelectProps & {
	children: any;
};

const PADDING_TOP = 8;
const ITEM_HEIGHT = 46 + 2 * 8; // height + 2 * padding

export const Select = ({ children, ...props }: SelectProps) => {
	const [selectedItemIndex, setSelectedItemIndex] = useState(0);

	const handleListChange = (event) => setSelectedItemIndex(
		Children.toArray(children)
			.findIndex(({ title }: { title: string }) => title === event.target.value),
	);

	const getMarginTop = () => -(selectedItemIndex * ITEM_HEIGHT + PADDING_TOP);

	return (
		<StyledSelectMenu
			sx={{
				mt: getMarginTop(),
			}}
			onChange={handleListChange}
			{...props}
		>
			{children}
		</StyledSelectMenu>
	);
};
