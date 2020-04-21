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

import styled, { css } from 'styled-components';

import IconButton from '@material-ui/core/IconButton';

import { COLOR } from '../../../../../../styles';
import { CheckboxCell } from '../../../../../components/customTable/customTable.styles';

export const StyledIconButton = styled(IconButton)`
	&& {
		padding: 3px;
	}
`;

export const StyledCheckboxCell = styled(CheckboxCell)`
	padding: 0;
`;

export const SectionHeader = styled.div`
	display: flex;
	justify-content: flex-start;
	align-items: center;
	font-size: 13px;
	color: ${COLOR.BLACK_60};
	background-color: ${COLOR.WHITE};
	border-bottom: 1px solid ${COLOR.BLACK_20};
	height: ${({ tall }: any) => tall ? '56px' : '40px'};
	padding: 0 8px;
`;

export const Title = styled.h3`
	align-self: center;
	font-size: 14px;
	margin-left: ${(props) => props.left ? '36px' : '6px'};
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	font-weight: normal;
`;

export const Total = styled.div`
	flex: 1;
	text-align: right;
	line-height: 1;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
	padding-left: 10px;
`;

export const List = styled.div`
	border-bottom: 1px solid ${COLOR.BLACK_20};
	&:last-of-type {
		border-bottom: none;
	}
`;

const sumUnitsStyle = css`
	width: auto;
	padding-left: 3px;
`;

export const Units = styled.div`
	width: 30px;
	text-align: right;
	padding-right: 10px;
	${({ sum }: any) => sum && sumUnitsStyle};
`;
