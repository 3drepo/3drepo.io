/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { ErrorTooltip } from '@controls/errorTooltip';
import { useFormContext } from 'react-hook-form';
import { RevisionCodeField } from './uploadListItemRevisionCode.styles';

type IUploadListItemCode = {
	name: string;
	isSelected?: boolean;
	disabled?: boolean;
	error?: any;
};

export const UploadListItemCode = ({ disabled = false, name, error, ...props }: IUploadListItemCode ): JSX.Element => {
	const errorMessage = error?.message;
	const errorAdornment = errorMessage ? {
		InputProps: {
			startAdornment: (
				<ErrorTooltip>
					{errorMessage}
				</ErrorTooltip>
			),
		},
	} : {};
	const { register } = useFormContext();


	return (
		<RevisionCodeField
			disabled={disabled}
			formError={errorMessage}
			{...errorAdornment}
			{...props}
			{...register(name)}
		/>
	);
};
