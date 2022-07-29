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

import { Typography } from '@controls/typography';
import styled from 'styled-components';
import Dropzone from 'react-dropzone';
import { DashedContainer } from '@controls/dashedContainer/dashedContainer.component';

export const Container = styled(Dropzone)`
	position: relative;
	width: 100%;
	height: 100%;
`;

export const UploadDialog = styled(DashedContainer).attrs(({ theme }) => ({
	borderRadius: 10,
	dashSize: 5,
	strokeColor: theme.palette.primary.main,
}))`
	width: 100%;
	height: 100%;
	padding: 30px;
	box-sizing: border-box;
	user-select: none;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	&.drag-over {
		background-color: ${({ theme }) => theme.palette.primary.lightest};
	}
`;

export const HelpText = styled(Typography).attrs({
	variant: 'h5',
})`
	color: ${({ theme }) => theme.palette.base.main};
	padding: 10px;
	a { color: inherit }
`;
