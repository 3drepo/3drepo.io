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
import CommentStyling, { CommentListStyling } from '../overrides/preview/previewComments.overrides';
import {
	HorizontalView as HorizontalViewRisk,
	MessageContainer as MessageContainerRisk,
	PreviewDetails as PreviewDetailsRisk,
} from '@/v4/routes/viewerGui/components/risks/components/riskDetails/riskDetails.styles';
import {
	HorizontalView as HorizontalViewIssue,
	MessageContainer as MessageContainerIssue,
	PreviewDetails as PreviewDetailsIssue,
} from '@/v4/routes/viewerGui/components/issues/components/issueDetails/issueDetails.styles';
import { ShowModelButtonContainer } from '@/v4/routes/components/openInViewerButton/openInViewerButton.styles';
import { Container as PreviewDetailsContainer } from '@/v4/routes/viewerGui/components/previewDetails/previewDetails.styles';
import { FilterWrapper, Container as CommentListContainer } from '@/v4/routes/components/messagesList/messagesList.styles';
import { Counter, Actions, Container as AddNewCommentContainer } from '@/v4/routes/viewerGui/components/commentForm/commentForm.styles';
import { BoardDialogTitle } from '@/v4/routes/board/board.styles';

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

			${ShowModelButtonContainer} button {
				margin: 0 0 -21px 150px;
				color: ${({ theme }) => theme.palette.secondary.main};

				&:hover {
					color: ${({ theme }) => theme.palette.secondary.dark};
				}

				&:active {
					color: ${({ theme }) => theme.palette.secondary.darkest};
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

		${ShowModelButtonContainer} {
			margin: 0;
			margin-top: -10px;
		}
	}
`;

export default css`
	#issues-card-save-button,
	#issues-card-add-new-comment {
		${PrimaryButtonStyles}
	}
	${EditIssue}
`;
