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
import { Select, FilterWrapper, Container as CommentListContainer, Label as ShowLabel } from '@/v4/routes/components/messagesList/messagesList.styles';
import { CommentContainer, Comment } from '@/v4/routes/components/messagesList/components/message/components/userMessage/userMessage.styles';
import { Container as CommentPadding } from '@/v4/routes/components/messagesList/components/message/message.styles';
import { Counter, Actions, ActionsGroup, Container as AddNewCommentContainer } from '@/v4/routes/viewerGui/components/commentForm/commentForm.styles';
import { NotCollapsableContent } from '@/v4/routes/viewerGui/components/previewDetails/previewDetails.styles';
import { Avatar } from '@/v4/routes/components/messagesList/components/message/components/userAvatar/userAvatar.styles';
import { Container as CommentFooter, Username, Date } from '@/v4/routes/components/messagesList/components/message/components/footer/footer.styles';

export default css`

	${NotCollapsableContent} {
		background-color: ${({ theme }) => theme.palette.primary.contrast};
		padding: 15px 12px 10px;

		// comments header section
		${FilterWrapper} {
			padding: 0 0 13px 0;

			${ShowLabel} {
				font-size: 10px;
				font-weight: 500;
			}
			
			// dropdown
			${Select} {
				.MuiSelect-outlined {
					margin: 0;
					height: 24px;
					width: 170px;
					display: flex;
					align-items: center;
					padding-left: 7px;
					color: ${({ theme }) => theme.palette.secondary.main};
					font-size: 10px;
					font-weight: 500;
				}

				svg {
					right: 8px;
					margin-top: 0;
				}
			}
		}
		
		// comments body section
		${CommentListContainer} {
			padding: 0;

			${Avatar} {
				height: 32px;
				width: 32px;
				border: none;
				margin: 0;
			}
	
			${CommentContainer} {
				border-radius: 5px;
				margin: 0 0 0 10px;
				/* padding: 8px 0 0; */
				padding: 8px 14px 0 14px;

				${Comment} {
					color: ${({ theme }) => theme.palette.secondary.main};

					${CommentFooter} {
						margin-right: -11px;
					}

					${Username} {
						font-style: unset;
						color: #6b778c; // TODO - fix after new palette is realeased
					}

					${Date} {
						font-style: unset;
						color: #6b778c; // TODO - fix after new palette is realeased

						&::before {
							content: '';
						}
					}

				}
			}
	
			${CommentPadding} {
				padding: 5px 0 10px;
			}
		}
	}


	${AddNewCommentContainer} {
		${Actions} {
			padding: 0 16px 0 9px;

			${ActionsGroup} {
				button {
					background-color: transparent;
					color: ${({ theme }) => theme.palette.secondary.main};
				}
			}
		}

		${Counter} {
			color: #c1c8d5; // TODO - fix after new palette is released
			position: absolute;
			left: 94px;
			bottom: -33px;
			font-weight: 500;
			font-size: 10px;
		}
	}
`;
