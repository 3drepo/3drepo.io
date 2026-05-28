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

import type { DropTargetStore, LaneColumnProps } from './kanbanBoard.types';
import { CardShell, DropPlaceholder, LaneCards, LaneHeader, LanePaper, LaneSubtitle, LaneTitle, LaneTitleGroup } from './kanbanBoard.styles';


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
