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

import { IconButton, MenuItem, TextField, Button } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';

import { Form } from 'formik';
import styled, { css } from 'styled-components';

import { AuthImg } from '@components/authenticatedResource/authImg.component';
import { FONT_WEIGHT } from '../../../../../../styles';
import { COLOR } from '../../../../../../styles';

export const IconStyles = css`
	cursor: pointer;

	&:hover {
		color: ${COLOR.BLACK_40};
	}
`;

export const ViewpointItem = styled(MenuItem)<{ active?: boolean }>`
	&& {
		padding: 8px;
		background-color: ${({ active }) => active ? `${COLOR.BLACK_6}` : 'initial'};
		border-bottom: 1px solid ${COLOR.BLACK_20};
		box-sizing: border-box;

		${({ active }) => `
			padding: ${active ? '12px 15px' : '12px 40px 12px 15px'};
		`}
	}
` as any;

export const StyledForm = styled(Form)`
	display: flex;
	align-items: center;
	flex: 1;
	justify-content: space-between;
`;

export const IconsGroup = styled.div<{ disabled?: boolean }>`
	display: flex;
	align-items: center;
	margin-right: 0;
	${({ disabled }) => disabled ? css`
		pointer-events: none;
		opacity: 0.2;
	` : ``}
`;

export const ThumbnailPlaceholder = styled.div`
	width: 79px;
	height: 79px;
	align-items: center;
	text-align: center;
	line-height: 5.5;
	justify-content: center;
	color: ${COLOR.BLACK_30};
	border: 1px solid ${COLOR.BLACK_20};
`;

export const StyledDeleteIcon = styled(DeleteIcon)`
	&& {
		${IconStyles}
	}
`;

export const StyledEditIcon = styled(EditIcon)`
	&& {
		${IconStyles};
		margin-right: 14px;
	}
`;

export const NewViewpointName = styled(TextField)`
	&& {
		margin-left: 12px;
		margin-right: 12px;
	}
`;

export const StyledCancelIcon = styled(CancelIcon)`
	&& {
		${IconStyles};
		margin-right: 14px;
	}
`;

export const StyledShareIcon = styled(ShareIcon)`
	&& {
		${IconStyles};
		margin-right: 14px;
	}
`;

export const NameRow = styled.div`
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

export const Name = styled.h3<{ active?: boolean }>`
	margin-left: 16px;
	max-width: ${({ active }) => active ? '150px' : '260px'};
	font-weight: ${FONT_WEIGHT.NORMAL};
	font-size: 14px;
	color: ${COLOR.BLACK};
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

export const Small = styled.small`
	display: block;
	color: ${COLOR.BLACK_60};
`;

export const Image = styled(AuthImg)`
	width: 79px;
	height: 79px;
	object-fit: cover;
`;

export const HamburgerIconButton = styled(IconButton)`
	&& {
		${IconStyles};
		width: 24px;
	}

	&:first-child {
		margin-right: -18px;
	}

	&&:hover {
		background-color: ${COLOR.TRANSPARENT}
	}
`;

export const SaveButton = styled(Button).attrs({
	variant: 'outlined',
	color: 'secondary',
})`
	position: relative;
	left: 17px;
	height: 23px;
	min-width: 44px;
	font-size: 10px;
	padding: 5px 7px;

	&:hover {
		background-color: ${({ theme }) => theme.palette.secondary.main} !important;
		color: ${({ theme }) => theme.palette.primary.contrast};
	}

	&:active {
		background-color: ${({ theme }) => theme.palette.secondary.dark} !important;
		color: ${({ theme }) => theme.palette.primary.contrast};
	}
`;
