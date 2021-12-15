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
import { fade } from '@material-ui/core/styles';
import * as ButtonStyles from '@controls/button/button.styles';
import * as FavouriteCheckboxStyles from '@controls/favouriteCheckbox/favouriteCheckbox.styles';
import * as EllipsisButtonStyles from '@controls/ellipsisButton/ellipsisButton.styles';
import * as TextOverflowStyles from '@controls/textOverflow/textOverflow.styles';

export const Container = styled.div`
	position: relative;
	display: flex;
	align-items: center;
	height: 80px;
	padding-left: 30px;
	padding-right: 10px;
	cursor: pointer;
	background-color: ${({ theme }) => theme.palette.primary.contrast};

	:hover {
		background-color: ${({ theme }) => theme.palette.primary.accent};
		${ButtonStyles.LabelButton} {
			${ButtonStyles.labelButtonSecondaryStyles};
		}
	}

	${({ theme, selected }) => selected && css`
		background-color: ${theme.palette.secondary.main};

		::before {
			background-color: ${theme.palette.secondary.main};
			border: none;
		}

		:hover {
			background-color: ${theme.palette.secondary.main};
		}
		
		${TextOverflowStyles.Container} {
			&:after {
				${TextOverflowStyles.fadeToLeft(theme.palette.secondary.main)}
			}
		}

		${ButtonStyles.LabelButton} {
			${ButtonStyles.labelButtonSecondaryStyles};
			background-color: ${fade(theme.palette.tertiary.lightest, 0.8)};
		}

		${FavouriteCheckboxStyles.Checkbox} {
			&:hover {
				background-color: ${theme.palette.secondary.light};
			}

			&:active {
				background-color: ${theme.palette.base.lightest};
			}
		}

		${EllipsisButtonStyles.StyledIconButton} {
			&:hover {
				background-color: ${theme.palette.secondary.light} !important;

				circle {
					fill: ${theme.palette.primary.contrast} !important;
				}
			}

			&:active {
				background-color: ${theme.palette.base.lightest} !important;
			}
		}
	`}
`;
