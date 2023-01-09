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
import { DashedContainer } from '@controls/dashedContainer/dashedContainer.component';
import ArrowBackMui from '@mui/icons-material/ArrowBack';

export const ArrowBack = styled(ArrowBackMui)`
	cursor: pointer;
	height: 17px;
	width: 17px;
`;

export const CardContainer = styled.div`
	display: flex;
	height: 100%;
	flex-direction: column;
	color: ${({ theme }) => theme.palette.secondary.main};
	background: ${({ theme }) => theme.palette.primary.contrast};
	border-radius: 10px;
	margin-bottom: 20px;
	overflow: hidden;
	box-shadow: ${({ theme }) => theme.palette.shadows.level_2};

	/* The property labels for Custom Tickets should be case sensitive
	as it can be important to distinguish between an acronym and normal text. */
	.MuiInputLabel-root {
		text-transform: none;
	}
`;

export const CardHeader = styled.div`
	${({ theme }) => theme.typography.h3}
	display: flex;
	align-items: center;
	min-height: 48px;
	padding: 0 15px;
	border-bottom: 1px solid  ${({ theme }) => theme.palette.base.lightest};
	gap: 5px;
`;

export const HeaderButtons = styled.span`
	display: flex;
	gap: 5px;
	margin-left: auto;
`;

// TODO - fix after new palette is released
export const CardContentContainer = styled.div`
	padding: 15px;
	box-sizing: border-box;
	background-color: #f9faff;
	min-height: 100%;
`;

export const EmptyCardMessage = styled(DashedContainer).attrs({
	strokeColor: '#c0c8d5', // TODO - fix when new palette is released
	borderRadius: 5,
	dashSize: 2,
	gapSize: 2,
	strokeWidth: 2,
	zeroPadding: true,
})`
	text-align: center;
	font-size: 13px;
	background-color: transparent;
	color: ${({ theme }) => theme.palette.base.main};
	padding: 10px;
	box-sizing: border-box;
	width: 100%;
`;
