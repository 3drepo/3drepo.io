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

import { CHAT_CHANNELS } from '../../constants/chat';
import { ChatEvents } from './chat.events';
import { IssuesChatEvents } from './issues.chat.events';
import { ModelChatEvents } from './models.chat.events';
import { NotificationsChatEvents } from './notifications.chat.events';
import { PresentationChatEvents } from './presentation.chat.events';
import { RisksChatEvents } from './risks.chat.events';
import { Subscriptions } from './subscriptions';
import { TeamspacesChatEvents } from './teamspaces.chat.events';

const getEventName = (teamspace: string, model: string, keys: string, event: string) => {
	const eventName = [teamspace];

	if (model) {
		eventName.push(model);
	}
	if (!!keys) {
		eventName.push(keys);
	}

	eventName.push(event);

	return eventName.join('::');
};

export class Channel {
	/**
	 * This property contains the object to subscribe to the issues and comments for the issues chat events
	 */
	public issues: IssuesChatEvents;

	/**
	 * This property contains the object to subscribe to the risks and comments for the risks chat events
	 */
	public risks: RisksChatEvents;

	/**
	 * This property contains the object to subscribe to the groups chat events
	 */
	public groups: ChatEvents;

	/**
	 * This property contains the object to subscribe to the resources chat events
	 */
	public resources: ChatEvents;

	/**
	 * This property contains the object to subscribe to the views chat events
	 */
	public views: ChatEvents;

	/**
	 * This property contains the object to subscribe to the general model status chat events
	 */
	public model: ModelChatEvents;

	public notifications: NotificationsChatEvents;

	public teamspaces: TeamspacesChatEvents;

	/**
	 * This dictionary holds the callbacks for every event in the channel .
	 * When the last callback has been unsubscribed, the channel unsubscribe from the event completely.
	 */
	private subscriptions: { [event: string]: Subscriptions } = {};

	constructor(
		private socket,
		private teamspace: string,
		private modelStr: string,
		private onSubscribe: () => void
	) {
		this[CHAT_CHANNELS.GROUPS] = new ChatEvents(this, 'group');
		this[CHAT_CHANNELS.ISSUES] = new IssuesChatEvents(this);
		this[CHAT_CHANNELS.RISKS] = new RisksChatEvents(this);
		this[CHAT_CHANNELS.MODEL] = new ModelChatEvents(this);
		this[CHAT_CHANNELS.VIEWS] = new ChatEvents(this, 'view');
		this[CHAT_CHANNELS.RESOURCES] = new ChatEvents(this, 'resource');
		this[CHAT_CHANNELS.NOTIFICATIONS] = new NotificationsChatEvents(this);
		this[CHAT_CHANNELS.PRESENTATION] = new PresentationChatEvents(this);
		this[CHAT_CHANNELS.TEAMSPACES] = new TeamspacesChatEvents(this);
	}

	/**
	 * This method is for start listening to a remote notification event. Its intended for
	 * private use for the NotificationEvents objects.
	 * @param event the event name
	 * @param callback the callback that will be used when the event is remotely triggered
	 * @param keys extra keys for subscribing to a particular entity events
	 */
	public subscribe(event: string, callback: (data: any) => void, context: any, keys = null) {
		const eventFullName = getEventName(this.teamspace, this.modelStr, keys, event);
		if (!this.hasSubscriptions(eventFullName)) {
			this.performSubscribe(this.teamspace, this.modelStr, keys, event, this.onEvent.bind(this, eventFullName));
		}

		this.addCallback(eventFullName, callback, context);
	}

	/**
	 * This method is for stop listening to a remote notification event. Its intended for
	 * private use for the NotificationEvents objects.
	 * @param event the event name
	 * @param keys extra keys for unsubscribing to a particular entity events
	 */
	public unsubscribe(event: string, callback: (data: any) => void, keys = null) {
		const eventFullName = getEventName(this.teamspace, this.modelStr, keys, event);

		this.removeCallBack(eventFullName, callback);

		if (!this.hasSubscriptions(eventFullName)) {
			this.performUnsubscribe(this.teamspace, this.modelStr, keys, event);
		}
	}

	private onEvent(event: string, data: any) {
		this.subscriptions[event].invokeCallbacks(data);
	}

	private addCallback(event, callback, context): void {
		if (!this.hasSubscriptions(event)) {
			this.subscriptions[event] = new Subscriptions();
		}

		this.subscriptions[event].subscribe(callback, context);
	}

	private removeCallBack(event, callback): void {
		if (!this.hasSubscriptions(event)) {
			return;
		}

		this.subscriptions[event].unsubscribe(callback);
	}

	private hasSubscriptions(event: string) {
		return Boolean(this.subscriptions[event]);
	}

	private performSubscribe(teamspace: string, model: string, keys: any, event: any, callback: any) {
		this.onSubscribe();
		const eventName = getEventName(teamspace, model, keys, event);
		this.socket.on(eventName, callback);
	}

	private performUnsubscribe(teamspace: string, model: string, keys: any, event: any) {
		this.socket.off(getEventName(teamspace, model, keys, event));
	}
}
