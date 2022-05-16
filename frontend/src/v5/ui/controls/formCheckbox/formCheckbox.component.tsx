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

import { Controller } from 'react-hook-form';
import { CheckboxProps, FormControlLabel } from '@mui/material';
import { Checkbox } from './formCheckbox.styles';

export type FormCheckboxProps = CheckboxProps & {
	control: any,
	label: string | JSX.Element,
};

export const FormCheckbox = ({
	name,
	control,
	label,
	...otherProps
}: FormCheckboxProps) => (
	<Controller
		control={control}
		name={name}
		render={({ field }) => (
			<FormControlLabel
				label={label}
				key={field.name}
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
