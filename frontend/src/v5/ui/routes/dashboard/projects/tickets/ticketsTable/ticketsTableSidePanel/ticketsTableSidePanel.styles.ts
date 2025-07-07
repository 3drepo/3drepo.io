/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { Button } from '@controls/button';
import { Drawer } from '@mui/material';
import { Link as LinkBase } from 'react-router-dom';
import styled, { css } from 'styled-components';

export const Link = styled(LinkBase)<{ disabled?: boolean }>`
	${({ disabled }) => disabled && css`
		pointer-events: none;
		cursor: unset;
	`}
`;

export const OpenInViewerButton = styled(Button).attrs({
	variant: 'contained',
	color: 'primary',
})`
	padding: 5px 16px;
	height: 28px;
	margin-left: 14px;
`;

export const SidePanel = styled(Drawer).attrs({
	variant: 'persistent',
	anchor: 'right',
	SlideProps: { unmountOnExit: true },
	PaperProps: {
		style: {
			width: 410,
			height: 'calc(100vh - 112px)',
			top: 112,
			zIndex: 12,
		},
	},
})``;

export const SlidePanelHeader = styled.div`
	height: 50px;
	width: 100%;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	border-bottom: 1px solid ${({ theme }) => theme.palette.secondary.lightest};
	position: sticky;
	top: 0;
	z-index: 5;
	background: ${({ theme }) => theme.palette.primary.contrast};
`;
