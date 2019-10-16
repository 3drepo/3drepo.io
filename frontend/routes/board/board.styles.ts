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

import { Button, MenuItem, Select } from '@material-ui/core';
import styled from 'styled-components';
import { COLOR } from '../../styles';

export const Container = styled.div`
	height: 100%;
	width: 100%;
	position: relative;
	display: flex;
	flex-direction: column;
`;

export const BoardContainer = styled.div`
	height: calc(100% - 50px);
	padding: 15px;
	box-sizing: border-box;

	.react-trello-board {
		background-color: initial;
		height: 100%;
    padding: 0;
	}

	.react-trello-lane {
		width: 350px;
	}
`;

export const Config = styled.div`
	background-color: ${COLOR.BLACK_12};
	min-height: 30px;
	padding: 5px 15px;
	padding-left: 15px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	position: relative;
	z-index: 1;
`;

export const DataConfig = styled.div``;

export const ViewConfig = styled.div``;

export const AddButton = styled(Button).attrs({
	mini: true,
	classes: {
		disabled: 'button--disabled'
	}
})`
	&&.button--disabled {
		background: #d9d9d9;
		color: #868686;
	}
`;

export const TitleActions = styled.div`
	display: flex;
`;

export const TypesItem = styled(MenuItem)``;

export const TypesSelect = styled(Select)``;

export const ConfigSelectItem = styled(MenuItem)``;

export const ConfigSelect = styled(Select).attrs({
	classes: {
		disabled: 'select--disabled'
	}
})`
	&& {
		margin-right: 10px;
		width: 150px;

		.select--disabled {
			color: ${COLOR.BLACK_40};
		}
	}
`;

export const TitleContainer = styled.div`
	align-items: center;
	color: ${COLOR.WHITE_87};
	display: flex;
	justify-content: space-between;
	width: 100%;

	${TypesSelect} {
		div {
			color: ${COLOR.WHITE_87};
			font-size: 20px;
			display: flex;
			align-items: center;
		}

		svg {
			color: ${COLOR.WHITE_87};
		}
	}
`;

export const SelectContainer = styled.div``;

export const LoaderContainer = styled.div`
	display: flex;
	position: absolute;
	width: 100%;
	height: 100%;
	justify-content: center;
	overflow: hidden;
	top: 0;
	left: 0;
`;

export const FormWrapper = styled.div`
	width: ${(props: any) => props.size === 'sm' ? 400 : 800}px;
`;

export const NoDataMessage = styled.div`
	align-self: center;
	color: ${COLOR.BLACK_54};
`;
