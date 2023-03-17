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

import { UserCirclePopover } from '@components/shared/userCirclePopover/userCirclePopover.component';
import styled, { css } from 'styled-components';
import { BasicComment } from '../basicComment/basicComment.component';

export const AuthorAvatar = styled(UserCirclePopover)`
	position: absolute;
	top: 0;

	.MuiAvatar-root {
		border: none;
	}
`;

export const Comment = styled(BasicComment)<{ isFirstOfBlock: boolean }>`
	background-color: ${({ theme }) => theme.palette.tertiary.lighter};
	color: ${({ theme }) => theme.palette.secondary.main};
	margin-left: 39px;

	${({ isFirstOfBlock }) => isFirstOfBlock && css`
		border-top-left-radius: 0;
	`}
`;
