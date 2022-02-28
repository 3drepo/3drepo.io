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
import { CompletionMark, Container, Progress, StatusText } from './UploadProgress.styles';

type IUploadProgress = {
	progress: number;
	failure: boolean;
	hidden: boolean;
};

export const UploadProgress = ({ progress, failure, hidden }: IUploadProgress): JSX.Element => {
	let statusText: string;
	let uploadStatus;
	if (progress === 100) {
		statusText = 'Upload complete';
		uploadStatus = 'uploaded';
	} else if (failure) {
		statusText = 'Upload failed';
		uploadStatus = 'failed';
	} else if (progress < 100 && progress > 0) {
		statusText = 'Uploading';
		uploadStatus = 'uploading';
	} else if (progress === 0) {
		uploadStatus = UploadStatuses.QUEUED;
		statusText = 'Waiting to upload';
	} else statusText = 'Unexpected Error';

	return hidden ? (<></>) : (
		<Container>
			<StatusText uploadStatus={uploadStatus}>
				{statusText}
			</StatusText>
			<Progress uploadStatus={uploadStatus} progress={progress} />
			<CompletionMark> {uploadStatus === 'uploaded' && <TickIcon />} </CompletionMark>
		</Container>
	);
};
