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
import { Select, InputLabel, FormControl } from '@material-ui/core';

type FormSelectProps = {
	inputId: string;
	inputLabel: string;
	label: string;
	selectId: string;
	defaultValue: string;
	required?: boolean;
	children: JSX.Element[];
	useFormRegisterProps: any;
};

export const FormSelect = ({
	inputId,
	required,
	label,
	selectId,
	defaultValue,
	children,
	useFormRegisterProps,
}: FormSelectProps) => (
	<FormControl>
		<InputLabel
			id={inputId}
			required={required}
		>
			{label}
		</InputLabel>
		<Select
			labelId={inputId}
			id={selectId}
			defaultValue={defaultValue}
			{...useFormRegisterProps}
		>
			{children}
		</Select>
	</FormControl>
);
