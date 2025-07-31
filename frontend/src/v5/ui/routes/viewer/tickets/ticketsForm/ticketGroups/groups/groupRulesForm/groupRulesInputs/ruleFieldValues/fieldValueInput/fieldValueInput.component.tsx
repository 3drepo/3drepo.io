/**
 *  Copyright (C) 2023 3D Repo Ltd
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
import { Controller, useFormContext } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { selectMetaKeys } from '@/v4/modules/model';
import { TextField } from '@mui/material';
import { get } from 'lodash';
import { ListboxComponent } from './listboxComponent/listboxComponent.component';
import { Autocomplete } from './fieldValueInput.styles';

export const FieldValueInput = ({ name, autoFocus = false, disabled }) => {
	const { formState: { errors } } = useFormContext();
	const fields = useSelector(selectMetaKeys);

	return (
		<Controller
			name={name}
			render={({ field: { onChange, ...field } }) => (
				<Autocomplete
					{...field}
					renderOption={(props, option) => [props, option] as any}
					disableClearable={!field.value}
					disableListWrap
					freeSolo
					ListboxComponent={ListboxComponent}
					options={fields}
					onChange={(_, data) => onChange(data)}
					onInputChange={(_, data) => onChange(data)}
					noOptionsText={formatMessage({ id: 'tickets.groups.field.noOptions', defaultMessage: 'No options' })}
					disabled={disabled}
					renderInput={({ InputProps, ...renderInputParams }) => (
						<TextField
							error={!!get(errors, name)}
							InputProps={{
								...InputProps,
								autoFocus,
							}}
							{...renderInputParams}
						/>
					)}
				/>
			)}
		/>
	);
};
