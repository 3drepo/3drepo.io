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
import { Typography } from '@controls/typography';
import { getProgressBarColor, PROGRESS_BAR_COLOR_MAP } from '@controls/uploadProgressBar/uploadProgressBar.styles';
import { UploadProgressBar } from '@controls/uploadProgressBar/uploadProgressBar.component';
import { Display } from '@/v5/ui/themes/media';

export const Container = styled.div`
	width: auto;
	display: inline-flex;
	align-items: center;
	margin-left: 7px;
`;

export const StatusText = styled(Typography).attrs({
	variant: 'body1',
})<{ uploadstatus: string; }>`
	width: 112px;
	font-weight: bold;
	user-select: none;
	display: inline-flex;
	color: ${({ uploadstatus }) => getProgressBarColor(uploadstatus)};
	align-items: center;
	text-align: right;

	@media (max-width: ${Display.Tablet}px) {
		display: none;
	}
`;

export const CompletionMark = styled.div`
	height: 15px;
	width: 15px;
	margin: auto 0 auto 5px;
	color: ${PROGRESS_BAR_COLOR_MAP.uploaded};
`;

export const Progress = styled(UploadProgressBar)`
	width: 174px;
`;
