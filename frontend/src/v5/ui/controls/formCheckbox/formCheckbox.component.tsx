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

import { CheckboxProps, FormControlLabel } from '@material-ui/core';
import { Controller } from 'react-hook-form';
import { Checkbox } from './formCheckbox.styles';

export type FormCheckboxProps = CheckboxProps & {
	control: any,
	formError: any,
	label,
};

export const FormCheckbox = ({
	name,
	control,
	formError,
	label,
	...otherProps
}: FormCheckboxProps) => (
	<Controller
		name={name}
		control={control}
		render={({ field }) => (
			<FormControlLabel
				label={label}
				key={label}
				control={(
					<Checkbox
						{...field}
						{...otherProps}
						checked={!!field.value}
						inputRef={field.ref}
					/>
				)}
			/>
		)}
	/>
);
