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

import { FormCheckboxProps } from '@controls/formCheckbox/formCheckbox.component';
import { FormCheckbox, MenuItem } from './multiSelectMenuItem.styles';
import { LabelAndValue } from '../formMultiSelect.component';

type MultiSelectMenuItem = Omit<FormCheckboxProps, 'control'> & {
	label: string,
	// All the following props are optional because they shall be passed by
	// ContextualisedMultiSelect when it calls `cloneElement`, but shall not be 
	// passed when creating the actual menu items (with label, value, etc.) from 
	// other components 
	control?: any,
	parentName?: string,
	selectedItems?: Set<any>,
	toggleSelectedItem?: (item) => void,
};

export const MultiSelectMenuItem = ({
	control,
	label,
	value,
	name,
	selectedItems,
	parentName,
	toggleSelectedItem,
	...props
}: MultiSelectMenuItem) => {
	const labelAndValue: LabelAndValue = { label, value };

	return (
		<MenuItem key={value.toString()}>
			<FormCheckbox
				control={control}
				label={label}
				name={`${parentName}.${name}`}
				checked={selectedItems.has(labelAndValue)}
				onClick={(_) => toggleSelectedItem(labelAndValue)}
				{...props}
			/>
		</MenuItem>
	);
};
