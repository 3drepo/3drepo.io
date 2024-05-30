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

import { PresentationMode } from '../../modules/presentation/presentation.constants';
import { COLOR } from '../../styles';

interface IContainer {
	visibility?: boolean;
	presentationMode?: PresentationMode;
	isPresentationPaused?: boolean;
}

const PRESENTATION_OUTLINE_COLORS = {
	[PresentationMode.PRESENTER]: COLOR.DUSTY_RED,
	[PresentationMode.PARTICIPANT]: COLOR.SOFT_BLUE,
};

const getAdditionalStyles = ({ presentationMode, isPresentationPaused }) => {
	if (!isPresentationPaused && PRESENTATION_OUTLINE_COLORS[presentationMode]) {
		return css`
			border: 2px solid ${PRESENTATION_OUTLINE_COLORS[presentationMode]};
		`;
	}
};

export const ViewerContainer = styled.div<{ visible?: boolean }>`
	visibility: ${({ visible }) => visible ? 'visible' : 'hidden'};
	height: 100%;
	width: 100%;
	position: relative;
	box-sizing: border-box;
	overflow: hidden;
`;

export const Border = styled.div<IContainer>`
	pointer-events: none;
	box-sizing: border-box;
	position: absolute;
	width: 100%;
	height: 100%;
	${({ presentationMode, isPresentationPaused }) => getAdditionalStyles({ presentationMode, isPresentationPaused })};
`;
