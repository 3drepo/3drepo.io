/**
 *  Copyright (C) 2023 3D Repo Ltd
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
import { FONT_WEIGHT } from '@/v5/ui/themes/theme';
import { Link as BaseLink } from 'react-router-dom';

export const Container = styled.div`
	display: contents;
`;

export const MicrosoftTitleText = styled.div`
	${({ theme }) => theme.typography.h1};
	color: ${({ theme }) => theme.palette.secondary.main};
	margin-bottom: 10px;
	display: flex;
	align-items: center;
`;

export const MicrosoftInstructionsText = styled.div`
	${({ theme }) => theme.typography.body1};
	color: ${({ theme }) => theme.palette.base.main};
	margin-bottom: 15px;
	width: 376px;
`;

export const MicrosoftInstructionsRemarkText = styled.div`
	${({ theme }) => theme.typography.caption};
	color: ${({ theme }) => theme.palette.secondary.main};
	font-weight: ${FONT_WEIGHT.BOLDER};
`;

export const MicrosoftInstructionsTermsText = styled.div`
	${({ theme }) => theme.typography.caption};
	color: ${({ theme }) => theme.palette.base.main};
	width: 360px;
	margin-bottom: 20px;
`;

export const Link = styled(BaseLink)`
	&& {
		color: ${({ theme }) => theme.palette.primary.main};
		text-decoration: none;
		font-weight: ${FONT_WEIGHT.BOLD};
	}
`;

export const NewSticker = styled.div`
	color: ${({ theme }) => theme.palette.primary.main};
	border: solid 1.5px ${({ theme }) => theme.palette.primary.main}; 
	border-radius: 5px;
	padding: 4px 6px;
	font-size: 10px;
	font-weight: 700;
	margin-left: 8px;
	height: 12px;
	display: inline-flex;
	justify-content: center;
	align-items: center;
`;
