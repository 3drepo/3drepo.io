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

import React from 'react';
import { Checkbox, FormControlLabel, FormControlLabelProps } from '@material-ui/core';
import { Controller } from 'react-hook-form';

export type FormCheckboxProps = FormControlLabelProps & {
	name: string;
	label: string;
	control: any;
};

export const FormCheckbox = ({
	name,
	label,
	control,
	...otherProps
}: FormCheckboxProps) => (
	<Controller
		control={control}
		name={name}
		render={({ field }) => (
			<FormControlLabel
				{...field}
				control={<Checkbox />}
				label={label}
				checked={field.value}
				{...otherProps}
			/>
		)}
	/>
);
