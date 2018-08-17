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

import { NotificationsChannel } from "./notifications.channel";

export class NotificationModelEvents {
	constructor(private channel: NotificationsChannel) {
	}

	public onStatusChanged(callback: (data: any) => void, context: any) {
		this.channel.subscribe("modelStatusChanged", callback, context);
	}

	public offStatusChanged(callback: (data: any) => void) {
		this.channel.unsubscribe("modelStatusChanged", callback);
	}

	public onCreated(callback: (data: any) => void, context: any) {
		this.channel.subscribe("modelCreated", callback, context);
	}

	public offCreated(callback: (data: any) => void) {
		this.channel.unsubscribe("modelCreated", callback);
	}
}
