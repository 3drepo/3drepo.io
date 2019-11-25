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

import { ButtonBase } from '@material-ui/core';
import styled from 'styled-components';

import { TARGET_MODEL_TYPE } from '../../../../../../constants/compare';
import { COLOR } from '../../../../../../styles';
import * as RevisionSelectStyles from '../revisionsSelect/revisionsSelect.styles';

interface IContainer {
	disabled?: boolean;
}

interface IName {
	disabled?: boolean;
}

interface INoRevisionInfo {
	disabled?: boolean;
}

interface IClashTypeSwitch {
	value: string;
}

export const Container = styled.li<IContainer>`
	display: flex;
	align-items: center;
	border-bottom: 1px solid ${COLOR.BLACK_6};
	height: 80px;
	padding-right: 30px;

	${RevisionSelectStyles.Name} {
		color: ${(props) => props.disabled ? COLOR.BLACK_20 : COLOR.BLACK_60 };
	}
`;

export const Model = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	width: 100%;
`;

export const Name = styled.div<IName>`
	font-size: 14px;
	color: ${(props) => props.disabled ? COLOR.BLACK_20 : COLOR.BLACK_80};
`;

export const ClashSettings = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 20px;
	margin-top: 6px;
`;

export const NoRevisionInfo = styled.div<INoRevisionInfo>`
	color: ${COLOR.BLACK_20};
	font-size: 14px;
	width: 142px;
	display: inline-block;
	text-overflow: ellipsis;
	overflow: hidden;
`;

export const ClashTypeSwitch = styled(ButtonBase)<IClashTypeSwitch>`
	&& {
		font-size: 14px;
		color: ${COLOR.WHITE};
		background-color: ${(props) => props.value === TARGET_MODEL_TYPE ? '#63A4FF' : '#FFCA28'};
		cursor: pointer;
		box-sizing: border-box;
		width: 85px;
		height: 20px;
		padding: 0 9px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
`;
