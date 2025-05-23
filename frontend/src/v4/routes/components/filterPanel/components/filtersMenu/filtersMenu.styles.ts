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

import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import TextField from '@mui/material/TextField';
import { TextField as CalendarTextField } from '@controls/inputs/datePicker/baseCalendarPicker/baseCalendarPicker.styles';

import { COLOR } from '../../../../../styles';
import { FileUploadInvoker } from '../../../../viewerGui/components/commentForm/commentForm.styles';
import { Wrapper } from '../childMenu/childMenu.styles';

export const StyledList = styled(List)<{ $hasDateTimeInputs?: boolean }>`
	${({ $hasDateTimeInputs }) => $hasDateTimeInputs && css`
		${Wrapper} {
			min-width: 210px;
		}
	`}
`;

export const MenuList = styled(List)`
	background-color: ${COLOR.WHITE};
	width: 100%;
	box-shadow: 0 1px 3px 0 ${COLOR.BLACK_20};
	border-radius: 2px;

	&& {
		padding-top: 4px;
		padding-bottom: 4px;
	}
`;

export const NestedWrapper = styled.div`
	position: relative;
`;

export const StyledItemText = styled.div`
	color: ${COLOR.BLACK_60};
	font-size: 12px;
	display: flex;
	justify-content: space-between;
	width: 100%;
	align-items: center;
`;

export const DateTimePickerWrapper = styled.div`
	&& ${CalendarTextField} {
		width: 144px;
	}
`;

export const IconWrapper = styled.div`
	color: ${COLOR.BLACK_60};
	font-size: 12px;
	margin-right: 10px;
`;

export const StyledListItem = styled(ListItemButton)<{ $isDateTime?: boolean }>`
	&&& {
		padding: 4px 10px;
		height: 30px;
		min-width: ${({ $isDateTime }) => $isDateTime ? 212 : 180}px;

		${FileUploadInvoker} {
			display: none;
		}
	}
`;

export const DateTimeTextField = styled(TextField)`
	width: 160px;
	min-width: 158px;
`;

export const CopyItem = styled.div`
	display: flex;
	align-items: center;
	padding: 4px 0;
`;

export const CopyText = styled.span`
	margin-left: 4px;
`;

export const MenuFooter = styled.div`
	border-top: 1px solid ${COLOR.BLACK_20};
	padding-top: 8px;
	padding-bottom: 8px;
`;

export const DataTypesWrapper = styled.div`
	border-bottom: 1px solid ${COLOR.BLACK_20};
`;
