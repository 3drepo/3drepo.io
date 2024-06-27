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

import styled from 'styled-components';

export const PROGRESS_BAR_COLOR_MAP = {
	queued: ({ theme }) => theme.palette.base.main,
	uploading: ({ theme }) => theme.palette.tertiary.main,
	uploaded: ({ theme }) => theme.palette.primary.main,
	failed: ({ theme }) => theme.palette.error.main,
} as const;
export const getProgressBarColor = (status = 'failed') => PROGRESS_BAR_COLOR_MAP[status];

const ProgressBarPercentage = styled.div`
	position: absolute;
	margin: auto;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	
	font-family: Inter, Arial, sans-serif;
	user-select: none;
	font-size: 11px;
	line-height: 18px;
	font-weight: bold;
	width: 100%;
	justify-content: center;
	display: flex;
`;

export const ProgressBarLabelLight = styled(ProgressBarPercentage)`
	color: ${({ theme }) => theme.palette.primary.contrast};
`;

export const ProgressBarLabelDark = styled(ProgressBarPercentage)<{ progress: number; }>`
	${({ progress }) => `clip-path: inset(0 0 0 ${progress}%)`};
`;

export const LabelledProgressBar = styled.div<{ uploadstatus: string; }>`
	position: relative;
	color: ${({ uploadstatus }) => getProgressBarColor(uploadstatus)};
	.MuiLinearProgress-barColorPrimary {
		background-color: ${({ uploadstatus }) => getProgressBarColor(uploadstatus)};
	}
`;
