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

import styled from 'styled-components';

import CircularProgress from '@material-ui/core/CircularProgress';

import { COLOR, FONT_WEIGHT } from '../../../../styles';

export const Container = styled.div`
	position: absolute;
	color: ${COLOR.WHITE};
	left: 50%;
	transform: translateX(-50%);
	text-align: center;
	cursor: pointer;
	outline: none;
	margin-top: 10px;
	background-color: ${COLOR.REGENT_GRAY};
	border-radius: 25px;
	box-shadow: 0 3px 3px ${COLOR.BLACK_16};
	padding: 0 12px;
	height: 36px;
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 200px;
	pointer-events: all;
`;

export const DisplayedText = styled.div`
	font-weight: ${FONT_WEIGHT.NORMAL};
	font-size: 14px;
	text-shadow: none;
	white-space: nowrap;
	display: flex;
	align-items: center;
`;

export const ProgressWrapper = styled.div`
	color: ${COLOR.WHITE};
`;

export const StyledCircularProgress = styled(CircularProgress)`
	margin: 4px;
`;
