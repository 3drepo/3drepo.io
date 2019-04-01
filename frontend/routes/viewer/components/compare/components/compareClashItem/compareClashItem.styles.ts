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
import { ButtonBase } from '@material-ui/core';

import { FONT_WEIGHT, COLOR } from '../../../../../../styles';
import { TARGET_MODEL_TYPE } from '../../../../../../constants/compare';
import { SelectField as SelectFieldComponent } from '../../../../../components/selectField/selectField.component';

interface IContainer {
	disabled: boolean;
}

interface IClashTypeSwitch {
	value: string;
}

export const Container = styled.div<IContainer>`
	display: flex;
	align-items: center;
	border-bottom: 1px solid ${COLOR.BLACK_20};
	height: 80px;
	padding-right: 30px;
`;

export const Model = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	width: 100%;
`;

export const Name = styled.div`
	font-size: 14px;
	color: ${COLOR.BLACK_80};
	font-weight: ${FONT_WEIGHT.BOLD};
`;

export const SelectField = styled(SelectFieldComponent)`
	&&:before {
		border-bottom: none !important;
	}
`;

export const ClashSettings = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 20px;
	margin-top: 10px;
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
