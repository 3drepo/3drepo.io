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

import { Fragment, memo, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { getRadius } from './KanbanBoardComponents';
import type { DropTargetStore, LaneColumnProps } from './KanbanBoardTypes';

const LanePaper = styled('div', {
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

const LaneHeader = styled(Stack)(({ theme }) => ({
	flexDirection: 'row',
	justifyContent: 'space-between',
	alignItems: 'center',
	gap: theme.spacing(1),
	padding: theme.spacing(1.25, 1.5),
}));

const LaneTitleGroup = styled(Box)({
	minWidth: 0,
});

const LaneTitle = styled(Typography)({
	fontWeight: 800,
	overflowWrap: 'anywhere',
});

const LaneSubtitle = styled(Typography)({
	display: 'block',
	overflowWrap: 'anywhere',
});

const LaneCards = styled(Stack)(() => ({
	flex: 1,
	overflowY: 'auto',
	gap: 6,
	maxHeight: '100%',
}));

const DropPlaceholder = styled(Box, {
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

const CardShell = styled(Box, {
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

function useLaneDropState(store: DropTargetStore, laneId: string) {
	const [laneDropState, setLaneDropState] = useState(() =>
		store.getLaneState(laneId),
	);

	useEffect(
		() =>
			store.subscribe(laneId, () => {
				setLaneDropState(store.getLaneState(laneId));
			}),
		[laneId, store],
	);

	return laneDropState;
}

export const LaneColumn = memo(function LaneColumn({
	lane,
	draggingCardId,
	placeholderHeight,
	dropTargetStore,
	registerLaneRef,
	registerCardRef,
	animateCards,
	onCardPointerDown,
	onCardClick,
	onCardKeyDown,
	canClickCards,
	CardComponent,
}: LaneColumnProps) {
	const laneDropState = useLaneDropState(dropTargetStore, lane.id);
	const laneDropTarget = laneDropState.target;
	const visibleCards = useMemo(
		() => lane.cards.filter((card) => card.id !== draggingCardId),
		[draggingCardId, lane.cards],
	);
	const setLaneNode = useCallback(
		(node: HTMLDivElement | null) => registerLaneRef(lane.id, node),
		[lane.id, registerLaneRef],
	);

	useLayoutEffect(() => {
		if (laneDropState.version === 0) {
			return;
		}

		animateCards(visibleCards.map((card) => card.id));
	}, [animateCards, laneDropState.version, visibleCards]);

	const renderPlaceholder = () => {
		if (!laneDropTarget || placeholderHeight === null) {
			return null;
		}

		return (
			<DropPlaceholder
				key={`drop-placeholder-${lane.id}`}
				placeholderHeight={placeholderHeight}
			/>
		);
	};

	const shouldShowPlaceholder = Boolean(laneDropTarget && placeholderHeight);

	return (
		<LanePaper
			ref={setLaneNode}
			isDropTarget={Boolean(laneDropTarget)}
		>
			<LaneHeader>
				<LaneTitleGroup>
					<LaneTitle variant="subtitle1">{lane.title}</LaneTitle>
				</LaneTitleGroup>
				<LaneSubtitle variant="caption" color="text.secondary">
					{lane.label}
				</LaneSubtitle>
			</LaneHeader>

			<LaneCards>
				{visibleCards.map((card, cardIndex) => (
					<Fragment key={card.id}>
						{shouldShowPlaceholder && laneDropTarget?.index === cardIndex
							? renderPlaceholder()
							: null}
						<CardShell
							ref={(node: HTMLDivElement | null) =>
								registerCardRef(card.id, node)
							}
							onPointerDown={(event) =>
								onCardPointerDown(event, lane.id, card)
							}
							onClick={() => onCardClick(card.id)}
							onKeyDown={(event) => onCardKeyDown(event, card.id)}
							role={canClickCards ? 'button' : undefined}
							tabIndex={canClickCards ? 0 : undefined}
							isDraggable={card.draggable !== false}
							canClickCards={canClickCards}
						>
							<CardComponent {...card} />
						</CardShell>
					</Fragment>
				))}

				{shouldShowPlaceholder &&
				(laneDropTarget?.index ?? 0) >= visibleCards.length
					? renderPlaceholder()
					: null}

			</LaneCards>
		</LanePaper>
	);
});
