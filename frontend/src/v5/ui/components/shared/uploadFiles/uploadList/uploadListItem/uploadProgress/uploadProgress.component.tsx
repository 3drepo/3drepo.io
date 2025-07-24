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

import TickIcon from '@assets/icons/outlined/tick-outlined.svg';
import { ErrorTooltip } from '@controls/errorTooltip';
import { CompletionMark, Container, Progress, StatusText } from './uploadProgress.styles';

import type { JSX } from "react";

type IUploadProgress = {
	uploadId: string;
	errorMessage: string;
	progress: number;
	uploadCompleted: boolean;
	uploadStatus: string;
	statusText: string;
};

export const UploadProgress = ({ errorMessage, progress, uploadCompleted, uploadStatus, statusText }: IUploadProgress): JSX.Element => (
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
		<CompletionMark> {uploadCompleted && <TickIcon />} </CompletionMark>
	</Container>
);
