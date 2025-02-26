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
import { CollapsableContent, Container as PreviewDetailsContainer } from '@/v4/routes/viewerGui/components/previewDetails/previewDetails.styles';
import { FilterWrapper, Container as CommentListContainer } from '@/v4/routes/components/messagesList/messagesList.styles';
import { Counter, Actions, Container as AddNewCommentContainer } from '@/v4/routes/viewerGui/components/commentForm/commentForm.styles';
import { BoardDialogTitle } from '@/v4/routes/board/board.styles';
import { UserAndModelDetails, Details } from '@/v4/routes/viewerGui/components/previewItemInfo/previewItemInfo.styles';
import { UserIndicator } from '@/v4/routes/components/messagesList/components/message/components/userMarker/userMarker.styles';
import { EmptyStateInfo } from '@/v4/routes/components/components.styles';
import { ViewerPanelFooter } from '@/v4/routes/viewerGui/components/viewerPanel/viewerPanel.styles';
import { StyledButton } from '@/v4/routes/viewerGui/components/containedButton/containedButton.styles';
import { primaryButtonStyling } from '@/v5/ui/v4Adapter/resuableOverrides.styles';
import CommentStyling, { CommentListStyling } from '../overrides/preview/previewComments.overrides';

const primaryButtonStyles = css`
	${primaryButtonStyling}

	&:disabled {
		/* TODO - fix after new palette is released */
		background-color: #edf0f8;
	}
`;

const EditIssue = css`
	${BoardDialogTitle} > div {
		display: flex;
		gap: 5px;

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

		${CollapsableContent} {
			margin-bottom: 0;
		}

		/* left panel */
		${PreviewDetailsIssue}${PreviewDetailsIssue},
		${PreviewDetailsRisk}${PreviewDetailsRisk} {
			/* TODO - fix after new palette is released */
			background-color: #f7f8fa;
			min-height: 75vh;

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
				margin-left: auto;
				width: 48px;
				display: flex;
				justify-content: flex-end;
				cursor: initial;
				
				button {
					color: ${({ theme }) => theme.palette.secondary.main};

					&:hover {
						background-color: transparent;
					}
				}
			}

			${Details} ${StyledButton} {
				margin-bottom: 10px;
			}

			${TabContentIssues}, ${TabContentRisks} {
				${ContentIssues}, ${ContentRisks} {
					height: fit-content;
					padding: 0 16px;
					margin-bottom: 0 0 16px;
					box-sizing: border-box;
				}
			}
		}

		/* right panel */
		${MessageContainerIssue}, ${MessageContainerRisk} {
			${CommentStyling}
			${CommentListStyling}

			${EmptyStateInfo} {
				margin-top: 15px;
			}

			padding: 0;
			background-color: ${({ theme }) => theme.palette.primary.contrast};
			border: solid ${({ theme }) => theme.palette.base.light} 0;
			border-left-width: 1px;
			
			${FilterWrapper} {
				padding: 13px;
				background-color: ${({ theme }) => theme.palette.primary.contrast};
			}

			${CommentListContainer} {
				padding: 0 13px 13px 13px;
				background-color: ${({ theme }) => theme.palette.primary.contrast};
			}

			${ViewerPanelFooter} {
				border-color: ${({ theme }) => theme.palette.base.main};
			}

			${ViewerPanelFooter} {
				border: 0;
			}

			${AddNewCommentContainer} {
				border: solid ${({ theme }) => theme.palette.base.light} 0;
				border-top-width: 1px;

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
	}

	.MuiDialog-container ${PreviewDetailsContainer} {
		/* TODO - fix after new palette is released */
		background-color: #f7f8fa;
		min-height: calc(75vh - 65px);
		max-height: calc(75vh - 65px);
	}
`;

export default css`
	#issues-card-save-button,
	#issues-card-add-new-comment,
	#risks-card-save-button,
	#risks-card-add-new-comment {
		${primaryButtonStyles}
	}
	${EditIssue}
`;
