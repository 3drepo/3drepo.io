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

export class NotificationEvents {
	constructor(protected channel: NotificationsChannel, private entity: string, private keys: any = null) {

	}

	public onCreated(callback: (data: any) => void): void {
		this.channel.suscribe(this.entity + "Created", callback, this.keys);
	}

	public onUpdated(callback: (data: any) => void): void {
		this.channel.suscribe(this.entity + "Updated", callback, this.keys);
	}

	public onDeleted(callback: (data: any) => void): void {
		this.channel.suscribe(this.entity + "Deleted", callback, this.keys );
	}

	public offCreated(): void {
		this.channel.unsuscribe(this.entity + "Created");
	}

	public offUpdated(): void {
		this.channel.unsuscribe(this.entity + "Updated");
	}

	public offDeleted(): void {
		this.channel.unsuscribe(this.entity + "Deleted");
	}

}
