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
import { CircleButton } from '@controls/circleButton';

export const Container = styled.span`
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	position: relative;
	${({ open }: {open: boolean}) => (open ? 'width: 400px; transition: width 0.1s;' : 'width: 0; transition: width 0.1s;')}
`;

export const Content = styled.div`
	overflow: hidden;
	margin: 30px;
	width: 340px;
`;

export const Button = styled(CircleButton)`
	position: absolute;
	right: 11px;
	top: 14px;
	z-index: 1;
`;
