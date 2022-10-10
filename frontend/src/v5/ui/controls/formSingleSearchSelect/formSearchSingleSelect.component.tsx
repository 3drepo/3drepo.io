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
import { SearchSelectMenuItem } from '@controls/formSingleSearchSelect/searchSelectMenuItem.component';
import { FormSelectProps } from '@controls/formSelect/formSelect.component';
import { isEqual, isUndefined } from 'lodash';
import { Children, useEffect, useState } from 'react';
import { FormSearchSelect } from '../formSearchSelect/formSearchSelectMenu';

export type FormSearchSingleSelectProps = FormSelectProps & {
	children: JSX.Element | JSX.Element[],
	renderValue?: (selectedItem: any) => any;
};

export const FormSearchSingleSelect = ({
	children,
	defaultValue,
	renderValue,
	...props
}: FormSearchSingleSelectProps) => {
	const [selectedItem, setSelectedItem] = useState<any>();

	const formatRenderValue = () => {
		const childrenToRender = selectedItem?.children;
		return renderValue?.(childrenToRender) || childrenToRender;
	};

	const itemIsSelected = (item) => selectedItem && isEqual(selectedItem, item);

	const verifyChildrenAreValid = () => {
		Children.forEach(children, (child) => {
			if (child.type !== SearchSelectMenuItem) {
				throw new Error('FormSearchSingleSelect only accepts an array of SearchSelectMenuItem as direct children');
			}
		});
	};

	const initialiseDefaultItem = () => {
		setSelectedItem(
			Children.toArray(children)
				.map((child: any) => child.props)
				.find(({ value }) => isEqual(defaultValue, value)),
		);
	};

	useEffect(() => {
		verifyChildrenAreValid();
		if (!isUndefined(defaultValue)) initialiseDefaultItem();
	}, [children]);

	return (
		<FormSearchSelect
			value={selectedItem?.value}
			renderValue={formatRenderValue}
			onItemClick={setSelectedItem}
			itemIsSelected={itemIsSelected}
			defaultValue={defaultValue ?? ''}
			{...props}
		>
			{children}
		</FormSearchSelect>
	);
};
