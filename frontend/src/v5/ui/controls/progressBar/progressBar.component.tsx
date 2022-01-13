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
import { LabelledProgressBar, LinearProgressBar, ProgressBarPercentageLight, ProgressBarPercentageDark } from './progressBar.styles';

type IProgressBar = {
	progress: number;
	noLabel?: boolean;
	failure?: boolean;
};

export const ProgressBar = ({ progress, noLabel = false, failure = false, ...props }: IProgressBar): JSX.Element => {
	let statusClass = 'error';
	if (failure) statusClass = 'failure';
	else if (progress === 100) statusClass = 'success';
	else if (progress < 100 && progress > 0) statusClass = 'inProgress';
	else if (progress === 0) statusClass = 'waiting';

	return (
		<LabelledProgressBar>
			<LinearProgressBar className={statusClass} color="primary" variant="determinate" value={progress} {...props} />
			<ProgressBarPercentageLight hidden={noLabel}>{`${Math.round(progress)}%`}</ProgressBarPercentageLight>
			<ProgressBarPercentageDark className={statusClass} style={{ clipPath: `inset(0 0 0 ${progress}%)` }} hidden={noLabel}>{`${Math.round(progress)}%`}</ProgressBarPercentageDark>
		</LabelledProgressBar>
	);
};
