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

import { formatMessage } from '@/v5/services/intl';
import { FormSingleSelect, FormSingleSelectProps } from '@controls/formSearchSelect/formSingleSelect/formSingleSelect.component';
import { ScrollArea } from '@controls/scrollArea';
import { SearchContextComponent } from '@controls/search/searchContext';
import { MouseEvent, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { SearchInput, NoResults, FormCheckbox, MenuItem } from './formMultiSelect.styles';

type FormMultiSelectProps = FormSingleSelectProps & {
	values: string[],
};

export const FormMultiSelect = ({ label, values, name, control }: FormMultiSelectProps) => {
	const [filteredValues, setFilteredValues] = useState(values);
	const [selectedValues, setSelectedValues] = useState(new Set());

	const toggleSelectedValue = (e: MouseEvent, value) => {
		if (selectedValues.has(value)) {
			selectedValues.delete(value);
		} else {
			selectedValues.add(value);
		}
		setSelectedValues(new Set(selectedValues));
	};

	const filterValues = ({ target }) => {
		const input = target.value;
		if (!input) setFilteredValues(values);

		const lowerCaseInput = input.toLowerCase();
		const newFilteredValues = values.filter((value) => value.includes(lowerCaseInput));
		setFilteredValues(newFilteredValues);
	};

	const preventInputUnfocus = (e) => {
		if (e.key !== 'Escape') e.stopPropagation();
	};

	return (
		<SearchContextComponent items={values}>
			<FormSingleSelect
				multiple
				defaultValue={[]}
				label={label}
				name={name}
				control={control}
				renderValue={() => Array.from(selectedValues).join(', ')}
				value={Array.from(selectedValues)}
			>
				<SearchInput
					placeholder={formatMessage({ id: 'form.multiSelect.search.placeholder', defaultMessage: 'Search users' })}
					onKeyDown={preventInputUnfocus}
					onChange={filterValues}
					onClear={() => setFilteredValues(values)}
				/>
				<ScrollArea autoHeight>
					{filteredValues.map((value) => (
						<MenuItem key={value}>
							<FormCheckbox
								control={control}
								label={value}
								name={`${name}.${value}`}
								checked={selectedValues.has(value)}
								onClick={(e) => toggleSelectedValue(e, value)}
							/>
						</MenuItem>
					))}
				</ScrollArea>
				{filteredValues.length === 0 && (
					<NoResults>
						<FormattedMessage
							id="form.multiSelect.search.emptyList"
							defaultMessage="No results"
						/>
					</NoResults>
				)}
			</FormSingleSelect>
		</SearchContextComponent>
	);
};
