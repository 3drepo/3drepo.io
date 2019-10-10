/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import Grid from '@material-ui/core/Grid';
import styled, { css } from 'styled-components';
import { COLOR } from '../../../../styles';

interface IStyledGrid {
	theme: {
		forceOpen: boolean,
		federate: boolean
	};
}

export const Container = styled.div``;

const openMenuStyles = css`
	opacity: 1;
	pointer-events: all;
`;

export const StyledGrid = styled(Grid)<IStyledGrid>`
	&& {
		width: 100%;
		position: absolute;
		right: 0;
		top: 0;
		background: ${(props) => props.theme.federate ? COLOR.ALICE_BLUE : COLOR.WHITE};
		z-index: 2;
		height: 100%;
	}

	transition: opacity 200ms ease-in-out;
	opacity: 0;
	pointer-events: none;

	${(props) => props.theme.forceOpen ? openMenuStyles : ''};
	&:hover {
		${openMenuStyles}
	}
`;

export const ActionsButton = styled.div`
	z-index: 3;
	position: relative;

	&:hover + ${StyledGrid} {
		${openMenuStyles}
	}
`;

export const Actions = styled.div`
	position: absolute;
	right: 40px;
	left: auto;
	height: auto;
	top: 5px;
	display: flex;
	flex-wrap: wrap;
	justify-content: flex-end;
	width: auto;
`;
