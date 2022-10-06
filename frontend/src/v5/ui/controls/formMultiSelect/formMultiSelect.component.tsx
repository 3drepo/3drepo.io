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

import { FormSearchSelect, SearchItem } from '@controls/formSearchSelect/formSearchSelectMenu';
import { FormSelectProps } from '@controls/formSelect/formSelect.component';
import { isEqual, xorWith } from 'lodash';
import { Children, useEffect, useState } from 'react';
import { MultiSelectMenuItem } from './multiSelectMenuItem/multiSelectMenuItem.component';

export type FormMultiSelectProps = FormSelectProps & {
	children: JSX.Element | JSX.Element[],
	renderValue?: (selectedItems: any[]) => any;
};

export const FormMultiSelect = ({
	children,
	defaultValue = [],
	renderValue,
	...props
}: FormMultiSelectProps) => {
	const [selectedItems, setSelectedItems] = useState<SearchItem[]>([]);

	const formatRenderValue = () => (
		renderValue?.(selectedItems) || selectedItems.map((item) => item.children).join(', ')
	);

	const itemIsSelected = ({ value: inputValue }) => !!selectedItems.find(({ value }) => isEqual(value, inputValue));

	const toggleItemSelection = (item: SearchItem) => {
		setSelectedItems((items) => xorWith(items, [item], isEqual));
	};

	const verifyChildrenAreValid = () => {
		Children.forEach(children, (child) => {
			if (child.type !== MultiSelectMenuItem) {
				throw new Error('FormMultiSelect only accepts an array of MultiSelectMenuItem as direct children');
			}
		});
	};

	useEffect(() => { verifyChildrenAreValid(); }, [children]);

	return (
		<FormSearchSelect
			defaultValue={defaultValue}
			value={selectedItems.map(({ value }) => value)}
			renderValue={formatRenderValue}
			onItemClick={toggleItemSelection}
			itemIsSelected={itemIsSelected}
			multiple
			{...props}
		>
			{children}
		</FormSearchSelect>
	);
};
