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
import { get } from 'lodash';
import { Controller, ControllerRenderProps, useFormContext } from 'react-hook-form';

export type FormInputProps = Partial<Omit<ControllerRenderProps, 'ref'> & {
	required: boolean,
	label: string | JSX.Element,
	disabled: boolean,
	error: boolean,
	helperText: string,
	className: string,
	inputRef: any,
}>;

// eslint-disable-next-line @typescript-eslint/comma-dangle
export type InputControllerProps<T,> = T & FormInputProps & {
	name: string,
	control?: any,
	formError?: any,
	defaultValue?: any,
	onChange?: (event) => void,
	onBlur?: () => void,
	transformValueIn?: (val) => void,
	transformChangeEvent?: (val) => void,
	children?: any,
};

type Props<T> = InputControllerProps<T> & {
	Input: (props: T) => JSX.Element,
};

export type InputControllerType = <T>(Component: Props<T>, ref) => JSX.Element;
// eslint-disable-next-line @typescript-eslint/comma-dangle
export const InputController: InputControllerType = forwardRef(<T,>({
	Input,
	name,
	control,
	formError,
	defaultValue,
	onChange,
	onBlur,
	transformValueIn = (val) => val,
	transformChangeEvent = (val) => val,
	...props
}: Props<T>, ref) => {
	const ctx = useFormContext();
	const error = formError || get(ctx?.formState?.errors, name);

	return (
		<Controller
			name={name}
			control={control}
			defaultValue={defaultValue}
			render={({ field: { ref: fieldRef, ...field } }) => {
				return (
				// @ts-ignore
					<Input
						{...field}
						{...props}
						value={transformValueIn(field.value) ?? ''}
						onChange={(event) => {
							field.onChange(transformChangeEvent(event));
							onChange?.(transformChangeEvent(event));
						}}
						onBlur={() => {
							field.onBlur();
							onBlur?.();
						}}
						inputRef={ref || fieldRef}
						error={!!error}
						helperText={error?.message}
					/>
				);
			}}
		/>
	);
});
