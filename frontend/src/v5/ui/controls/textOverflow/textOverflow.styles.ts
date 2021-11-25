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
import { Tooltip as TooltipComponent, withStyles, fade } from '@material-ui/core';

export const fadeToLeft = (color: string) => `
	background-image: linear-gradient(to left, ${color} 0%, ${fade(color, 0.886)} 37.72%, ${fade(color, 0)} 52.55%);
`;

export const Tooltip = withStyles(() => ({
	tooltip: {
		maxWidth: 600,
	},
	tooltipPlacementBottom: {
		transform: 'translateX(25%) !important',
	},
}))(TooltipComponent);

export const Container = styled.div`
	position: relative;
	overflow: hidden;
	white-space: nowrap;
	display: flex;
	flex-grow: 1;
	width: 0;
	height: 100%;

	${({ isTruncated }) => isTruncated && css`
    pointer-events: none;
    mask: linear-gradient(to left, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 100%) left,
    linear-gradient(to left, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.886) 37.72%, rgba(0, 0, 0, 1) 52.55%) right;
    mask-size: calc(100% - 68px) 100%, 68px 100%;
    mask-repeat: no-repeat;

    &:hover {
      & > * {
        text-decoration: underline;
      }
    }
  `}
`;
