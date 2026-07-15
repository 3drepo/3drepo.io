/**
 *  Copyright (C) 2022 3D Repo Ltd
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
import TextFieldBase from '@mui/material/TextField';
import { Box } from '@mui/system';
import { DateField as MuiDateField } from '@mui/x-date-pickers/DateField';
import { TimeField as MuiTimeField } from '@mui/x-date-pickers/TimeField';

export const TextField = styled(TextFieldBase)`
	caret-color: transparent;

	button, .MuiInputAdornment {
		color: currentColor;
	}

	& .MuiInputAdornment-root {
		margin:0;
	}

	.MuiInputBase-root {
		padding: 0;

		&, & input {
			cursor: pointer;
			padding-right: 0;
			text-overflow: ellipsis;
		}

		&.Mui-disabled {
			&, & * {
				cursor: context-menu;
			}
		}
	}

	.MuiIconButton-edgeEnd {
		margin: 0;
		padding: 5px 7px;

		&:hover {
			background-color: transparent;
		}
	}
`;

export const ActionsRow = styled(Box)`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 22px;
	height: 40px;
`;

export const ClearDateAction = styled.div`
	${({ theme }) => theme.typography.body1}
	font-weight: 500;
	color: ${({ theme }) => theme.palette.error.main};
	cursor: pointer;
`;

export const ApplyAction = styled.div`
	${({ theme }) => theme.typography.body1}
	font-weight: 500;
	color: ${({ theme }) => theme.palette.primary.main};
	cursor: pointer;
`;

export const PopperWrapper = styled(Box)`
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	/* stylelint-disable-next-line */
	box-shadow: rgba(0, 0, 0, 0.2) 0px 5px 5px -3px, rgba(0, 0, 0, 0.14) 0px 8px 10px 1px, rgba(0, 0, 0, 0.12) 0px 3px 14px 2px;
	padding: 1px;
	border: none;
`;

export const FieldsRow = styled(Box)`
	display: flex;
	gap: 8px;
	padding: 16px 22px 8px;
`;

const pickerFieldStyles = ({ theme }) => `
	flex: 1;

	.MuiOutlinedInput-root {
		border-radius: 8px;
		padding-left: 10px;
		font-size: 13px;
		cursor: pointer;

		&.Mui-focused .MuiOutlinedInput-notchedOutline {
			border-color: ${theme.palette.primary.main};
			border-width: 1px;
		}

		.MuiOutlinedInput-notchedOutline {
			border-color: ${theme.palette.base.lightest};
		}
	}

	.MuiInputAdornment-root {
		margin-right: 4px;
		color: ${theme.palette.base.main};

		svg {
			width: 15px;
			height: 15px;
		}
	}

	.MuiOutlinedInput-input,
	.MuiPickersSectionList-root {
		padding: 8px 10px 8px 0;
		cursor: pointer;
	}
`;

export const DateField = styled(MuiDateField)`
	${pickerFieldStyles}
`;

export const TimeField = styled(MuiTimeField)`
	${pickerFieldStyles}
`;
