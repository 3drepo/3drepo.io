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

import styled from 'styled-components';
import { BasicComment, CommentAuthor, CommentButtons } from '../basicCommentWithImages/basicCommentWithImages.styles';

export const CommentContainer = styled(BasicComment)`
	background-color: ${({ theme }) => theme.palette.secondary.main};
	color: ${({ theme }) => theme.palette.primary.contrast};
	border-top-right-radius: 0;
	align-self: end;

	&::before {
		right: 100%;
	}

	${CommentButtons} {
		left: -94px;
	}

	& > ${CommentAuthor} {
		display: none;
	}

	& + & {
		border-top-right-radius: 10px;
	}
`;
