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
import { get, useFormContext } from 'react-hook-form';
import { DashboardListItemTitle, SubTitleError } from './uploadListItemTitle.styles';
import { FormattedMessage } from 'react-intl';
import { formatInfoUnit } from '@/v5/helpers/intl.helper';

type IUploadListItemTitle = {
	name: string;
	size: number;
	revisionPrefix: string;
	isSelected: boolean;
	isMultiPagePdf?: boolean;
};

export const UploadListItemTitle = ({
	name,
	size,
	revisionPrefix,
	isMultiPagePdf = false, 
	isSelected,
}: IUploadListItemTitle): JSX.Element => {
	const { formState: { errors } } = useFormContext();
	const errorMessage = get(errors, `${revisionPrefix}.file`)?.message;

	const ErrorSubTitle = () => (
		<>
			{formatInfoUnit(size)}
			<SubTitleError>
				{errorMessage}
			</SubTitleError>
		</>
	);

	const SubTitle = () => (
		<>
			{formatInfoUnit(size)}
			{isMultiPagePdf && (
				<SubTitleError>
					<FormattedMessage
						id="drawing.uploads.pdf.useFirstPage.message"
						defaultMessage="This PDF contains multiple pages. Only the first page will be used"
					/>
				</SubTitleError>
			)}
		</>
	);

	return (
		<DashboardListItemTitle key={revisionPrefix} subtitle={errorMessage ? <ErrorSubTitle /> : <SubTitle />} selected={isSelected}>
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
