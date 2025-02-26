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
import UserIconBase from '@assets/icons/filled/user-filled.svg';
import { Truncate } from '@/v4/routes/components/truncate/truncate.component';
import { Avatar as AvatarBase } from '@controls/avatar';
import { Button } from '@controls/button';
import { ErrorMessage as ErrorMessageBase } from '@controls/errorMessage/errorMessage.component';
import { getSupportedImageExtensions } from '@controls/fileUploader/imageFile.helper';

export const Header = styled.div`
	display: flex;
	flex-direction: row;
	align-items: flex-start;
`;

export const Avatar = styled(AvatarBase).attrs({
	size: 'large',
})``;

export const UserIcon = styled(UserIconBase)`
	color: ${({ theme }) => theme.palette.primary.contrast};
`;

export const ProfilePicture = styled.div`
	width: 115px;
	height: 115px;
	border-radius: 50%;
	background-color: ${({ theme }) => theme.palette.base.lightest};
	color: ${({ theme }) => theme.palette.primary.contrast};
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
`;

export const UserInfo = styled.div`
	display: flex;
	flex-direction: column;
	margin-left: 20px;
	flex: 1;
`;

export const TruncatableName = styled(Truncate).attrs({
	lines: 1,
	width: 274,
})`
	width: fit-content;
`;

export const FullName = styled.div`
	font-size: ${({ theme }) => theme.typography.body1.fontSize};
	color: ${({ theme }) => theme.palette.base.main};
	margin-top: 1px;
`;

export const AvatarButton = styled(Button).attrs({
	variant: 'outlined',
})`
	cursor: pointer;
	margin: 8px 0 0;
	padding: 0;
	width: fit-content;
`;

const AVATAR_ID = 'avatar';

export const AvatarLabel = styled.label.attrs({
	htmlFor: AVATAR_ID,
})`
	padding: 6px 15px;
	cursor: pointer;
`;

export const AvatarInput = styled.input.attrs({
	type: 'file',
	accept: getSupportedImageExtensions(),
	id: AVATAR_ID,
})`
	display: none;
`;

export const ErrorMessage = styled(ErrorMessageBase)`
	margin-top: 10px;
`;
