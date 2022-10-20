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

import { FormSearchSelect, FormSearchSelectProps } from '@controls/formSelect/formSearchSelect/formSearchSelect.component';
import { isEqual, isUndefined, pick, some, xorWith } from 'lodash';
import { Children, ReactElement, useEffect, useState } from 'react';
import { MultiSelectMenuItem } from './multiSelectMenuItem/multiSelectMenuItem.component';

export type FormMultiSelectProps = FormSearchSelectProps & {
	children: JSX.Element | JSX.Element[],
	renderValue?: (selectedItems: any[]) => any;
};

export const FormMultiSelect = ({
	children,
	defaultValue: inputDefaultValue,
	renderValue,
	renderValueTooltip,
	...props
}: FormMultiSelectProps) => {
	const [selectedItems, setSelectedItems] = useState<any[]>([]);

	const formatRenderValue = () => {
		if (!selectedItems.length) return '';
		const childrenToRender = selectedItems.map((item) => item.children);
		return renderValue?.(childrenToRender) || childrenToRender.join(', ');
	};

	const itemIsSelected = (value) => !!selectedItems.find((item) => isEqual(item.value, value));

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

	const initialiseSelectedItems = (deafultItemValue, items) => {
		if (!deafultItemValue?.length) return;
		setSelectedItems(
			(Children.toArray(items) as ReactElement[])
				.filter(({ props: { value } }) => some(deafultItemValue, (v) => isEqual(v, value)))
				.map((child) => pick(child.props, ['children', 'value'])),
		);
	};

	useEffect(() => { verifyChildrenAreValid(); }, [children]);

	return (
		<FormSearchSelect
			defaultValue={inputDefaultValue ?? []}
			value={selectedItems.map(({ value }) => value)}
			renderValue={formatRenderValue}
			onItemClick={toggleValueSelection}
			itemIsSelected={itemIsSelected}
			intialiseSelectedItem={initialiseSelectedItems}
			search
			multiple
			renderValueTooltip={!isUndefined(renderValueTooltip) ? renderValueTooltip : formatRenderValue()}
			{...props}
		>
			{children}
		</FormSearchSelect>
	);
};
