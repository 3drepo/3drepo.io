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

import Button from '@material-ui/core/Button';
import styled, { css } from 'styled-components';
import { FONT_WEIGHT } from '@/v5/ui/themes/theme';

export const LabelButton = styled(Button)`
  align-items: center;
  padding: 8px 12px 8px 15px;

  ${({ theme }) => css`
    &:disabled {
      background-color: ${theme.palette.base.lightest};
      color: ${theme.palette.primary.contrast};
    }

    &.Mui-focusVisible {
      box-shadow: ${theme.palette.shadows.level_5};
    }
  `}

  ${({ color, theme }) => {
		if (color === 'primary') {
			return css`
        color: ${theme.palette.primary.contrast};
        background-color: ${theme.palette.primary.main};

        &.Mui-focusVisible {
          background-color: ${theme.palette.primary.main};
        }

        &:hover {
          background-color: ${theme.palette.primary.dark};
          text-decoration-line: none;
        }

        &:active {
          background-color: ${theme.palette.primary.darkest};
        }
      `;
		}
		if (color === 'secondary') {
			return css`
        color: ${theme.palette.tertiary.main};
        background-color: ${theme.palette.tertiary.lightest};

        &.Mui-focusVisible {
          background-color: ${theme.palette.tertiary.lightest};
        }

        &:hover {
          background-color: ${theme.palette.tertiary.main};
          text-decoration-line: none;
          color: ${theme.palette.primary.contrast};
        }

        &:active {
          background-color: ${theme.palette.tertiary.dark};
          color: ${theme.palette.primary.contrast};
        }
      `;
		}
		return '';
	}}
  

  ${({ color, theme, outlined }) => {
		if (color === 'primary' && outlined) {
			return css`
        color: ${theme.palette.primary.main};
        background-color: ${theme.palette.primary.contrast};
				border: 1px solid ${theme.palette.primary.main};

        &:hover {
          color: ${theme.palette.primary.contrast};
					border-color: ${theme.palette.primary.dark}; 
        }
				
				&:active {
					border-color: ${theme.palette.primary.darkest};
				}

          &.Mui-focusVisible {
          color: ${theme.palette.primary.main};
          background-color: ${theme.palette.primary.contast};
        }
				
				&:disabled {
					border-color: ${theme.palette.base.lightest};
				}
      `;
		}
		if (color === 'secondary' && outlined) {
			return css`
        color: ${theme.palette.tertiary.main};
        background-color: ${theme.palette.primary.contrast};
        border: 1px solid ${theme.palette.tertiary.main};
				
				:active {
					border-color: ${theme.palette.tertiary.dark};
				}

        &.Mui-focusVisible {
          background-color: ${theme.palette.tertiary.lightest};
        }

        &:disabled {
          border-color: ${theme.palette.base.lightest};
        }
      `;
		}
		return '';
	}}
`;
