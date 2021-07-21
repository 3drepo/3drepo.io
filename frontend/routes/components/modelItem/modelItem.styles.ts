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

export const Container = styled.div``;

const BaseStyles = styled(Grid)`
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
	width: 100%;
`;

export const Name = styled(BaseStyles)`
	color: ${COLOR.BLACK_60};
	font-size: 14px;
	line-height: 20px;
`;

export const Detail = styled(BaseStyles)`
	font-size: 10px;
	color: ${COLOR.BLACK_40};
	line-height: 13px;
`;
