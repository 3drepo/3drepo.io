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
import { Button } from '@controls/button';
import UserIconBase from '@assets/icons/filled/user-filled.svg';
import { ScrollArea as ScrollAreaBase } from '@controls/scrollArea';
import { Truncate } from '@/v4/routes/components/truncate/truncate.component';
import { Avatar as AvatarBase } from '@controls/avatar';

export const ScrollArea = styled(ScrollAreaBase).attrs({
	variant: 'base',
})``;

export const Header = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
`;

export const Avatar = styled(AvatarBase).attrs({
	size: 115,
})``;

export const UserIcon = styled(UserIconBase)`
	color: ${({ theme }) => theme.palette.primary.contrast};
`;

export const ProfilePicture = styled.div`
	min-width: 115px;
	max-width: 115px;
	height: 115px;
	border-radius: 50%;
	background-color: ${({ theme }) => theme.palette.base.lightest};
	color: ${({ theme }) => theme.palette.primary.contrast};
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;

	img {
		object-fit: contain;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
`;

export const UserInfo = styled.div`
	display: flex;
	flex-direction: column;
	margin-left: 20px;
`;

export const TruncatableName = styled(Truncate).attrs({
	lines: 1,
	width: 300,
})``;

export const Username = styled.div`
	font-size: ${({ theme }) => theme.typography.h3};
	color: ${({ theme }) => theme.palette.secondary.main};
`;

export const FullName = styled.div`
	font-size: ${({ theme }) => theme.typography.fontSize.medium};
	color: #6B778C;
	margin-top: 1px;
`;

const ADD_IMAGE_ID = 'add-image';

export const AddImageHiddenInput = styled.input.attrs({
	type: 'file',
	accept: '.gif,.jpg,.png',
	id: ADD_IMAGE_ID,
})`
	display: none;
`;

export const AddImageButton = styled(Button).attrs({
	variant: 'outlined',
})`
	margin: 7px 0;
	padding: 0;
	width: fit-content;
`;

export const AddImageInputLabel = styled.label.attrs({
	htmlFor: ADD_IMAGE_ID,
})`
	padding: 10px 15px;
	cursor: pointer;
`;
