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

import { TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { MultiSelectMenuItem } from '@controls/inputs/multiSelect/multiSelectMenuItem/multiSelectMenuItem.component';
import { MultiSelect } from '@controls/inputs/multiSelect/multiSelect.component';
import { FormInputProps } from '@controls/inputs/inputController.component';
import { PropertyDefinition } from '@/v5/store/tickets/tickets.types';
import { JobsAndUsersProperty } from './jobsAndUsersProperty.component';
import ClearIcon from '@assets/icons/controls/clear_circle.svg';
import { ClearIconContainer } from './selectProperty.styles';
import { useState } from 'react';

type ManyOfPropertyProps = FormInputProps & {
	open?: boolean;
	values: PropertyDefinition['values'];
	value: any;
	immutable?: boolean;
	onOpen: () => void;
	onBlur: () => void;
};

export const ManyOfProperty = ({ values, value: formValue, immutable, onChange, ...props }: ManyOfPropertyProps) => {
	const [value, setValue] = useState(formValue);
	const canClear = !props.required && !props.disabled && !!value?.length && !immutable;

	const handleClose = () => {
		if (!value?.length && !formValue?.length) return;
		onChange(value);
		props.onBlur?.();
	};

	const handleChange = (e) => setValue(e.target.value);

	if (values === 'jobsAndUsers') {
		return (<JobsAndUsersProperty maxItems={17} multiple canClear={canClear} value={value} onClose={handleClose} onChange={handleChange} {...props} />);
	}

	const items = (values === 'riskCategories') ? TicketsHooksSelectors.selectRiskCategories() : values;

	const handleClear = () => {
		onChange([]);
		props.onBlur?.();
	};

	return (
		<MultiSelect
			{...props}
			onClose={handleClose}
			value={value || []}
			onChange={handleChange}
			endAdornment={canClear && (
				<ClearIconContainer onClick={handleClear}>
					<ClearIcon />
				</ClearIconContainer>
			)}
		>
			{(items).map((item) => <MultiSelectMenuItem key={item} value={item}>{item}</MultiSelectMenuItem>)}
		</MultiSelect>
	);
};
