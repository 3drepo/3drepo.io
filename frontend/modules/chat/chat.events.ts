/**
 *  Copyright (C) 2018 3D Repo Ltd
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

import { Channel } from './channel';

enum EventType {
	CREATED = 'Created',
	UPDATED = 'Updated',
	DELETED = 'Deleted'
}

export class ChatEvents {
	constructor(protected channel: Channel, private entity: string, private keys: any = null) {

	}

	public subscribeToCreated(callback: (data: any) => void, context: any): void {
		this.subscribeToEvent(EventType.CREATED, callback, context);
	}

	public subscribeToUpdated(callback: (data: any) => void, context: any): void {
		this.subscribeToEvent(EventType.UPDATED, callback, context);
	}

	public subscribeToDeleted(callback: (data: any) => void, context: any): void {
		this.subscribeToEvent(EventType.DELETED, callback, context);
	}

	public unsubscribeFromCreated(callback: (data: any) => void): void {
		this.unsubscribeFromEvent(EventType.CREATED, callback);
	}

	public unsubscribeFromUpdated(callback: (data: any) => void): void {
		this.unsubscribeFromEvent(EventType.UPDATED, callback);
	}

	public unsubscribeFromDeleted(callback: (data: any) => void): void {
		this.unsubscribeFromEvent(EventType.DELETED, callback);
	}

	/**
	 * This method is internal for subscribe to the channel event using the type of
	 * entity corresponding to the instance of this class and a event of that type.
	 *
	 * @param event the event we are going to subscribe to
	 * @param callback the callback that will be called on the event
	 * @param context the context of the callback
	 */
	private subscribeToEvent(event: EventType, callback: (data: any) => void, context: any) {
		this.channel.subscribe(this.entity + event, callback, context, this.keys );
	}

	/**
	 * This method is internal for unsubscribing from the channel event using the type of
	 * entity corresponding to the instance of this class and a event of that type.
	 *
	 * @param event the event we are going to subscribe to
	 * @param callback the exact same callback that was used for subscribing to the event.
	 * notice that if bind is a applied to a method of a function it creates a new function so
	 * this exact bind function should be passed here in order to successfully unsubscribe
	 */
	private unsubscribeFromEvent(event: EventType, callback: (data: any) => void) {
		this.channel.unsubscribe(this.entity + event, callback, this.keys );
	}

}
