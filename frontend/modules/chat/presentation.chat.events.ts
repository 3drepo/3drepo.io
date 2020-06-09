/**
 *  Copyright (C) 2020 3D Repo Ltd
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
import { ChatEvents } from './chat.events';

export class PresentationChatEvents {
	private code: string;

	constructor(protected channel: Channel) {

	}

	public subscribeToStream(code: string, callback: (data: any) => void, context: any) {
		this.code = code;

		const event = `presentation::${code}::updated`;
		this.channel.subscribe(event, callback, context);
	}

	public unsubscribeFromStream(callback: (data: any) => void) {
		const event = `presentation::${this.code}::updated`;
		this.channel.unsubscribe(event, callback);
	}

}
