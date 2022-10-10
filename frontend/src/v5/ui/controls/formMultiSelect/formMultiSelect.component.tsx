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

import { FormSearchSelect } from '@controls/formSearchSelect/formSearchSelectMenu';
import { FormSelectProps } from '@controls/formSelect/formSelect.component';
import { isEqual, some, xorWith } from 'lodash';
import { Children, useEffect, useState } from 'react';
import { MultiSelectMenuItem } from './multiSelectMenuItem/multiSelectMenuItem.component';

export type FormMultiSelectProps = FormSelectProps & {
	children: JSX.Element | JSX.Element[],
	renderValue?: (selectedItems: any[]) => any;
	defaultValue?: any[];
};

export const FormMultiSelect = ({
	children,
	defaultValue,
	renderValue,
	selectedOptionsTooltip = true,
	...props
}: FormMultiSelectProps) => {
	const [selectedItems, setSelectedItems] = useState<any[]>([]);

	const formatRenderValue = () => {
		const childrenToRender = selectedItems.map((item) => item.children);
		return renderValue?.(childrenToRender) || childrenToRender.join(', ');
	};

	const itemIsSelected = (inputItem) => !!selectedItems.find((item) => isEqual(item, inputItem));

	const toggleValueSelection = (item) => {
		setSelectedItems((items) => xorWith(items, [item], isEqual));
	};

	const verifyChildrenAreValid = () => {
		Children.forEach(children, (child) => {
			if (child.type !== MultiSelectMenuItem) {
				throw new Error('FormMultiSelect only accepts an array of MultiSelectMenuItem as direct children');
			}
		});
	};

	const initialiseDefaultItems = () => {
		setSelectedItems(
			Children.toArray(children)
				.map((child: any) => child.props)
				.filter(({ value }) => some(defaultValue, (v) => isEqual(v, value))),
		);
	};

	useEffect(() => {
		verifyChildrenAreValid();
		if (defaultValue?.length) initialiseDefaultItems();
	}, [children]);

	return (
		<FormSearchSelect
			defaultValue={defaultValue ?? []}
			value={selectedItems.map(({ value }) => value)}
			renderValue={formatRenderValue}
			onItemClick={toggleValueSelection}
			itemIsSelected={itemIsSelected}
			multiple
			selectedOptionsTooltip={selectedOptionsTooltip}
			{...props}
		>
			{children}
		</FormSearchSelect>
	);
};
