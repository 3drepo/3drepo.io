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
import {
	HorizontalView as HorizontalViewRisk,
	MessageContainer as MessageContainerRisk,
	PreviewDetails as PreviewDetailsRisk,
	TabContent as TabContentRisks,
	Content as ContentRisks,
} from '@/v4/routes/viewerGui/components/risks/components/riskDetails/riskDetails.styles';
import {
	HorizontalView as HorizontalViewIssue,
	MessageContainer as MessageContainerIssue,
	PreviewDetails as PreviewDetailsIssue,
	TabContent as TabContentIssues,
	Content as ContentIssues,
} from '@/v4/routes/viewerGui/components/issues/components/issueDetails/issueDetails.styles';
import { ShowModelButtonContainer } from '@/v4/routes/components/openInViewerButton/openInViewerButton.styles';
import { Container as PreviewDetailsContainer } from '@/v4/routes/viewerGui/components/previewDetails/previewDetails.styles';
import { FilterWrapper, Container as CommentListContainer } from '@/v4/routes/components/messagesList/messagesList.styles';
import { Counter, Actions, Container as AddNewCommentContainer } from '@/v4/routes/viewerGui/components/commentForm/commentForm.styles';
import { BoardDialogTitle } from '@/v4/routes/board/board.styles';
import { UserAndModelDetails } from '@/v4/routes/viewerGui/components/previewItemInfo/previewItemInfo.styles';
import { UserIndicator } from '@/v4/routes/components/messagesList/components/message/components/userMarker/userMarker.styles';
import CommentStyling, { CommentListStyling } from '../overrides/preview/previewComments.overrides';

const PrimaryButtonStyles = css`
	background-color: ${({ theme }) => theme.palette.primary.main};

	&:hover {
		background-color: ${({ theme }) => theme.palette.primary.dark};
	}

	&:active {
		box-shadow: none;
		background-color: ${({ theme }) => theme.palette.primary.darkest};
	}

	&:disabled {
		/* TODO - fix after new palette is released */
		background-color: #edf0f8;
	}
`;

const EditIssue = css`
	${BoardDialogTitle} > div {
		button {
			margin: 0;
			position: relative;
			top: 0px;
			right: 23px;

			svg {
				color: ${({ theme }) => theme.palette.primary.contrast};
			}
		}
	}

	${HorizontalViewIssue},
	${HorizontalViewRisk} {

		/* left panel */
		${PreviewDetailsIssue}${PreviewDetailsIssue},
		${PreviewDetailsRisk}${PreviewDetailsRisk} {
			/* TODO - fix after new palette is released */
			background-color: #f7f8fa;
			max-height: 558px;
			overflow-y: hidden;

			${TabContentIssues}, ${TabContentRisks} {
				overflow-y: auto;
				max-height: 437px;
				
				${ContentIssues}, ${ContentRisks} {
					height: 100%;
					margin-bottom: 16px;
				}
			}

			${UserAndModelDetails} {
				width: 100%;
				align-items: center;

				> span {
					margin-top: 4px;
				}

				> ${UserIndicator}${UserIndicator} {
					margin-bottom: 0;
				}
			}

			${ShowModelButtonContainer} {
				top: 3px;
				position: relative;

				width: 100%;
				display: flex;
				justify-content: flex-end;
				cursor: initial;
				
				button {
					margin: 0;
					color: ${({ theme }) => theme.palette.secondary.main};

					&:hover {
						background-color: transparent;
					}
				}
			}
		}

		/* right panel */
		${MessageContainerIssue}, ${MessageContainerRisk} {
			${CommentStyling}
			${CommentListStyling}
			padding: 0;
			background-color: ${({ theme }) => theme.palette.primary.contrast};
			
			${FilterWrapper} {
				padding: 13px;
				background-color: ${({ theme }) => theme.palette.primary.contrast};
			}

			${CommentListContainer} {
				padding: 0 13px 13px 13px;
				background-color: ${({ theme }) => theme.palette.primary.contrast};
			}

			${AddNewCommentContainer} {
				${Counter} {
					left: 55px;
				}

				${Actions} {
					min-height: 48px;

					button {
						margin: 0 -3px 0 0;
						width: 36px;
						height: 26px;
					}
				}
			}
		}

		${PreviewDetailsContainer} {
			background-color: inherit;
		}
	}
`;

export default css`
	#issues-card-save-button,
	#issues-card-add-new-comment,
	#risks-card-save-button,
	#risks-card-add-new-comment {
		${PrimaryButtonStyles}
	}
	${EditIssue}
`;
