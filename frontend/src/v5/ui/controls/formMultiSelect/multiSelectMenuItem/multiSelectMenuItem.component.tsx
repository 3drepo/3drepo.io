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
import { Checkbox, MenuItemProps } from '@mui/material';
import { SearchItem } from '@controls/formSearchSelect/formSearchSelectMenu';
import { CheckboxContainer, MenuItem } from './multiSelectMenuItem.styles';

type MultiSelectMenuItemProps = MenuItemProps & {
	onClick?: (item: SearchItem) => void,
};

export const MultiSelectMenuItem = ({
	value,
	children,
	selected,
	onClick,
}: MultiSelectMenuItemProps) => (
	<MenuItem
		key={value.toString()}
		onClick={() => onClick({ value, children } as SearchItem)}
		selected={selected}
	>
		<CheckboxContainer>
			<Checkbox checked={selected} />
			{children}
		</CheckboxContainer>
	</MenuItem>
);
