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

import styled from 'styled-components';
import { LinearProgress } from '@material-ui/core';

const ProgressBarPercentage = styled.div`
	position: absolute;
	margin: auto;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	
	font-family: Inter, Arial, sans-serif;
	width: fit-content;
	user-select: none;
	font-size: 11px;
	line-height: 16px;
	font-weight: bold;
	width: 100%;
	justify-content: center;
	display: flex;
`;

export const ProgressBarPercentageLight = styled(ProgressBarPercentage)`
	color: ${({ theme }) => theme.palette.primary.contrast};
`;

export const ProgressBarPercentageDark = styled(ProgressBarPercentage)`
	&.failure, &.error {
		color: ${({ theme }) => theme.palette.error.main};
	}
	&.inProgress {
		color: ${({ theme }) => theme.palette.tertiary.main};
	}
`;

export const LabelledProgressBar = styled.div`
	position: relative;
	height: 16px;
`;

export const LinearProgressBar = styled(LinearProgress)`
	display: block;
	width: 174px;
	margin: auto 10px;
	height: 16px;
	border-radius: 5px;
`;
