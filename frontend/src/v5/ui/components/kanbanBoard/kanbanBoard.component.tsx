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

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import { BoardScroller, DragOverlay } from './kanbanBoard.styles';
import type { Card, DragPoint, DragSession, DropTarget, DropTargetStore, KanbanBoardProps, KanbanDragEndEvent, Lane, PointerPress } from './kanbanBoard.types';
import { LaneColumn } from './laneColumn.component';
import { DefaultCard } from './defaultCard.component';

export type {
	Card,
	KanbanBoardComponents,
	KanbanBoardProps,
	KanbanDragEndEvent,
	KanbanMoveAcrossLanesEvent,
	Lane,
} from './kanbanBoard.types';

const DRAG_START_DISTANCE = 4;
const AUTO_SCROLL_EDGE_DISTANCE = 96;
const AUTO_SCROLL_MAX_SPEED = 24;

function createDropTargetStore(): DropTargetStore {
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

function moveCardToLane(
	lanes: Lane[],
	cardId: string,
	sourceLaneId: string,
	targetLaneId: string,
	targetIndex: number,
) {
	let movingCard: Card | undefined;

	const lanesWithoutCard = lanes.map((lane) => {
		if (lane.id !== sourceLaneId) {
			return lane;
		}

		movingCard = lane.cards.find((card) => card.id === cardId);

		return {
			...lane,
			cards: lane.cards.filter((card) => card.id !== cardId),
		};
	});

	if (!movingCard) {
		return lanes;
	}

	const cardToMove = movingCard;

	return lanesWithoutCard.map((lane) => {
		if (lane.id !== targetLaneId) {
			return lane;
		}

		const nextCards = [...lane.cards];
		const boundedTargetIndex = Math.max(
			0,
			Math.min(targetIndex, nextCards.length),
		);
		nextCards.splice(boundedTargetIndex, 0, cardToMove);

		return {
			...lane,
			cards: nextCards,
		};
	});
}

export const KanbanBoard = ({
	data,
	handleDragEnd,
	onCardClick,
	onCardMoveAcrossLanes,
	components,
}: KanbanBoardProps) => {
	const [lanes, setLanes] = useState(data);
	const [dragSession, setDragSession] = useState<DragSession | null>(null);
	const dragActiveRef = useRef(false);
	const lanesRef = useRef(lanes);
	const dragSessionRef = useRef<DragSession | null>(null);
	const dropTargetRef = useRef<DropTarget | null>(null);
	const dropTargetStoreRef = useRef<DropTargetStore | null>(null);
	const pointerPressRef = useRef<PointerPress | null>(null);
	const previousRectsRef = useRef(new Map<string, DOMRect>());
	const laneRefs = useRef(new Map<string, HTMLDivElement>());
	const cardRefs = useRef(new Map<string, HTMLDivElement>());
	const overlayRef = useRef<HTMLDivElement | null>(null);
	const boardScrollerRef = useRef<HTMLDivElement | null>(null);
	const latestDragPointRef = useRef<DragPoint | null>(null);
	const dragFrameRef = useRef<number | null>(null);
	const removePointerListenersRef = useRef<(() => void) | null>(null);
	const previousUserSelectRef = useRef<string | null>(null);
	const CardComponent = components?.Card ?? DefaultCard;

	if (!dropTargetStoreRef.current) {
		dropTargetStoreRef.current = createDropTargetStore();
	}

	const dropTargetStore = dropTargetStoreRef.current;

	useEffect(() => {
		setLanes(data);
	}, [data]);

	useEffect(() => {
		lanesRef.current = lanes;
	}, [lanes]);

	useEffect(() => {
		return () => {
			removePointerListenersRef.current?.();

			if (dragFrameRef.current !== null) {
				window.cancelAnimationFrame(dragFrameRef.current);
			}

			if (previousUserSelectRef.current !== null) {
				document.body.style.userSelect = previousUserSelectRef.current;
			}
		};
	}, []);

	const cardLookup = useMemo(() => {
		const lookup = new Map<string, Card>();

		lanes.forEach((lane) => {
			lane.cards.forEach((card) => lookup.set(card.id, card));
		});

		return lookup;
	}, [lanes]);

	const captureItemRects = () => {
		const rects = new Map<string, DOMRect>();
		const draggingCardId = dragSessionRef.current?.cardId;

		cardRefs.current.forEach((node, cardId) => {
			if (cardId === draggingCardId) {
				return;
			}

			rects.set(cardId, node.getBoundingClientRect());
		});

		previousRectsRef.current = rects;
	};

	const setAnimatedDropTarget = (nextTarget: DropTarget | null) => {
		const currentTarget = dropTargetRef.current;

		if (
			currentTarget?.laneId === nextTarget?.laneId &&
	  currentTarget?.index === nextTarget?.index
		) {
			return;
		}

		captureItemRects();
		dropTargetRef.current = nextTarget;
		dropTargetStore.setTarget(nextTarget);
	};

	const animateCardsFromPreviousRects = useCallback((cardIds?: string[]) => {
		const previousRects = previousRectsRef.current;

		if (!previousRects.size) {
			return;
		}

		const allowedCardIds = cardIds ? new Set(cardIds) : null;

		cardRefs.current.forEach((node, cardId) => {
			if (allowedCardIds && !allowedCardIds.has(cardId)) {
				return;
			}

			const previousRect = previousRects.get(cardId);

			if (!previousRect) {
				return;
			}

			const nextRect = node.getBoundingClientRect();
			const deltaX = previousRect.left - nextRect.left;
			const deltaY = previousRect.top - nextRect.top;

			if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) {
				return;
			}

			node.animate(
				[
					{ transform: `translate(${deltaX}px, ${deltaY}px)` },
					{ transform: 'translate(0, 0)' },
				],
				{
					duration: 180,
					easing: 'cubic-bezier(0.2, 0, 0, 1)',
				},
			);
		});
	}, []);

	useLayoutEffect(() => {
		animateCardsFromPreviousRects();
		previousRectsRef.current = new Map();
	}, [animateCardsFromPreviousRects, lanes]);

	const registerLaneRef = useCallback(
		(laneId: string, node: HTMLDivElement | null) => {
			if (node) {
				laneRefs.current.set(laneId, node);
				return;
			}

			laneRefs.current.delete(laneId);
		},
		[],
	);

	const registerCardRef = useCallback(
		(cardId: string, node: HTMLDivElement | null) => {
			if (node) {
				cardRefs.current.set(cardId, node);
				return;
			}

			cardRefs.current.delete(cardId);
		},
		[],
	);

	const getDropTargetFromPoint = (
		x: number,
		y: number,
	): DropTarget | null => {
		const draggingCardId = dragSessionRef.current?.cardId;

		for (const lane of lanesRef.current) {
			const laneNode = laneRefs.current.get(lane.id);

			if (!laneNode) {
				continue;
			}

			const laneRect = laneNode.getBoundingClientRect();

			if (
				x < laneRect.left ||
		x > laneRect.right ||
		y < laneRect.top ||
		y > laneRect.bottom
			) {
				continue;
			}

			const visibleCards = lane.cards.filter(
				(card) => card.id !== draggingCardId,
			);
			let index = visibleCards.length;

			for (let cardIndex = 0; cardIndex < visibleCards.length; cardIndex += 1) {
				const cardNode = cardRefs.current.get(visibleCards[cardIndex].id);

				if (!cardNode) {
					continue;
				}

				const cardRect = cardNode.getBoundingClientRect();

				if (y < cardRect.top + cardRect.height / 2) {
					index = cardIndex;
					break;
				}
			}

			return { laneId: lane.id, index };
		}

		return null;
	};

	const getOverlayTransform = (session: DragSession, point: DragPoint) =>
		`translate3d(${point.x - session.offsetX}px, ${
			point.y - session.offsetY
		}px, 0)`;

	const getAutoScrollSpeed = (distanceFromEdge: number) => {
		const intensity = Math.min(
			1,
			Math.max(
				0,
				(AUTO_SCROLL_EDGE_DISTANCE - distanceFromEdge) /
					AUTO_SCROLL_EDGE_DISTANCE,
			),
		);

		return Math.max(1, Math.round(intensity * AUTO_SCROLL_MAX_SPEED));
	};

	const scrollBoardNearEdge = (point: DragPoint) => {
		const scroller = boardScrollerRef.current;

		if (!scroller) {
			return false;
		}

		const rect = scroller.getBoundingClientRect();
		const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
		let scrollDelta = 0;

		if (point.x - rect.left < AUTO_SCROLL_EDGE_DISTANCE && scroller.scrollLeft > 0) {
			scrollDelta = -getAutoScrollSpeed(point.x - rect.left);
		} else if (
			rect.right - point.x < AUTO_SCROLL_EDGE_DISTANCE &&
			scroller.scrollLeft < maxScrollLeft
		) {
			scrollDelta = getAutoScrollSpeed(rect.right - point.x);
		}

		if (!scrollDelta) {
			return false;
		}

		const nextScrollLeft = Math.max(
			0,
			Math.min(maxScrollLeft, scroller.scrollLeft + scrollDelta),
		);

		if (nextScrollLeft === scroller.scrollLeft) {
			return false;
		}

		scroller.scrollLeft = nextScrollLeft;
		return true;
	};

	const applyDragFrame = () => {
		dragFrameRef.current = null;

		const session = dragSessionRef.current;
		const point = latestDragPointRef.current;

		if (!session || !point) {
			return;
		}

		if (overlayRef.current) {
			overlayRef.current.style.transform = getOverlayTransform(session, point);
		}

		const didAutoScroll = scrollBoardNearEdge(point);
		setAnimatedDropTarget(getDropTargetFromPoint(point.x, point.y));

		if (didAutoScroll) {
			// eslint-disable-next-line @typescript-eslint/no-use-before-define
			scheduleDragFrame();
		}
	};

	const scheduleDragFrame = () => {
		if (dragFrameRef.current !== null) {
			return;
		}

		dragFrameRef.current = window.requestAnimationFrame(applyDragFrame);
	};

	const beginDrag = (event: PointerEvent, press: PointerPress) => {
		const sourceLane = lanesRef.current.find(
			(lane) => lane.id === press.sourceLaneId,
		);
		const sourceIndex =
	  sourceLane?.cards.findIndex((card) => card.id === press.cardId) ?? 0;
		const initialDropTarget = {
			laneId: press.sourceLaneId,
			index: Math.max(0, sourceIndex),
		};
		const nextSession: DragSession = {
			...press,
			x: event.clientX,
			y: event.clientY,
		};

		if (previousUserSelectRef.current === null) {
			previousUserSelectRef.current = document.body.style.userSelect;
			document.body.style.userSelect = 'none';
		}

		captureItemRects();
		dragActiveRef.current = true;
		dragSessionRef.current = nextSession;
		latestDragPointRef.current = { x: event.clientX, y: event.clientY };
		dropTargetRef.current = initialDropTarget;
		setDragSession(nextSession);
		dropTargetStore.setTarget(initialDropTarget);
	};

	const updateDragPosition = (event: PointerEvent) => {
		const currentSession = dragSessionRef.current;

		if (!currentSession) {
			return;
		}

		latestDragPointRef.current = {
			x: event.clientX,
			y: event.clientY,
		};

		scheduleDragFrame();
	};

	const clearDragState = () => {
		if (dragFrameRef.current !== null) {
			window.cancelAnimationFrame(dragFrameRef.current);
			dragFrameRef.current = null;
		}

		if (previousUserSelectRef.current !== null) {
			document.body.style.userSelect = previousUserSelectRef.current;
			previousUserSelectRef.current = null;
		}

		pointerPressRef.current = null;
		dragSessionRef.current = null;
		latestDragPointRef.current = null;
		dropTargetRef.current = null;
		dropTargetStore.setTarget(null);
		setDragSession(null);

		window.setTimeout(() => {
			dragActiveRef.current = false;
		}, 0);
	};

	const finishDrag = async () => {
		const session = dragSessionRef.current;
		const target = dropTargetRef.current;

		if (!session || !target) {
			clearDragState();
			return;
		}

		const currentLanes = lanesRef.current;
		const sourceLane = currentLanes.find(
			(lane) => lane.id === session.sourceLaneId,
		);
		const targetLane = currentLanes.find((lane) => lane.id === target.laneId);
		const card = sourceLane?.cards.find(
			(laneCard) => laneCard.id === session.cardId,
		);
		const sourceIndex =
	  sourceLane?.cards.findIndex((laneCard) => laneCard.id === session.cardId) ??
	  -1;

		if (!sourceLane || !targetLane || card?.draggable === false || sourceIndex < 0) {
			clearDragState();
			return;
		}

		const isSamePosition =
	  sourceLane.id === targetLane.id && sourceIndex === target.index;

		if (isSamePosition) {
			clearDragState();
			return;
		}

		const dragEvent: KanbanDragEndEvent = {
			cardId: card.id,
			card,
			sourceLaneId: sourceLane.id,
			targetLaneId: targetLane.id,
			sourceLane,
			targetLane,
			data: currentLanes,
		};
		const canMove = handleDragEnd ? await handleDragEnd(dragEvent) : true;

		if (!canMove) {
			clearDragState();
			return;
		}

		captureItemRects();

		const nextData = moveCardToLane(
			currentLanes,
			card.id,
			sourceLane.id,
			targetLane.id,
			target.index,
		);

		lanesRef.current = nextData;
		setLanes(nextData);

		if (sourceLane.id !== targetLane.id) {
			onCardMoveAcrossLanes?.({ ...dragEvent, nextData });
		}

		clearDragState();
	};

	const removePointerListeners = () => {
		removePointerListenersRef.current?.();
		removePointerListenersRef.current = null;
	};

	const handleWindowPointerMove = (event: PointerEvent) => {
		const session = dragSessionRef.current;
		const press = pointerPressRef.current;

		if (session) {
			if (event.pointerId !== session.pointerId) {
				return;
			}

			event.preventDefault();
			updateDragPosition(event);
			return;
		}

		if (!press || event.pointerId !== press.pointerId) {
			return;
		}

		const distance = Math.hypot(
			event.clientX - press.startX,
			event.clientY - press.startY,
		);

		if (distance < DRAG_START_DISTANCE) {
			return;
		}

		event.preventDefault();
		beginDrag(event, press);
		updateDragPosition(event);
	};

	const handleWindowPointerUp = (event: PointerEvent) => {
		const session = dragSessionRef.current;
		const press = pointerPressRef.current;

		if (
			(session && event.pointerId !== session.pointerId) ||
	  (!session && press && event.pointerId !== press.pointerId)
		) {
			return;
		}

		removePointerListeners();
		pointerPressRef.current = null;

		if (!session) {
			return;
		}

		event.preventDefault();
		void finishDrag();
	};

	const handleWindowPointerCancel = (event: PointerEvent) => {
		const session = dragSessionRef.current;
		const press = pointerPressRef.current;

		if (
			(session && event.pointerId !== session.pointerId) ||
	  (!session && press && event.pointerId !== press.pointerId)
		) {
			return;
		}

		removePointerListeners();
		clearDragState();
	};

	const handleCardPointerDown = (
		event: ReactPointerEvent<HTMLDivElement>,
		laneId: string,
		card: Card,
	) => {
		if (card.draggable === false || event.button !== 0) {
			return;
		}

		const rect = event.currentTarget.getBoundingClientRect();
		pointerPressRef.current = {
			cardId: card.id,
			sourceLaneId: laneId,
			pointerId: event.pointerId,
			startX: event.clientX,
			startY: event.clientY,
			width: rect.width,
			height: rect.height,
			offsetX: event.clientX - rect.left,
			offsetY: event.clientY - rect.top,
		};

		removePointerListenersRef.current?.();
		window.addEventListener('pointermove', handleWindowPointerMove, {
			passive: false,
		});
		window.addEventListener('pointerup', handleWindowPointerUp);
		window.addEventListener('pointercancel', handleWindowPointerCancel);
		removePointerListenersRef.current = () => {
			window.removeEventListener('pointermove', handleWindowPointerMove);
			window.removeEventListener('pointerup', handleWindowPointerUp);
			window.removeEventListener('pointercancel', handleWindowPointerCancel);
		};
	};

	const handleClick = useCallback((cardId: string) => {
		if (dragActiveRef.current) {
			return;
		}

		onCardClick?.(cardId);
	}, [onCardClick]);

	const handleKeyDown = useCallback((
		event: KeyboardEvent<HTMLDivElement>,
		cardId: string,
	) => {
		if (!onCardClick || (event.key !== 'Enter' && event.key !== ' ')) {
			return;
		}

		event.preventDefault();
		handleClick(cardId);
	}, [handleClick, onCardClick]);

	const draggingCard = dragSession
		? cardLookup.get(dragSession.cardId)
		: undefined;
	const draggingCardId = dragSession?.cardId ?? null;
	const placeholderHeight = dragSession?.height ?? null;

	return (
		<div className="kanban-board">
			<BoardScroller ref={boardScrollerRef}>
				{lanes.map((lane) => (
					<LaneColumn
						key={lane.id}
						lane={lane}
						draggingCardId={draggingCardId}
						placeholderHeight={placeholderHeight}
						dropTargetStore={dropTargetStore}
						registerLaneRef={registerLaneRef}
						registerCardRef={registerCardRef}
						animateCards={animateCardsFromPreviousRects}
						onCardPointerDown={handleCardPointerDown}
						onCardClick={handleClick}
						onCardKeyDown={handleKeyDown}
						canClickCards={Boolean(onCardClick)}
						CardComponent={CardComponent}
					/>
				))}
			</BoardScroller>
			{dragSession && draggingCard
				? 
				(<DragOverlay
					ref={overlayRef}
					$overlayWidth={dragSession.width}
					$initialTransform={getOverlayTransform(dragSession, dragSession)}
				>
					<CardComponent {...draggingCard} />
				</DragOverlay>
				)
				: null}
		</div>
	);
};
