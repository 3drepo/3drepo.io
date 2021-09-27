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

import styled, { css } from 'styled-components';
import * as ButtonStyles from '@controls/button/button.styles';
import * as FavouriteCheckboxStyles from '@controls/favouriteCheckbox/favouriteCheckbox.styles';
import * as EllipsisButtonStyles from '@controls/ellipsisButton/ellipsisButton.styles';
import { fade } from '@material-ui/core/styles';

export const Container = styled.li`
	box-sizing: border-box;
	cursor: pointer;
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	height: 80px;
	width: 100%;
	list-style: none;
	border: 1px solid ${({ theme }) => theme.palette.base.lightest};
	border-bottom-style: none;

	&:last-child {
		border-radius: 0 0 5px 5px;
		border-bottom-style: solid;
	}

	&:first-child {
		border-radius: 5px 5px 0 0;
		border-top-style: solid;
	}

	&:only-child {
		border-radius: 5px;
	}

	:hover {
		border-color: ${({ theme }) => theme.palette.primary.contrast};
		box-shadow: ${({ theme }) => theme.palette.shadows.level_5};
		z-index: 100;

		& + li {
			border-top-color: transparent;
		}
	}

	${({ theme, selected }) => selected && css`
		background-color: ${theme.palette.secondary.main};
		border: none !important;

		::before {
			background-color: ${theme.palette.secondary.main};
		}

		${ButtonStyles.LabelButton} {
			${ButtonStyles.labelButtonSecondaryStyles};
			background-color: ${fade(theme.palette.tertiary.lightest, 0.8)};
		}

		${FavouriteCheckboxStyles.Checkbox} {
			 &:hover {
				background-color: ${fade(theme.palette.tertiary.lightest, 0.8)};
			}

			&:active {
				background-color: ${theme.palette.base.lightest};
			}
		}

		${EllipsisButtonStyles.StyledIconButton} {
			&:hover {
				background-color: ${fade(theme.palette.tertiary.lightest, 0.8)} !important;
			}

			&:active {
				background-color: ${theme.palette.base.lightest} !important;
			}
		}
	`}
`;
