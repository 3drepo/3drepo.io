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
import { Tooltip } from '@mui/material';
import { get, useFormContext, useFormState } from 'react-hook-form';
import filesize from 'filesize';
import { DashboardListItemTitle } from './uploadListItemTitle.styles';

type IUploadListItemTitle = {
	revisionPrefix: string;
	isSelected: boolean;
};

export const UploadListItemTitle = ({
	revisionPrefix,
	isSelected,
}: IUploadListItemTitle): JSX.Element => {
	const { getValues } = useFormContext();
	const { errors } = useFormState();
	const { name, size } = getValues(`${revisionPrefix}.file`);
	const errorMessage = get(errors, `${revisionPrefix}.file`)?.message;

	return (
		<DashboardListItemTitle key={revisionPrefix} subtitle={filesize(size)} selected={isSelected}>
			<Tooltip title={name} placement="bottom-start">
				<span>{name}</span>
			</Tooltip>
			{errorMessage && (
				<ErrorTooltip>
					{errorMessage}
				</ErrorTooltip>
			)}
		</DashboardListItemTitle>
	);
};
