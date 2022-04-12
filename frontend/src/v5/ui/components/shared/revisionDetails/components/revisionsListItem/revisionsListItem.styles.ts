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
import DownloadIconBase from '@assets/icons/download_arrow.svg';
import { IconButton } from '@mui/material';

export const Container = styled.div`
	display: flex;
	align-items: center;
	height: 100%;
	padding-left: 20px;
	padding-right: 13px;
`;

export const DownloadIcon = styled(DownloadIconBase)`
	color: ${({ theme }) => theme.palette.primary.contrast};
`;

export const DownloadButton = styled(IconButton)`
	margin: 0 0 0 11px;
	&:hover {
		background: transparent;

		& ${DownloadIcon} {
			color: ${({ theme }) => theme.palette.primary.main};
		}
	}
`;
