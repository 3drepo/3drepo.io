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

import { MutableRefObject } from 'react';

export type UnsubscribeFn = () => void;
export type SubscribeFn<Event> = (events: Event[], callback: (...args) => void) => UnsubscribeFn;
export type PublishFn<Event> = (event: Event, ...args) => void;

export type SubscribableObject<ContextState> = {
	state: ContextState,
	previousState: MutableRefObject<ContextState>,
	subscribe: SubscribeFn<keyof ContextState>,
};

export type DependencyArray<ContextState> = (keyof ContextState)[];
export type UpdatingCondition<ContextState, ContextType> = (
	currentState: ContextState,
	previousState: ContextState,
	context: Omit<ContextType, keyof SubscribableObject<ContextState>>
) => boolean;