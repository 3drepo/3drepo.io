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

	public onStatusChanged(callback: (data: any) => void) {
		this.channel.suscribe("modelStatusChanged", callback);
	}

	public offStatusChanged() {
		this.channel.unsuscribe("modelStatusChanged");
	}

	public onCreated(callback: (data: any) => void) {
		this.channel.suscribe("modelCreated", callback);
	}

	public offCreated() {
		this.channel.unsuscribe("modelCreated");
	}
}
