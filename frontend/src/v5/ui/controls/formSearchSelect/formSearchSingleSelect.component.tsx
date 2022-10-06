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
import { FormSelectProps } from '@controls/formSelect/formSelect.component';
import { MenuItem } from '@mui/material';
import { isEqual } from 'lodash';
import { Children, useEffect, useState } from 'react';
import { FormSearchSelect, SearchItem } from './formSearchSelectMenu';

export type FormSearchSingleSelectProps = FormSelectProps & {
	children: JSX.Element | JSX.Element[],
	renderValue?: (selectedItem: SearchItem) => any;
};

export const FormSearchSingleSelect = ({
	children,
	renderValue,
	...props
}: FormSearchSingleSelectProps) => {
	const [selectedItem, setSelectedItem] = useState<SearchItem>(null);

	const formatRenderValue = () => renderValue?.(selectedItem) || selectedItem.children;

	const itemIsSelected = ({ value }) => selectedItem && isEqual(selectedItem.value, value);

	const verifyChildrenAreValid = () => {
		Children.forEach(children, (child) => {
			if (child.type !== MenuItem) {
				throw new Error('FormSearchSingleSelect only accepts an array of MenuItem as direct children');
			}
		});
	};

	useEffect(() => { verifyChildrenAreValid(); }, [children]);

	return (
		<FormSearchSelect
			value={selectedItem?.value || ''}
			renderValue={formatRenderValue}
			onItemClick={setSelectedItem}
			itemIsSelected={itemIsSelected}
			{...props}
		>
			{children}
		</FormSearchSelect>
	);
};
