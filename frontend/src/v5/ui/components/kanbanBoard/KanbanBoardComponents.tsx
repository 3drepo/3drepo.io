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

import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import { styled, type Theme } from '@mui/material/styles';
import type { Card, DropTarget, DropTargetStore } from './KanbanBoardTypes';

export const getRadius = (theme: Theme, multiplier = 1) => {
	const radius = theme.shape.borderRadius;

	if (typeof radius === 'number') {
		return radius * multiplier;
	}

	return multiplier === 1 ? radius : `calc(${radius} * ${multiplier})`;
};

const DefaultCardPaper = styled(Paper)(({ theme }) => ({
	borderRadius: getRadius(theme, 2),
	borderColor: theme.palette.divider,
	padding: theme.spacing(1.5),
	backgroundColor: theme.palette.background.paper,
	boxShadow: '0 1px 2px rgba(15, 23, 42, 0.08)',
}));

const DefaultCardContent = styled(Stack)(({ theme }) => ({
	gap: theme.spacing(1),
}));

const DefaultCardHeader = styled(Stack)(({ theme }) => ({
	flexDirection: 'row',
	justifyContent: 'space-between',
	alignItems: 'center',
	gap: theme.spacing(1),
}));

const DefaultCardTitle = styled(Typography)({
	fontWeight: 700,
	minWidth: 0,
	overflowWrap: 'anywhere',
});

const DefaultCardLabel = styled(Chip)(({ theme }) => ({
	flexShrink: 0,
	borderRadius: getRadius(theme),
	fontWeight: 700,
	height: 24,
}));

const DefaultCardDescription = styled(Typography)({
	overflowWrap: 'anywhere',
});

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

export function createDropTargetStore(): DropTargetStore {
	let target: DropTarget | null = null;
	let version = 0;
	const listeners = new Map<string, Set<() => void>>();

	const notifyLane = (laneId: string | undefined) => {
		if (!laneId) {
			return;
		}

		listeners.get(laneId)?.forEach((listener) => listener());
	};

	return {
		getLaneState: (laneId) => ({
			target: target?.laneId === laneId ? target : null,
			version,
		}),
		getTarget: () => target,
		setTarget: (nextTarget) => {
			if (
				target?.laneId === nextTarget?.laneId &&
				target?.index === nextTarget?.index
			) {
				return;
			}

			const previousLaneId = target?.laneId;
			const nextLaneId = nextTarget?.laneId;
			target = nextTarget;
			version += 1;

			notifyLane(previousLaneId);

			if (nextLaneId !== previousLaneId) {
				notifyLane(nextLaneId);
			}
		},
		subscribe: (laneId, listener) => {
			const laneListeners = listeners.get(laneId) ?? new Set<() => void>();
			laneListeners.add(listener);
			listeners.set(laneId, laneListeners);

			return () => {
				laneListeners.delete(listener);

				if (laneListeners.size === 0) {
					listeners.delete(laneId);
				}
			};
		},
	};
}

export function DefaultCard(card: Card) {
	return (
		<DefaultCardPaper variant="outlined">
			<DefaultCardContent>
				<DefaultCardHeader>
					<DefaultCardTitle variant="subtitle2">
						{card.title}
					</DefaultCardTitle>
					<DefaultCardLabel label={card.label} size="small" />
				</DefaultCardHeader>
				<DefaultCardDescription variant="body2" color="text.secondary">
					{card.description}
				</DefaultCardDescription>
			</DefaultCardContent>
		</DefaultCardPaper>
	);
}
