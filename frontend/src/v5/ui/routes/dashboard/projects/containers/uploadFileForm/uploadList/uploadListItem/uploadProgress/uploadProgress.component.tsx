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

import TickIcon from '@assets/icons/tick.svg';
import { UploadStatuses } from '@/v5/store/containers/containers.types';
import { ErrorTooltip } from '@controls/errorTooltip';
import { formatMessage } from '@/v5/services/intl';
import { RevisionsHooksSelectors } from '@/v5/services/selectorsHooks/revisionsSelectors.hooks';
import { CompletionMark, Container, Progress, StatusText } from './uploadProgress.styles';

type IUploadProgress = {
	uploadId: string;
	errorMessage: string;
};

export const UploadProgress = ({ uploadId, errorMessage }: IUploadProgress): JSX.Element => {
	let statusText: string;
	const progress: number = RevisionsHooksSelectors.selectUploadProgress(uploadId);
	let uploadStatus;
	if (errorMessage) {
		statusText = formatMessage({ id: 'uploads.progress.status.failed', defaultMessage: 'Upload failed' });
		uploadStatus = UploadStatuses.FAILED;
	} else if (progress === 100) {
		statusText = formatMessage({ id: 'uploads.progress.status.uploaded', defaultMessage: 'Upload complete' });
		uploadStatus = UploadStatuses.UPLOADED;
	} else if (progress < 100 && progress > 0) {
		statusText = formatMessage({ id: 'uploads.progress.status.uploading', defaultMessage: 'Uploading' });
		uploadStatus = UploadStatuses.UPLOADING;
	} else if (progress === 0) {
		statusText = formatMessage({ id: 'uploads.progress.status.queued', defaultMessage: 'Waiting to upload' });
		uploadStatus = UploadStatuses.QUEUED;
	} else statusText = formatMessage({ id: 'uploads.progress.status.unexpectedError', defaultMessage: 'Unexpected error' });

	return (
		<Container>
			<StatusText uploadstatus={uploadStatus}>
				{statusText}
				{errorMessage && (
					<ErrorTooltip>
						{errorMessage}
					</ErrorTooltip>
				)}
			</StatusText>
			<Progress uploadStatus={uploadStatus} progress={progress} />
			<CompletionMark> {uploadStatus === UploadStatuses.UPLOADED && <TickIcon />} </CompletionMark>
		</Container>
	);
};
