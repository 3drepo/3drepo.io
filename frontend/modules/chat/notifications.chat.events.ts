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

export class NotificationsChatEvents {
	constructor(private channel: Channel) {
	}

	public subscribeToUpserted(callback: (data: any) => void, context: any) {
		this.channel.subscribe('notificationUpserted', callback, context);
	}

	public unsubscribeFromUpserted(callback: (data: any) => void) {
		this.channel.unsubscribe('notificationUpserted', callback);
	}

	public subscribeToDeleted(callback: (data: any) => void, context: any) {
		this.channel.subscribe('notificationDeleted', callback, context);
	}

	public unsubscribeFromDeleted(callback: (data: any) => void) {
		this.channel.unsubscribe('notificationDeleted', callback);
	}
}
