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
import styled, { css } from 'styled-components';
import DownloadIconBase from '@assets/icons/outlined/download_arrow-outlined.svg';
import { IconButton } from '@mui/material';
import { Container as fixedOrGrowContainer } from '@/v5/ui/controls/fixedOrGrowContainer/fixedOrGrowContainer.styles';
import { hexToOpacity } from '@/v5/helpers/colors.helper';
import { Link } from 'react-router-dom';
import { RevisionsListItemText } from './revisionsListItemText/revisionsListItemText.component';

export const Container = styled(Link) <{ disabled: boolean }>`
	display: flex;
	align-items: center;
	height: 100%;
	padding-left: 20px;
	padding-right: 153px;
	color: ${({ theme }) => theme.palette.primary.contrast};
	background-color: ${({ theme }) => theme.palette.secondary.mid};

	&:link { text-decoration: none; }
	&:visited { text-decoration: none; }
	&:hover { text-decoration: none; }
	&:active { text-decoration: none; }

	${fixedOrGrowContainer} > * {
		text-overflow: ellipsis;
		overflow: hidden;
		padding-right: 10px;
	}

	${({ disabled }) => disabled ? css`
		cursor: default;
	` : css`
		&:hover {
			background-color: ${({ theme }) => hexToOpacity(theme.palette.secondary.main, 50)};
		}
	`}
`;

export const DownloadIcon = styled(DownloadIconBase)`
	color: ${({ theme }) => theme.palette.primary.contrast};
	height: 18px;
`;

export const DownloadButton = styled(IconButton)`
	&:hover {
		background: transparent;

		& ${DownloadIcon} {
			color: ${({ theme }) => theme.palette.primary.main};
		}
	}

	position: absolute;
	right: 0;
`;

export const RevisionsListItemTag = styled(RevisionsListItemText)`
	text-decoration: underline;
`;
