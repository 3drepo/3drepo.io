/**
 *  Copyright (C) 2026 3D Repo Ltd
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

import { Button, MenuItem } from '@mui/material';
import styled from 'styled-components';

import { CircleButton } from '@controls/circleButton';
import { TextField } from '@controls/inputs/textField/textField.component';
import { Thumbnail } from '@controls/thumbnail/thumbnail.component';

export const ViewpointItem = styled(MenuItem)<{ active?: boolean }>`
	padding: 8px;
	border-bottom: 1px solid ${({ theme }) => theme.palette.base.lightest};
	box-sizing: border-box;

	&, &.Mui-focusVisible {
		background-color: ${({ active, theme }) => active ? theme.palette.primary.lightest : theme.palette.primary.contrast};
	}

	${({ active }) => `
		padding: ${active ? '12px 15px' : '12px 40px 12px 15px'};
	`}
` as any;

export const IconButton = styled(CircleButton)`
	margin: 0;
	&:hover {
		color: ${({ theme }) => theme.palette.secondary.light};
	}
`;

export const ViewThumbnail = styled(Thumbnail)`
	width: 79px;
	height: 79px;
	border-radius: 8px;
	border: 1px solid ${({ theme }) => theme.palette.base.lightest};
`;

export const StyledForm = styled.form`
	display: flex;
	align-items: center;
	flex: 1;
	justify-content: space-between;
`;

export const IconsGroup = styled.div`
	display: flex;
	align-items: center;
	margin-right: 0;
`;

export const NewViewpointName = styled(TextField)`
	margin-left: 12px;
	margin-right: 12px;
`;

export const NameRow = styled.div`
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

export const ViewpointName = styled.div<{ active?: boolean }>`
	margin-left: 16px;
	max-width: ${({ active }) => active ? '150px' : '260px'};
	${({ theme }) => theme.typography.h5};
	color: ${({ theme }) => theme.palette.secondary.main};
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

export const Subtitle = styled.small`
	display: block;
	color: ${({ theme }) => theme.palette.secondary.mid};
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
