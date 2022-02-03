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

import { TextField } from '@material-ui/core';
import React from 'react';
import { Controller } from 'react-hook-form';

type FormTextFieldProps = {
	name: string;
	label: string;
	required?: boolean;
	hasError?: boolean;
	helperText?: string;
	control: any;
	className?: string;
};

export const FormTextField = ({
	name,
	label,
	required,
	hasError,
	helperText,
	control,
	className,
}: FormTextFieldProps) => (
	<Controller
		name={name}
		control={control}
		render={({ field }) => (
			<TextField
				{...field}
				innerRef={field.ref}
				className={className}
				label={label}
				required={required}
				error={hasError}
				helperText={helperText}
			/>
		)}
	/>
);
