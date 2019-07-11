/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import Grid from '@material-ui/core/Grid';
import styled from 'styled-components';
import { COLOR } from '../../../styles';

import { ellipsis } from '../../../styles';

export const Name = styled(Grid)`
	${ellipsis('calc(100% - 18px)')};
	font-size: 14px;
	color: ${COLOR.BLACK_60};
`;

export const Color = styled(Grid)`
	width: 6px;
	height: 6px;
	border-radius: 100%;
	background-color: ${(props) => props.color || COLOR.BLACK_6};
	margin-right: 12px !important;
`;
