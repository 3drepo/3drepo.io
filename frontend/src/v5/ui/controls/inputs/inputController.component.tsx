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
import { forwardRef } from 'react';
import { Controller, ControllerRenderProps } from 'react-hook-form';

export type FormInputProps = Partial<Omit<ControllerRenderProps, 'ref'> & {
	required: boolean,
	label: string | JSX.Element,
	disabled: boolean,
	className: string,
	error: boolean,
	helperText: string,
}>;

export type InputControllerProps<T> = T & FormInputProps & {
	Input: (props: T) => JSX.Element,
	name: string,
	control?: any,
	formError?: any,
	defaultValue?: any,
	onChange?: (event) => void,
	onBlur?: () => void,
};

// eslint-disable-next-line
export const InputController = forwardRef(<T,>({
	Input,
	name,
	control,
	formError,
	defaultValue,
	onChange,
	onBlur,
	...props
}: InputControllerProps<T>, ref) => (
	<Controller
		name={name}
		control={control}
		defaultValue={defaultValue}
		render={({ field }) => (
			// @ts-ignore
			<Input
				{...field}
				{...props}
				name={name}
				onChange={(event) => {
					field.onChange(event);
					onChange?.(event);
				}}
				onBlur={() => {
					field.onBlur();
					onBlur?.();
				}}
				inputRef={ref || field.ref}
				error={!!formError}
				helperText={formError?.message}
			/>
		)}
	/>
));
