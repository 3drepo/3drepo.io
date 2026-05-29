/**
 *  Copyright (C) 2026 3D Repo Ltd
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

import { Typography } from '@controls/typography';
import { Box, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import styled from 'styled-components';

export const getRadius = (theme: Theme, multiplier = 1) => {
	const radius = theme.shape.borderRadius;

	if (typeof radius === 'number') {
		return `${radius * multiplier}px`;
	}

	return multiplier === 1 ? radius : `calc(${radius} * ${multiplier})`;
};

export const BoardScroller = styled(Box)`
	display: flex;
	gap: 15px;
	overflow-x: auto;
	align-items: stretch;
	min-height: 0;
	height: 100%;
	padding-bottom: ${({ theme }) => (theme as any).spacing(1)};
`;

export const DragOverlay = styled(Box)<{ $overlayWidth: number; $initialTransform: string }>`
	position: fixed;
	top: 0;
	left: 0;
	width: ${({ $overlayWidth }) => $overlayWidth}px;
	z-index: ${({ theme }) => (theme as any).zIndex.modal + 1};
	pointer-events: none;
	opacity: 1;
	transform: ${({ $initialTransform }) => $initialTransform};
	filter: drop-shadow(0 16px 24px rgba(15, 23, 42, 0.24));
`;

export const LaneTitle = styled(Typography).attrs({
	variant: 'h4',
	color: 'secondary',
})`
	overflow-wrap: anywhere;
`;

export const LaneSubtitle = styled(Typography).attrs({
	variant: 'caption',
	color: 'base',
})`
	overflow-wrap: anywhere;
`;


export const LanePaper = styled.div<{ $isDropTarget: boolean }>`
	width: 400px;
	flex-shrink: 0;
	display: flex;
	flex-direction: column;
	border-radius: ${({ theme }) => getRadius(theme as any, 2)};
	border: 0 solid ${({ $isDropTarget, theme }) => (
		$isDropTarget ? theme.palette.primary.main : (theme.palette as any).base.lightest
	)};
	background-color: ${({ $isDropTarget, theme }) => (
		$isDropTarget ? alpha(theme.palette.primary.main, 0.08) : (theme as any).palette.background.paper
	)};
	transition: background-color 160ms ease, border-color 160ms ease;
	overflow-y: hidden;
	max-height: 100%;
	padding: 10px 13px;
	gap: 15px;

	${LaneTitle}, ${LaneSubtitle} {
		transition: color 160ms ease;
		${({ $isDropTarget, theme }) => $isDropTarget ? `color: ${theme.palette.primary.main};` : ''}
	}
`;

export const LaneHeader = styled(Stack)`
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	gap: ${({ theme }) => (theme as any).spacing(1)};
	padding: 4px;
`;

export const LaneCards = styled(Stack)`
	flex: 1;
	overflow-y: auto;
	gap: 6px;
	max-height: 100%;
`;

export const DropPlaceholder = styled(Box)<{ $placeholderHeight: number }>`
	height: ${({ $placeholderHeight }) => $placeholderHeight}px;
	flex-shrink: 0;
	border: 2px dashed;
	border-color: ${({ theme }) => alpha((theme as any).palette.primary.main, 0.48)};
	border-radius: ${({ theme }) => getRadius((theme as any), 2)};
	background-color: ${({ theme }) => alpha(theme.palette.primary.main, 0.08)};
	box-shadow: inset 0 0 0 1px ${({ theme }) => alpha(theme.palette.primary.main, 0.12)};
	transition: background-color 160ms ease, border-color 160ms ease, height 160ms ease;
`;

export const CardShell = styled(Box)<{ $isDraggable: boolean; $canClickCards: boolean }>`
	cursor: ${({ $canClickCards, $isDraggable }) => (
		$isDraggable ? 'grab' : $canClickCards ? 'pointer' : 'default'
	)};
	opacity: ${({ $isDraggable }) => ($isDraggable ? 1 : 0.72)};
	outline: 0;
	touch-action: ${({ $isDraggable }) => ($isDraggable ? 'none' : 'auto')};

	&:active {
		cursor: ${({ $canClickCards, $isDraggable }) => (
		$isDraggable ? 'grabbing' : $canClickCards ? 'pointer' : 'default'
	)};
	}

	&:focus-visible {
		border-radius: ${({ theme }) => getRadius(theme as any, 2)};
		box-shadow: 0 0 0 3px ${({ theme }) => alpha(theme.palette.primary.main, 0.32)};
	}
`;
