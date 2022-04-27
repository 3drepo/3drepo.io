/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import { css } from 'styled-components';
import { Select, FilterWrapper, Container as CommentListContainer } from '@/v4/routes/components/messagesList/messagesList.styles';
import { CommentContainer, Comment } from '@/v4/routes/components/messagesList/components/message/components/userMessage/userMessage.styles';
import { Container as CommentPadding } from '@/v4/routes/components/messagesList/components/message/message.styles';

export default css`
	// comments header section
	${FilterWrapper} {
		background-color: ${({ theme }) => theme.palette.primary.contrast};
		padding-top: 20px;
		padding-left: 16px;
		
		// dropdown
		${Select} {
			.MuiSelect-outlined {
				margin: 0;
				height: 24px;
				width: 170px;
				display: flex;
				align-items: center;
				padding-left: 7px;
			}

			svg {
				right: 8px;
				margin-top: 4px;
			}
		}
	}

	// comments body section
	${CommentListContainer} {
		padding-top: 8px;
		background: ${({ theme }) => theme.palette.primary.contrast};

		${CommentContainer} {
			border-radius: 5px;
		}

		${CommentPadding} {
			padding: 10px 0;
		}

		${Comment} {
			color: ${({ theme }) => theme.palette.secondary.main};
		}
	}
`;
