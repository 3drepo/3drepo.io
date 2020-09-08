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

import {
	Chip as ChipComponent,
	FormControl as FormControlComponent,
	IconButton as IconButtonComponent,
	InputLabel as InputLabelComponent,
	List as ListComponent,
	ListSubheader,
	MenuItem as MenuItemComponent
} from '@material-ui/core';
import MoreIcon from '@material-ui/icons/MoreVert';
import styled, { css } from 'styled-components';

import { hexToRgba } from '../../../helpers/colors';
import { COLOR } from '../../../styles';
import { SelectField as SelectFieldComponent } from '../selectField/selectField.component';

export const Container = styled.div`
	height: 100%;
	box-sizing: border-box;
	border-top: 1px solid ${COLOR.BLACK_20};
`;

export const FiltersContainer = styled.div`
	padding-top: 8px;
	background-color: ${COLOR.WHITE};
`;

export const InputLabel = styled(InputLabelComponent)`
	&& {
		font-size: 11px;
		padding: 0 12px;
	}
`;

export const Placeholder = styled.div`
	&& {
		padding-top: 13px;
		color: ${COLOR.BLACK_30};
		font-size: 14px;
	}
`;

export const SelectedCriteria = styled.div`
	position: relative;
	min-height: 40px;
	padding: 5px 12px;
`;

export const ChipsContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	padding-right: 40px;
	overflow: hidden;
	position: relative;
`;

export const ChipsDeselectCatcher = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	z-index: 0;
`;

export const Chip = styled(ChipComponent)`
	&& {
		z-index: 1;
		margin-right: 4px;
		margin-top: 3px;
		margin-bottom: 3px;
		max-width: 100%;
		overflow: hidden;
	}

	&& > span {
		text-overflow: ellipsis;
		display: block;
		overflow: hidden;
	}
`;

export const OptionsList = styled(ListComponent)`
	background-color: ${COLOR.WHITE};
	width: 100%;
	min-width: 140px;
	max-width: 300px;
	box-shadow: 0 1px 3px 0 ${COLOR.BLACK_20};
	border-radius: 2px;
`;

export const ButtonContainer = styled.div`
	position: absolute;
	right: 12px;
	bottom: 0;
	margin-bottom: 8px;
	display: flex;
	align-items: center;
	height: 32px;
`;

export const IconButton = styled(IconButtonComponent)`
	&& {
		width: 28px;
		height: 28px;
		padding: 4px;
	}
`;

export const StyledMoreIcon = styled(MoreIcon)`
	&& {
		font-size: 20px;
	}
`;

export const FormControl = styled(FormControlComponent)`
	&& {
		margin: 8px 0;
		width: 100%;
	}
`;

export const FormContainer = styled.div`
	border-top: 1px solid ${COLOR.BLACK_20};
	padding: 22px;
	padding-top: 12px;
`;

export const CriteriaList = styled(ListComponent)`
	max-height: 300px;
	overflow: auto;
`;

export const Operators = styled.ul`
	padding: 0;
`;

export const SelectField = styled(SelectFieldComponent)`
	width: 100%;
`;

const emptySelectFieldValueStyle = css`
	color: ${COLOR.BLACK_87};
	opacity: 0.42;
`;

export const SelectFieldValue = styled.div`
	${(props: any) => props.placeholder && emptySelectFieldValueStyle};
` as any;

export const MenuItem = styled(MenuItemComponent)`
	&& {
		color: ${COLOR.BLACK_87};
		padding: 4px 10px;
		height: 30px;
		min-width: 180px;
	}
`;

export const NewCriterionFooter = styled.div`
	margin-top: 12px;
	display: flex;
	align-items: center;
	justify-content: ${(props: any) => props.spaced ? 'space-between' : 'flex-end'};
` as any;

export const OperatorSubheader = styled(ListSubheader)`
	&:not(:first-of-type) {
		border-top: 1px solid ${COLOR.BLACK_6};
	}

	&& {
		pointer-events: none;
		outline: none;
		padding-left: 16px;
		background-color: ${COLOR.WHITE};
		color: ${COLOR.BLACK_60}
	}
`;

export const CustomError = styled.div `
	color: ${COLOR.POMEGRANATE};
	font-size: 12px;
`;
