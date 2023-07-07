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

import { filesizeTooLarge } from '@/v5/store/containers/containers.helpers';
import { ErrorTooltip } from '@controls/errorTooltip';
import { useFormContext } from 'react-hook-form';
import { FormTextField } from './uploadListItemRevisionTag.styles';

type IUploadListItemRevision = {
	isSelected?: boolean;
	errorMessage?: string;
	disabled?: boolean;
	revisionPrefix: string;
};

export const UploadListItemRevisionTag = ({
	isSelected = false,
	errorMessage,
	disabled = false,
	revisionPrefix,
	...props
}: IUploadListItemRevision): JSX.Element => {
	const { setError, getValues } = useFormContext();
	const name = `${revisionPrefix}.revisionTag`;

	const handleChange = () => {
		const largeFilesizeMessage = filesizeTooLarge(getValues(`${revisionPrefix}.file`));
		if (largeFilesizeMessage) {
			setError(`${revisionPrefix}.file`, { type: 'custom', message: largeFilesizeMessage });
		}
	};

	return (
		<FormTextField
			disabled={disabled}
			formError={errorMessage}
			required
			$selectedrow={isSelected}
			name={name}
			onChange={handleChange}
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
};
