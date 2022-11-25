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
import { Controller, ControllerRenderProps } from 'react-hook-form';

export type FormInputProps = Omit<ControllerRenderProps, 'ref'> & {
	required?: boolean,
	label?: string | JSX.Element,
	defaultValue?: any,
	disabled?: boolean,
	className?: string,
	error?: any,
	helperText?: string,
	inputRef?: any,
};

type ControlledInputProps = Pick<FormInputProps, 'required' | 'label' | 'defaultValue' | 'disabled' | 'className'> & {
	Input: (props: FormInputProps) => any,
	name: string,
	control?: any,
	formError?: any,
};
export const ControlledInput = ({ Input, name, control, defaultValue, formError, ...props }: ControlledInputProps) => (
	<Controller
		name={name}
		control={control}
		defaultValue={defaultValue}
		render={({ field: { ref, ...field} }) => (
			<Input
				{...field}
				{...props}
				inputRef={ref}
				error={!!formError}
				helperText={formError?.message}
			/>
		)}
	/>
);
