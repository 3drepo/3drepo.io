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

import { IconButton, MenuItem, TextField } from '@material-ui/core';
import CancelIcon from '@material-ui/icons/Cancel';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import ShareIcon from '@material-ui/icons/Share';

import { Form } from 'formik';
import styled, { css } from 'styled-components';

import { FONT_WEIGHT } from '../../../../../../styles';
import { COLOR } from '../../../../../../styles';

export const IconStyles = css`
	cursor: pointer;

	&:hover {
		color: ${COLOR.BLACK_40};
	}
`;

export const ViewpointItem = styled(MenuItem)`
	&& {
		height: 80px;
		padding: 8px;
		background-color: ${(props: any) => props.active ? `${COLOR.BLACK_6}` : 'initial'};
		border-bottom: 1px solid ${COLOR.BLACK_20};
		box-sizing: content-box;
	}
` as any;

export const StyledForm = styled(Form)`
	display: flex;
	align-items: center;
	flex: 1;
	justify-content: space-between;
`;

export const IconsGroup = styled.div<{ disabled: boolean }>`
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

export const StyledSaveIcon = styled(SaveIcon)`
	&& {
		${IconStyles};
	}
`;

export const SaveIconButton = styled(IconButton)`
	&& {
		padding: 0;

		&:hover {
			background-color: transparent;
		}
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

export const Name = styled.h3`
	margin-left: 16px;
	max-width: ${(props: any) => props.active ? '150px' : '260px'};
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

export const Image = styled.img`
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
