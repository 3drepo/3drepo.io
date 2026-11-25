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

import styled from 'styled-components';
import { CircleButton } from '@controls/circleButton';
import { TextField } from '@controls/inputs/textField/textField.component';
import { Thumbnail } from '@controls/thumbnail/thumbnail.component';
import { SubmitButton } from '@controls/submitButton';

const THUMBNAIL_SIZE = 80;

export const ViewpointItem = styled.div<{ active?: boolean }>`
	display: grid;
	grid-template-columns: ${THUMBNAIL_SIZE}px auto;
	padding: 8px;
	box-sizing: border-box;
	background-color: ${({ active, theme }) => active ? theme.palette.primary.lightest : theme.palette.primary.contrast};

	${({ active }) => `
		padding: ${active ? '12px 15px' : '12px 40px 12px 15px'};
	`}
` as any;

export const NewViewpointItem = styled.div<{ active?: boolean }>`
	border-top: 1px solid ${({ theme }) => theme.palette.base.lightest};
`;

export const IconButton = styled(CircleButton)`
	margin: 0;
`;

export const ViewThumbnail = styled(Thumbnail)`
	width: ${THUMBNAIL_SIZE}px;
	height: ${THUMBNAIL_SIZE}px;
	border-radius: 8px;
	outline: 1px solid ${({ theme }) => theme.palette.base.lightest};
`;

export const StyledForm = styled.form`
	display: inline-flex;
	max-width: 100%;
	align-items: center;
	justify-content: space-between;
`;

export const IconsGroup = styled.div`
	display: flex;
	align-items: center;
	margin-left: auto;
`;

export const NewViewpointName = styled(TextField)`
	margin-top: -15px;
	margin-left: 12px;
	max-width: 180px;
`;

export const NameRow = styled.div`
	display: inline-flex;
	align-items: center;
	overflow: hidden;
`;

export const ViewpointName = styled.div`
	margin-left: 16px;
	${({ theme }) => theme.typography.h5};
	color: ${({ theme }) => theme.palette.secondary.main};
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	width: 100%;
`;

export const Subtitle = styled.div`
	${({ theme }) => theme.typography.body1};
	display: block;
	color: ${({ theme }) => theme.palette.secondary.mid};
`;

export const SaveButton = styled(SubmitButton)`
	height: 23px;
	min-width: 44px;
	font-size: 10px;
`;
