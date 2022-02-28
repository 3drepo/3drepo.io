/**
 *  Copyright (C) 2021 3D Repo Ltd
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
import TickIcon from '@assets/icons/tick';
import { UploadStatuses } from '@/v5/store/containers/containers.types';
import { ErrorTooltip } from '@controls/errorTooltip';
import { AxiosError } from 'axios';
import { CompletionMark, Container, Progress, StatusText } from './UploadProgress.styles';

type IUploadProgress = {
	progress: number;
	error: AxiosError;
	hidden: boolean;
};

export const UploadProgress = ({ progress, error, hidden }: IUploadProgress): JSX.Element => {
	let statusText: string;
	let uploadStatus;
	let errorMessage = '';
	if (error) {
		statusText = 'Upload failed';
		uploadStatus = UploadStatuses.FAILED;
		if (Object.prototype.hasOwnProperty.call(error, 'response')) {
			const { response: { data: { message, status, code } } } = error;
			errorMessage = `${status} - ${code} (${message})`;
		} else errorMessage = error.message;
	} else if (progress === 100) {
		statusText = 'Upload complete';
		uploadStatus = UploadStatuses.UPLOADED;
	} else if (progress < 100 && progress > 0) {
		statusText = 'Uploading';
		uploadStatus = UploadStatuses.UPLOADING;
	} else if (progress === 0) {
		statusText = 'Waiting to upload';
		uploadStatus = UploadStatuses.QUEUED;
	} else statusText = 'Unexpected Error';

	return hidden ? (<></>) : (
		<Container>
			<StatusText uploadStatus={uploadStatus}>
				{statusText}
				{errorMessage && (
					<ErrorTooltip>
						{errorMessage}
					</ErrorTooltip>
				)}
			</StatusText>
			<Progress uploadStatus={uploadStatus} progress={progress} />
			<CompletionMark> {uploadStatus === 'uploaded' && <TickIcon />} </CompletionMark>
		</Container>
	);
};
