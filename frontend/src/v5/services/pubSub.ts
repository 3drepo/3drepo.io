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
import { EventEmitter } from 'eventemitter3';

export class PubSub<K extends string> {
	private emitter = new EventEmitter();

	private on = this.emitter.on.bind(this.emitter);

	private off = this.emitter.off.bind(this.emitter);

	private emit = this.emitter.emit.bind(this.emitter);

	public publish: PublishFn<K> = (event: K, ...args) => this.emit(event, ...args);

	public subscribe: SubscribeFn<K> = (events: K[], fn: PublishFn<K>) => {
		const subs = events.map((event) => {
			this.on(event, fn);
			return () => this.off(event, fn);
		});
		return () => subs.forEach((unsubscribe) => unsubscribe());
	};
}

export const usePubSub = <K extends string>() => {
	// Using useRef to ensure that the same instance of PubSub is used across renders
	const ref = useRef(new PubSub<K>());
	return ref.current;
};