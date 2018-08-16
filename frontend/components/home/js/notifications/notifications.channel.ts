/**
 *  Copyright (C) 2016 3D Repo Ltd
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

import { NotificationService } from "./notification.service";
import { NotificationEvents } from "./notification.events";
import { NotificationModelEvents } from "./notification.model.events";
import { NotificationIssuesEvents } from "./notification.issues.events";

export class NotificationsChannel {
	/**
	 * This property contains the object to suscribe to the issues and comments for the issues notification events
	 */
	public issues: NotificationIssuesEvents;

	/**
	 * This property contains the object to suscribe to the groups notification events
	 */
	public groups: NotificationEvents;

	/**
	 * This property contains the object to suscribe to the general modem status notification events
	 */
	public model: NotificationModelEvents;

	constructor(private notificationService: NotificationService, private account: string, private modelStr: string) {
		this.groups = new NotificationEvents(this, "group");
		this.issues = new NotificationIssuesEvents(this);
		this.model = new NotificationModelEvents(this);
	}

	/**
	 * This method is for start listening to a remote notification event. Its intended for
	 * private use for the NotificationEvents objects.
	 * @param event the event name
	 * @param callback the callback that will be used when the event is remotely triggered
	 * @param keys extra keys for suscribing to a particular entity events
	 */
	public suscribe(event: string, callback, keys = null) {
		this.notificationService.performSubscribe(this.account, this.modelStr, keys, event, callback);
	}

	/**
	 * This method is for stop listening to a remote notification event. Its intended for
	 * private use for the NotificationEvents objects.
	 * @param event the event name
	 * @param keys extra keys for unsuscribing to a particular entity events
	 */
	public unsuscribe(event: string, keys = null) {
		this.notificationService.performUnsubscribe(this.account, this.modelStr, keys, event);
	}
}
