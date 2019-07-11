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

import { COLOR, FONT_WEIGHT } from '../../../../styles';
import * as RowMenu from '../rowMenu/rowMenu.styles';

const MODEL_HOVER_COLOR = COLOR.GRAY;

export const Container = styled.div`
	padding-left: 112px;
	padding-right: 13px;
	font-size: 14px;
	font-weight: ${FONT_WEIGHT.SEMIBOLD};
	color: ${COLOR.BLACK_60};
	transition: background 200ms ease-in-out;

	${RowMenu.StyledGrow} {
		position: absolute;
		box-shadow: -10px 0 26px -6px transparent;
		right: 45px;
		width: auto;
		transition: background 200ms ease-in-out;
	}

	&:hover,
	&:hover ${RowMenu.StyledGrow} {
		background: ${MODEL_HOVER_COLOR};
		box-shadow: -10px 0 20px -6px ${MODEL_HOVER_COLOR};
	}
`;

export const SubmodelsList = styled.div`
	color: ${COLOR.BLACK_30};
	font-weight: ${FONT_WEIGHT.NORMAL};
	padding-right: 30px;
	line-height: 25px;
	padding-bottom: 10px;
	font-size: 12px;
	margin-top: -10px;
`;

export const Time = styled.div`
	color: ${COLOR.BLACK_40};
	font-weight: ${FONT_WEIGHT.NORMAL};
	margin-right: 8px;
	font-size: 12px;
`;

export const LinkedName = styled.span`
	cursor: pointer;

	&:hover {
		text-decoration: underline;
	}
	width: 100%;
`;

export const Name = styled.span`
	color: ${COLOR.BLACK_40};
	width: 100%;
`;

export const Status = styled.span`
	align-items: center;
	justify-content: flex-end;
	display: flex;
	width: 100%;
	font-weight: 400;
	color: ${COLOR.BLACK_40};
	font-size: 12px;
`;

export const TimeWrapper = styled(Grid)`
	max-width: ${(props: any) => props.pending ? '48px' : '150px'};
` as any;
