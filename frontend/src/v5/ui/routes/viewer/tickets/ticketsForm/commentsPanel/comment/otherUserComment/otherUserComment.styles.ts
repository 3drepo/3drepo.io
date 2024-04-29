/**
 *  Copyright (C) 2023 3D Repo Ltd
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
import { UserPopoverCircle } from '@components/shared/popoverCircles/userPopoverCircle/userPopoverCircle.component';
import { BasicComment } from '../basicComment/basicComment.component';
import { ImportedUserPopover } from './importedUserPopover/importedUserPopover.component';

const authorAvatarStyles = css`
	position: absolute;
	top: 0;

	.MuiAvatar-root {
		border: none;
	}
`;

export const ImportedAuthorAvatar = styled(ImportedUserPopover)`
	${authorAvatarStyles}
`;

export const AuthorAvatar = styled(UserPopoverCircle)`
	${authorAvatarStyles}
`;

export const Comment = styled(BasicComment)<{ isFirstOfBlock: boolean }>`
	background-color: ${({ theme }) => theme.palette.tertiary.lighter};
	color: ${({ theme }) => theme.palette.secondary.main};
	margin-left: 39px;

	${({ isFirstOfBlock }) => isFirstOfBlock && css`
		border-top-left-radius: 0;
	`}
`;
