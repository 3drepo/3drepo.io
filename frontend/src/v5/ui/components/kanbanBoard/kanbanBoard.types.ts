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

import type { ComponentType, KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';

export type Card = {
	id: string;
	title: string;
	description: string;
	label: string;
	draggable: boolean;
	metadata: any;
};

export type Lane = {
	id: string;
	title: string;
	label: string;
	cards: Card[];
};

export type KanbanDragEndEvent = {
	cardId: string;
	card: Card;
	sourceLaneId: string;
	targetLaneId: string;
	sourceLane: Lane;
	targetLane: Lane;
	data: Lane[];
};

export type KanbanMoveAcrossLanesEvent = KanbanDragEndEvent & {
	nextData: Lane[];
};

export type KanbanBoardComponents = {
	Card?: ComponentType<Card>;
};

export type KanbanBoardProps = {
	data: Lane[];
	handleDragEnd?: (
		event?: KanbanDragEndEvent,
	) => boolean | Promise<boolean>;
	onCardClick?: (cardId: string) => void;
	onCardMoveAcrossLanes?: (event: KanbanMoveAcrossLanesEvent) => void;
	components?: KanbanBoardComponents;
};

export type DraggedCard = {
	cardId: string;
	sourceLaneId: string;
};

export type DragSession = DraggedCard & {
	pointerId: number;
	width: number;
	height: number;
	offsetX: number;
	offsetY: number;
	x: number;
	y: number;
};

export type PointerPress = DraggedCard & {
	pointerId: number;
	startX: number;
	startY: number;
	width: number;
	height: number;
	offsetX: number;
	offsetY: number;
};

export type DragPoint = {
	x: number;
	y: number;
};

export type DropTarget = {
	laneId: string;
	index: number;
};

export type LaneDropState = {
	target: DropTarget | null;
	version: number;
};

export type DropTargetStore = {
	getLaneState: (laneId: string) => LaneDropState;
	getTarget: () => DropTarget | null;
	setTarget: (target: DropTarget | null) => void;
	subscribe: (laneId: string, listener: () => void) => () => void;
};

export type LaneColumnProps = {
	lane: Lane;
	draggingCardId: string | null;
	placeholderHeight: number | null;
	dropTargetStore: DropTargetStore;
	registerLaneRef: (laneId: string, node: HTMLDivElement | null) => void;
	registerCardRef: (cardId: string, node: HTMLDivElement | null) => void;
	animateCards: (cardIds: string[]) => void;
	onCardPointerDown: (
		event: ReactPointerEvent<HTMLDivElement>,
		laneId: string,
		card: Card,
	) => void;
	onCardClick: (cardId: string) => void;
	onCardKeyDown: (
		event: KeyboardEvent<HTMLDivElement>,
		cardId: string,
	) => void;
	canClickCards: boolean;
	CardComponent: ComponentType<Card>;
};
