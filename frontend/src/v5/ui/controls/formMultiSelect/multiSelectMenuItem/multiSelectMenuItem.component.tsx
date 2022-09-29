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
import { CheckboxContainer, MenuItem } from './multiSelectMenuItem.styles';
import { Checkbox } from '@mui/material';

type MultiSelectMenuItem = {
	label: string,
	value: any,
	name: string,
	itemIsSelected?: (name) => boolean,
	toggleItemSelection?: (item) => void,
};

export const MultiSelectMenuItem = ({
	label,
	value,
	name,
	itemIsSelected,
	toggleItemSelection,
}: MultiSelectMenuItem) => (
	<MenuItem
		key={value.toString()}
		onClick={() => toggleItemSelection({ value, label, name })}
	>
		<CheckboxContainer>
			<Checkbox checked={itemIsSelected(name)} />
			{label}
		</CheckboxContainer>
	</MenuItem>
);
