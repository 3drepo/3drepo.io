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

import styled, { css } from 'styled-components';

import { StyledIconButton } from '../../teamspaces/components/tooltipButton/tooltipButton.styles';

export const Container = styled.div``;

export const ShowModelButtonContainer = styled.div`
	&& {
		position: absolute;
		z-index: 10;
		top: 3px;
		right: 3px;
		padding: 0 !important;

		${({ preview }: { preview: boolean }) => preview ? css`
			${StyledIconButton} {
				padding: 6px;
			}
		` : ''};
	}
`;
