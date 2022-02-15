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
import ErrorCircleIcon from '@assets/icons/error_circle.svg';
import { ProgressBar } from '@controls/progressBar/progressBar.component';
import TickIcon from '@assets/icons/tick';
import { CompletionMark, Container, StatusText } from './UploadProgress.styles';

type IUploadProgress = {
	progress: number;
	failure: boolean;
};

export const UploadProgress = ({ progress, failure }: IUploadProgress): JSX.Element => {
	let statusText = <span />;
	if (Math.round(progress) === 100) statusText = <StatusText className="success">Upload complete</StatusText>;
	else if (failure) statusText = <StatusText className="failure">Upload failed <ErrorCircleIcon /></StatusText>;
	else if (progress < 100 && progress > 0) statusText = <StatusText className="uploading">Uploading</StatusText>;
	else if (progress === 0) statusText = <StatusText className="waiting">Waiting to upload</StatusText>;
	else statusText = <StatusText className="error">Unexpected Error</StatusText>;

	return (
		<Container>
			{statusText}
			<ProgressBar failure={failure} progress={progress} />
			<CompletionMark> {Math.round(progress) === 100 && <TickIcon />} </CompletionMark>
		</Container>
	);
};
