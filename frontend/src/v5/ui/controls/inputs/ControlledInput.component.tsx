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

type ForwardableProps = Partial<Omit<ControllerRenderProps, 'ref'> & {
	name: string,
	required: boolean,
	label: string | JSX.Element,
	disabled: boolean,
	className: string,
}>;

export type FormInputProps = ForwardableProps & Partial<{
	error: any,
	helperText: string,
	inputRef: any,
}>;

type ControlledInputProps = ForwardableProps & {
	Input: ({ ...props }: FormInputProps) => JSX.Element,
	name: string,
	control?: any,
	formError?: any,
	defaultValue?: any,
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
				name={name}
				inputRef={ref}
				error={!!formError}
				helperText={formError?.message}
			/>
		)}
	/>
);
