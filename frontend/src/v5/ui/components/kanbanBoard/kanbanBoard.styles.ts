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

import { Box, Stack, Typography } from '@mui/material';
import { alpha, styled, Theme } from '@mui/material/styles';

export const getRadius = (theme: Theme, multiplier = 1) => {
	const radius = theme.shape.borderRadius;

	if (typeof radius === 'number') {
		return radius * multiplier;
	}

	return multiplier === 1 ? radius : `calc(${radius} * ${multiplier})`;
};

export const BoardScroller = styled(Box)(({ theme }) => ({
	display: 'flex',
	gap: theme.spacing(2),
	overflowX: 'auto',
	alignItems: 'stretch',
	minHeight: 0,
	height: '100%',
	paddingBottom: theme.spacing(1),
}));

export const DragOverlay = styled(Box, {
	shouldForwardProp: (prop) =>
		prop !== 'overlayWidth' && prop !== 'initialTransform',
})<{ overlayWidth: number; initialTransform: string }>(
	({ initialTransform, overlayWidth, theme }) => ({
		position: 'fixed',
		top: 0,
		left: 0,
		width: overlayWidth,
		zIndex: theme.zIndex.modal + 1,
		pointerEvents: 'none',
		opacity: 1,
		transform: initialTransform,
		filter: 'drop-shadow(0 16px 24px rgba(15, 23, 42, 0.24))',
	}),
);

export const LanePaper = styled('div', {
	shouldForwardProp: (prop) => prop !== 'isDropTarget',
})<{ isDropTarget: boolean }>(({ isDropTarget, theme }) => ({
	width: '400px',
	flexShrink: 0,
	display: 'block',
	flexDirection: 'column',
	borderRadius: getRadius(theme, 2),
	border: `1px solid ${
		isDropTarget ? theme.palette.primary.main : (theme.palette as any).base.lightest
	}`,
	backgroundColor: isDropTarget
		? alpha(theme.palette.primary.main, 0.08)
		: theme.palette.background.paper,
	transition: 'background-color 160ms ease, border-color 160ms ease',
	overflowY: 'hidden',
	maxHeight: '100%',
	padding: 8,
}));

export const LaneHeader = styled(Stack)(({ theme }) => ({
	flexDirection: 'row',
	justifyContent: 'space-between',
	alignItems: 'center',
	gap: theme.spacing(1),
	padding: theme.spacing(1.25, 1.5),
}));

export const LaneTitleGroup = styled(Box)({
	minWidth: 0,
});

export const LaneTitle = styled(Typography)({
	fontWeight: 800,
	overflowWrap: 'anywhere',
});

export const LaneSubtitle = styled(Typography)({
	display: 'block',
	overflowWrap: 'anywhere',
});

export const LaneCards = styled(Stack)(() => ({
	flex: 1,
	overflowY: 'auto',
	gap: 6,
	maxHeight: '100%',
}));

export const DropPlaceholder = styled(Box, {
	shouldForwardProp: (prop) => prop !== 'placeholderHeight',
})<{ placeholderHeight: number }>(({ placeholderHeight, theme }) => ({
	height: placeholderHeight,
	flexShrink: 0,
	border: '2px dashed',
	borderColor: alpha(theme.palette.primary.main, 0.48),
	borderRadius: getRadius(theme, 2),
	backgroundColor: alpha(theme.palette.primary.main, 0.08),
	boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.12)}`,
	transition:
		'background-color 160ms ease, border-color 160ms ease, height 160ms ease',
}));

export const CardShell = styled(Box, {
	shouldForwardProp: (prop) =>
		prop !== 'isDraggable' && prop !== 'canClickCards',
})<{ isDraggable: boolean; canClickCards: boolean }>(
	({ canClickCards, isDraggable, theme }) => ({
		cursor: isDraggable ? 'grab' : canClickCards ? 'pointer' : 'default',
		opacity: isDraggable ? 1 : 0.72,
		outline: 0,
		touchAction: isDraggable ? 'none' : 'auto',
		'&:active': {
			cursor: isDraggable ? 'grabbing' : canClickCards ? 'pointer' : 'default',
		},
		'&:focus-visible': {
			borderRadius: getRadius(theme, 2),
			boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.32)}`,
		},
	}),
);

