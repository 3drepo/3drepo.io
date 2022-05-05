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

import { css } from 'styled-components';
import { Select, FilterWrapper, Container as CommentListContainer, Label as ShowLabel } from '@/v4/routes/components/messagesList/messagesList.styles';
import { CommentContainer, Comment, Container as CommentAndDeleteButtonContainer } from '@/v4/routes/components/messagesList/components/message/components/userMessage/userMessage.styles';
import { Container as CommentPadding } from '@/v4/routes/components/messagesList/components/message/message.styles';
import { Counter, Actions, StyledTextField, ActionsGroup, Container as AddNewCommentContainer } from '@/v4/routes/viewerGui/components/commentForm/commentForm.styles';
import { Collapsable, NotCollapsableContent, ToggleButtonContainer as CollaspableButton } from '@/v4/routes/viewerGui/components/previewDetails/previewDetails.styles';
import { Container as CommentFooter, Date, Username } from '@/v4/routes/components/messagesList/components/message/components/footer/footer.styles';
import { Container as TabContainer } from '@/v4/routes/viewerGui/components/risks/components/riskDetails/riskDetails.styles';
import { TabContent, StyledTabs as Tabs } from '@/v4/routes/viewerGui/components/issues/components/issueDetails/issueDetails.styles';

export default css`
	${Collapsable} {
		border-radius: 0 !important;
		padding: 0;

		${Tabs} {
			width: unset;
		}

		${TabContainer} {
			margin-top: 0;
			padding-top: 15px;
		}

		${TabContent} {
			background-color: inherit;
			padding: 0 14px;
		}
	}

	${CollaspableButton} {
		background-color: #f7f8fa; // TODO - fix after new palette is released
	}

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

			${CommentAndDeleteButtonContainer} {
				&:not(:hover) [aria-label="Remove"] > button {
					display: none;
				} 

				// delete comment icon
				[aria-label="Remove"] > button {
					margin: 8px 48px 0 0;
				}
			}

			${CommentContainer} {
				border-radius: 5px;
				margin: 0 10px;
				padding: 8px 14px 0 14px;

				// just the text
				${Comment} {
					color: ${({ theme }) => theme.palette.secondary.main};
					word-break: break-word;
				}

				${CommentFooter} {
					${Username} {
						color: #6b778c; // TODO - fix after new palette is released
						font-style: unset;
					}
	
					${Date} {
						color: #6b778c; // TODO - fix after new palette is released
						font-style: unset;
						&::before {
							content: '';
						}
					}

					button {
						margin: 10px 0 10px 10px;
					}
				}
			}
	
			${CommentPadding} {
				padding: 5px 0 10px;
			}
		}
	}


	${AddNewCommentContainer} {

		${StyledTextField} {
			color: ${({ theme }) => theme.palette.secondary.main};
			font-size: 12px;
			
			textarea:placeholder-shown {
				// should be #c1c8d5 but something is making it clearer 
				color: #77849d
			}
		}

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
