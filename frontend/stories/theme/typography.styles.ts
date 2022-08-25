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

export const TypographyContainer = styled.div`
	font-family: ${({ theme }) => theme.typography.fontFamily};
	padding: 50px;
`;

export const TypographySampleContainer = styled.div<{ typography: any, variant: string }>`
	${({ typography }) => typography};
	color: ${({ variant, theme }) => theme.palette[variant]?.mid};
	margin-bottom: 20px;
`;

export const TypographySampleText = styled.div<{ variant: string }>`
	color: ${({ variant, theme }) => theme.palette[variant]?.main};
	margin-bottom: 10px;
	border: 1px solid #cacaca;
`;
