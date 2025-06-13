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

import { useRef } from 'react';
import { PublishFn, SubscribeFn } from '../helpers/contextWithCondition/contextWithCondition.types';

export class PubSub<K extends string> {
	private subscriptions: Partial<Record<K, Function[]>> = {};

	public publish: PublishFn<K> = (event: K, ...args) => this.subscriptions[event]?.forEach((fn) => fn(event, ...args));

	public subscribe: SubscribeFn<K> = (events: K[], fn: Function) => {
		const subs = events.map((event) => {
			this.subscriptions[event] ||= [];
			this.subscriptions[event].push(fn);
			return () => {
				this.subscriptions[event] = this.subscriptions[event].filter((subscribedFn) => subscribedFn !== fn);
			};
		});
		return () => subs.forEach((unsubscribe) => unsubscribe());
	};
}

export const usePubSub = <K extends string>() => {
	const ref = useRef(new PubSub<K>());
	return {
		publish: ref.current.publish,
		subscribe: ref.current.subscribe,
	};
};