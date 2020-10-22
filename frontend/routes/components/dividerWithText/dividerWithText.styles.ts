/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import Divider from '@material-ui/core/Divider';

import { COLOR } from '../../../styles';

export const Wrapper = styled.div`
	position: relative;
	text-align: center;
`;

export const Content = styled.span`
	font-size: 14px;
	padding: 0 10px;
	background-color: ${COLOR.WHITE};
	color: ${COLOR.BLACK_30};
`;

export const StyledDivider = styled(Divider)`
	position: absolute;
	z-index: -1;
	width: 100%;
	top: 50%;
`;
