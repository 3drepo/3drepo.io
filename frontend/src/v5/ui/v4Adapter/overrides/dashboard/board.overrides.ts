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
import { css } from 'styled-components';
import {
	BoardItem,
	Config,
	DataConfig,
	LoaderContainer,
	ViewConfig,
	Container as V4Container,
	BoardContainer,
	NoDataMessage,
} from '@/v4/routes/board/board.styles';
import { Title } from '@/v4/routes/components/panel/panel.styles';
import { ThumbnailPlaceholder } from '@/v4/routes/viewerGui/components/previewListItem/previewListItem.styles';
import { Container as V5Board } from '@/v5/ui/routes/dashboard/projects/board/board.styles';
import { ShowModelButtonContainer } from '@/v4/routes/components/openInViewerButton/openInViewerButton.styles';

const trelloBoardStyles = css`
	/* empty board */
	${V4Container} {
		min-height: 200px;

		${LoaderContainer} {
			top: 110px;
			height: calc(100% - 120px);
		}

		${NoDataMessage} {
			${({ theme }) => theme.typography.h2};
			color: ${({ theme }) => theme.palette.base.main};
		}
	}

	.react-trello-board {
		padding: 0;
		overflow: unset;

		& > div {
			overflow-x: scroll;
		}
	}

	.react-trello-lane {
		height: 100%;
		width: 405px;
		background-color: ${({ theme }) => theme.palette.primary.contrast};
		border: none;
		border-radius: 10px;
		padding: 10px 13px;
		margin-right: 10px;

		&:first-child {
			margin-left: 75px;
		}

		&:last-child {
			margin-right: 75px;
		}
		
		header {
			padding: 5px 5px 15px;

			> span:nth-child(1) {
				color: ${({ theme }) => theme.palette.secondary.main};
				${({ theme }) => theme.typography.h3}
			}

			> span:nth-child(2) {
				${({ theme }) => theme.typography.body1}
				color: ${({ theme }) => theme.palette.base.main};
			}
		}

		&[label^="0"] header > span:nth-child(2) {
			color: ${({ theme }) => theme.palette.base.light};
		}

		${BoardItem} {
			border-radius: 8px;
			border-color: ${({ theme }) => theme.palette.base.lightest};

			${ThumbnailPlaceholder} {
				background-color: ${({ theme }) => theme.palette.tertiary.lightest};
				color: transparent
			}
		}
	}
`;

const boardContainerStyles = css`
	${BoardContainer} {
		padding-top: 16px;
		border-top: none;
	}

	${ShowModelButtonContainer} button {
		margin-bottom: 38px;

		&:hover {
			background: transparent;
		}
	}

	/* header with ellipsis menu */
	${Title} {
		display: none;
	}

	.MuiOutlinedInput-root {
		width: 100%;
	}

	.MuiSelect-select {
		padding-left: 15px;
	}

	/* background */
	.MuiPaper-root {
		background-color: transparent;
		box-shadow: none;
	}

	${Config} {
		background-color: transparent;
		padding: 10px 75px;

		/* left handside selects */
		${DataConfig} {
			display: flex;
			width: 403px;
			
			> * {
				width: 403px;

				/* hide teamspace & project select */
				&:not(:last-child) {
					display: none;
				}
			}
		}

		/* right handside selects */
		${ViewConfig} > div {
			width: 140px;
		}
	}

	/* add new card styling */
	.MuiButtonBase-root[aria-label="Add new card"] {
		background-color: ${({ theme }) => theme.palette.primary.main};
		text-transform: none;
		margin-bottom: -28px;
		margin-left: 0;
		height: 35px;
		width: fit-content;
		border-radius: 8px;
		font-size: 0.75rem;
		font-weight: 600;
		padding: 8px 16px;
		border: none;

		svg {
			background: currentColor;
			border-radius: 50%;
			fill: ${({ theme }) => theme.palette.primary.main};
			height: 17px;
			width: 17px;
			margin-right: 8px;
			transform: scale(.7);
		}

		&:hover {
			background-color: ${({ theme }) => theme.palette.primary.dark};
			
			svg {
				fill: ${({ theme }) => theme.palette.primary.dark};
			}
		}

		&:active {
			box-shadow: none;
			background-color: ${({ theme }) => theme.palette.primary.darkest};

			svg {
				fill: ${({ theme }) => theme.palette.primary.darkest};
			}
		}

		&:disabled {
			background-color: ${({ theme }) => theme.palette.base.lightest};
			color: ${({ theme }) => theme.palette.primary.contrast};
			
			svg {
				fill: ${({ theme }) => theme.palette.base.lightest};
			}
		}
	}
`;

export default css`
	${V5Board} {
		${boardContainerStyles}
		${trelloBoardStyles}
	}
`;
