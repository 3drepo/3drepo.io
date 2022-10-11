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
import { FormSearchSelect, FormSearchSelectProps } from '@controls/formSearchSelect/formSearchSelect.component';
import { isEqual, isUndefined } from 'lodash';
import { Children, useEffect, useState } from 'react';
import { SingleSelectMenuItem } from './singleSelectMenutItem.styles';

export type FormSingleSelectProps = FormSearchSelectProps & {
	children: any,
};

export const FormSingleSelect = ({
	children,
	defaultValue,
	renderValue,
	...props
}: FormSingleSelectProps) => {
	const [selectedItem, setSelectedItem] = useState<any>();

	const formatRenderValue = () => {
		const childrenToRender = selectedItem?.children;
		return renderValue?.(childrenToRender) || childrenToRender;
	};

	const itemIsSelected = (item) => selectedItem && isEqual(selectedItem, item);

	const verifyChildrenAreValid = () => {
		Children.forEach(children, (child) => {
			if (child.type !== SingleSelectMenuItem) {
				throw new Error('FormSingleSelect only accepts an array of SingleSelectMenuItem as direct children');
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
			search
			{...props}
		>
			{children}
		</FormSearchSelect>
	);
};
