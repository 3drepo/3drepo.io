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
import Dropzone from 'react-dropzone';
import { DashedContainer as DashedContainerBase } from '@controls/dashedContainer/dashedContainer.component';

export const Container = styled.div`
	display: contents;
`;

export const DropArea = styled(Dropzone)`
	position: relative;
	width: 100%;
	height: 100%;
`;

export const DashedContainer = styled(DashedContainerBase).attrs(({ theme, $dragOverlay }: any) => ({
	dashSize: 5,
	strokeColor: theme.palette.primary.main,
	gapSize: $dragOverlay ? 0 : 5,
	borderRadius: 10,
}))<{ $dragOverlay?: boolean }>`
	width: 100%;
	height: 100%;
	padding: 30px;
	box-sizing: border-box;
	user-select: none;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	
	${({ $dragOverlay, theme: { palette } }) => css`
		background-color: ${$dragOverlay ? palette.primary.lightest : palette.primary.contrast};
	`}
`;