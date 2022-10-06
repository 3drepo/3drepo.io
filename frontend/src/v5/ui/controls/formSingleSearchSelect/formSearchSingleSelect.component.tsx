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
import { isEqual } from 'lodash';
import { Children, useEffect, useState } from 'react';
import { FormSearchSelect } from '../formSearchSelect/formSearchSelectMenu';

export type FormSearchSingleSelectProps = FormSelectProps & {
	children: JSX.Element | JSX.Element[],
	renderValue?: (selectedValue: any) => any;
};

export const FormSearchSingleSelect = ({
	children,
	renderValue,
	defaultValue,
	...props
}: FormSearchSingleSelectProps) => {
	const [selectedValue, setSelectedValue] = useState<any>(defaultValue ?? '');

	const formatRenderValue = (childrenByValue) => {
		const childrenToRender = childrenByValue[JSON.stringify(selectedValue)];
		return renderValue?.(childrenToRender) || childrenToRender;
	};

	const valueIsSelected = (value) => selectedValue && isEqual(selectedValue, value);

	const verifyChildrenAreValid = () => {
		Children.forEach(children, (child) => {
			if (child.type !== SearchSelectMenuItem) {
				throw new Error('FormSearchSingleSelect only accepts an array of SearchSelectMenuItem as direct children');
			}
		});
	};

	useEffect(() => { verifyChildrenAreValid(); }, [children]);

	return (
		<FormSearchSelect
			value={selectedValue}
			formatRenderValue={formatRenderValue}
			onItemClick={setSelectedValue}
			valueIsSelected={valueIsSelected}
			defaultValue={defaultValue}
			{...props}
		>
			{children}
		</FormSearchSelect>
	);
};
