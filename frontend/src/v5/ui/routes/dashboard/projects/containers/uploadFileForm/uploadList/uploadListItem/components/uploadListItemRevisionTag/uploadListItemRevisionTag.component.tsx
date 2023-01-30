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

import { ErrorTooltip } from '@controls/errorTooltip';
import { Control } from 'react-hook-form/dist/types';
import { UploadItemFields } from '@/v5/store/containers/containers.types';
import { FormTextField } from './uploadListItemRevisionTag.styles';

type IUploadListItemRevision = {
	isSelected?: boolean;
	errorMessage?: string;
	control: Control<UploadItemFields>;
	defaultValue?: string;
	disabled?: boolean;
};

export const UploadListItemRevisionTag = ({
	control,
	isSelected = false,
	errorMessage,
	disabled = false,
	defaultValue,
	...props
}: IUploadListItemRevision): JSX.Element => (
	<FormTextField
		control={control}
		disabled={disabled}
		name="revisionTag"
		formError={errorMessage}
		defaultValue={defaultValue}
		required
		$selectedrow={isSelected}
		InputProps={{
			startAdornment: !!errorMessage && (
				<ErrorTooltip>
					{errorMessage}
				</ErrorTooltip>
			),
		}}
		{...props}
	/>
);
