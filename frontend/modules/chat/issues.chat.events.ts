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
import { ChatEvents } from './chat.events';

export class IssuesChatEvents extends ChatEvents {
	private comments: { [id: string]: ChatEvents};

	constructor(protected channel: Channel) {
		super(channel, 'issue');
		this.comments = {};
	}

	public getCommentsChatEvents(id: string): ChatEvents {
		if (!this.comments[id]) {
			this.comments[id] =  new ChatEvents(this.channel, 'comment', id);
		}

		return this.comments[id];
	}

}
