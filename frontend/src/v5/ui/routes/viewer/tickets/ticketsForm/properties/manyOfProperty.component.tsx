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
import { SaveOnCloseMultiSelectWrapper } from './saveOnCloseMultiSelectWrapper';

type ManyOfPropertyProps = FormInputProps & {
	open?: boolean;
	values: PropertyDefinition['values'];
	value: any;
	immutable?: boolean;
	onOpen: () => void;
	onBlur: () => void;
	onClear: () => void;
};

export const ManyOfProperty = SaveOnCloseMultiSelectWrapper(({ values, immutable, onClear, ...props }: ManyOfPropertyProps) => {
	const canClear = !props.required && !props.disabled && !!props.value?.length && !immutable;

	if (values === 'jobsAndUsers') {
		return (<JobsAndUsersProperty maxItems={17} multiple canClear={canClear} onClear={onClear} {...props} />);
	}

	const items = (values === 'riskCategories') ? TicketsHooksSelectors.selectRiskCategories() : values;

	return (
		<MultiSelect
			{...props}
			endAdornment={canClear && (
				<ClearIconContainer onClick={onClear}>
					<ClearIcon />
				</ClearIconContainer>
			)}
		>
			{(items).map((value) => <MultiSelectMenuItem key={value} value={value}>{value}</MultiSelectMenuItem>)}
		</MultiSelect>
	);
});
