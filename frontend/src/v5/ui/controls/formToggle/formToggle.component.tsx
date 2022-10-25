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

import { Switch, SwitchProps } from '@mui/material';
import { Controller } from 'react-hook-form';
import { FormControlLabel } from './formToggle.styles';

export type FormToggleProps = SwitchProps & {
	control?: any;
	name: string;
	children: any;
};

export const FormToggle = ({
	control,
	name,
	children,
	required,
	disabled,
	...props
}: FormToggleProps) => (
	<FormControlLabel
		disabled={disabled}
		label={children}
		control={(
			<Controller
				control={control}
				name={name}
				render={({ field }) => (
					<Switch
						{...field}
						inputRef={field.ref}
						id={name}
						disabled={disabled}
						{...props}
					/>
				)}
			/>
		)}
	/>
);
