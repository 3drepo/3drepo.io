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

import { FONT_WEIGHT } from '@/v5/ui/themes/theme';
import { Box } from '@mui/material';
import styled from 'styled-components';

export const FormBox = styled(Box)`
	display: grid;
	background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	border-radius: 8px;
	padding: 10px 15px;
	margin-bottom: 5px;
	gap: 12px;
`;

export const LabelAndColor = styled.div`
	width: 100%;
    display: inline-flex;
    gap: 10px;
    align-items: end;
`;

export const Heading = styled.div`
	${({ theme }) => theme.typography.h3};
	color: ${({ theme }) => theme.palette.secondary.main};
	padding: 5px 3px;
`;

export const Subheading = styled.div`
	${({ theme }) => theme.typography.h5};
	color: ${({ theme }) => theme.palette.secondary.main};
	padding: 10px 3px;
	`;

export const CreateCollectionLink = styled.div`
	${({ theme }) => theme.typography.link};
	color: ${({ theme }) => theme.palette.secondary.main};
	font-weight: ${FONT_WEIGHT.BOLD};
	padding: 10px 1px;
`;

export const Instruction = styled.div`
	${({ theme }) => theme.typography.label};
	color: ${({ theme }) => theme.palette.base.main};
	padding: 4px 0 0;
`;

export const Buttons = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: flex-end;
	button {
		margin-bottom: 0;
		margin-top: 5px
	}
`;
