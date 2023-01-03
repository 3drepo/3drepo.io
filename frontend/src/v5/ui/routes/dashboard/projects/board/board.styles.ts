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
import styled, { css } from 'styled-components';
import { BoardItem, Config, DataConfig, LoaderContainer, ViewConfig, Container as V4Container, BoardContainer } from '@/v4/routes/board/board.styles';
import { Title } from '@/v4/routes/components/panel/panel.styles';
import { ThumbnailPlaceholder } from '@/v4/routes/viewerGui/components/previewListItem/previewListItem.styles';

const trelloBoardStyles = css`
	/* empty board */
	${V4Container} {
		min-height: 200px;

		${LoaderContainer} {
			top: 120px;
			height: unset;
		}
	}

	.react-trello-board {
		padding: 0;
		overflow: unset;
	}

	.react-trello-lane {
		height: 629px;
		width: 405px;
		background-color: ${({ theme }) => theme.palette.primary.contrast};
		border: none;
		border-radius: 10px;

		&:first-child {
			margin-left: 75px;
		}

		&:last-child {
			margin-right: 75px;
		}
		
		header {
			> span:nth-child(1) {
				color: ${({ theme }) => theme.palette.secondary.main};
				${({ theme }) => theme.typography.h3}
			}

			> span:nth-child(2) {
				${({ theme }) => theme.typography.body1}
				color: ${({ theme }) => theme.palette.base.main};
			}
		}

		${BoardItem} {
			border-radius: 5px;
			border-color: ${({ theme }) => theme.palette.tertiary.lightest};

			${ThumbnailPlaceholder} {
				background-color: ${({ theme }) => theme.palette.tertiary.lightest};
				color: transparent
			}
		}
	}
`;

export const Container = styled.div`
	position: absolute;
	left: 0;
	width: 100vw;
	box-sizing: border-box;
	max-width: unset;

	${BoardContainer} {
		padding-top: 16px;
		border-top: none;
	}

	/* header with ellipsis menu */
	${Title} {
		display: none;
	}

	/* general select styling */
	.MuiSelect-select {
		padding-left: 15px;
		border: solid 1px ${({ theme }) => theme.palette.base.lighter};
		
		& ~ svg {
			top: -25px;
		}
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
		height: 48px;
		width: 48px;
		margin-bottom: -29px;
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
	}

	${trelloBoardStyles}
`;
