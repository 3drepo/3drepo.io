/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { CHAT_CHANNELS } from "@/v4/constants/chat";
import { Channel } from "./channel";
import { ChatEvents } from "./chat.events";
import { IssuesChatEvents } from "./issues.chat.events";
import { ModelChatEvents } from "./models.chat.events";
import { NotificationsChatEvents } from "./notifications.chat.events";
import { PresentationChatEvents } from "./presentation.chat.events";
import { RisksChatEvents } from "./risks.chat.events";
import { TeamspacesChatEvents } from "./teamspaces.chat.events";

export class ChannelSelector {
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

	constructor(
		private socket,
		private teamspace: string,
		private modelStr: string,
		private onSubscribe: () => void
	) {
		const channel =  new Channel(socket, teamspace, modelStr, onSubscribe);

		this[CHAT_CHANNELS.GROUPS] = new ChatEvents(channel, 'group');
		this[CHAT_CHANNELS.ISSUES] = new IssuesChatEvents(channel);
		this[CHAT_CHANNELS.RISKS] = new RisksChatEvents(channel);
		this[CHAT_CHANNELS.MODEL] = new ModelChatEvents(channel);
		this[CHAT_CHANNELS.VIEWS] = new ChatEvents(channel, 'view');
		this[CHAT_CHANNELS.RESOURCES] = new ChatEvents(channel, 'resource');
		this[CHAT_CHANNELS.NOTIFICATIONS] = new NotificationsChatEvents(channel);
		this[CHAT_CHANNELS.PRESENTATION] = new PresentationChatEvents(channel);
		this[CHAT_CHANNELS.TEAMSPACES] = new TeamspacesChatEvents(channel);
	}
}
