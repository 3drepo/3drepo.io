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

declare const io;

export class NotificationService {
	public static $inject: string[] = [
		"$injector",
		"ClientConfigService",
		"DialogService"
	];

	public subscribe: any;
	public unsubscribe: any;

	private dialogOpen;
	private lastDialogOpen;
	private socket;
	private joined;
	private channels: { [id: string]: NotificationsChannel} = {};

	constructor(
		private $injector,
		private ClientConfigService,
		private DialogService
	) {
		this.dialogOpen = false;

		if (!ClientConfigService.chatHost || !ClientConfigService.chatPath) {
			console.error("Chat server settings missing");
			return;
		}

		this.socket = io(ClientConfigService.chatHost, {
			path: ClientConfigService.chatPath,
			transports: ["websocket"],
			reconnection: true,
			reconnectionDelay: 500,
			reconnectionAttempts: ClientConfigService.chatReconnectionAttempts || Infinity
		});

		this.joined = [];
		this.setupSocketEvents();
	}

	public setupSocketEvents() {
		this.socket.on("connect", () => {
			this.addSocketIdToHeader(this.socket.id);
		});

		this.socket.on("disconnect", () => {

			console.error("The websocket for the notification service was disconnected");
			this.DialogService.disconnected();

		});

		this.socket.on("reconnect", () => {

			console.debug("Rejoining all rooms on reconnect");

			this.addSocketIdToHeader(this.socket.id);

			const lastJoined = this.joined.slice(0);
			this.joined = [];

			lastJoined.forEach((room) => {

				room = room.split("::");

				const account = room[0];
				const model = room[1];

				this.joinRoom(account, model);
			});
		});
	}

	public addSocketIdToHeader(socketId: string) {

		const $httpProvider = this.$injector.get("$http");

		$httpProvider.defaults.headers.post = $httpProvider.defaults.headers.post || {};
		$httpProvider.defaults.headers.put = $httpProvider.defaults.headers.put || {};
		$httpProvider.defaults.headers.delete = $httpProvider.defaults.headers.delete || {};

		$httpProvider.defaults.headers.post["x-socket-id"] = socketId;
		$httpProvider.defaults.headers.put["x-socket-id"] = socketId;
		$httpProvider.defaults.headers.delete["x-socket-id"] = socketId;
	}

	public joinRoom(account: string, model: string) {

		let modelNameSpace = "";

		if (model) {
			modelNameSpace = "::" + model;
		}

		const room =  account + modelNameSpace;
		if (this.joined.indexOf(room) === -1) {

			this.socket.emit("join", {account, model});
			this.joined.push(room);
		}
	}

	public getChannel(account: string, model: string): NotificationsChannel {
		const channelId: string = account + "::" + model;

		if ( !this.channels[channelId] ) {
			this.channels[channelId] = new NotificationsChannel(this, account, model);
		}

		return this.channels[channelId];
	}

	public getEventName(account: string, model: string, keys: string, event): string {

		let modelNameSpace = "";

		if (model) {
			modelNameSpace = "::" + model;
		}

		let keyString = "";

		if (!!keys) {
			keyString =  "::" + keys;
		}

		return account + modelNameSpace +  keyString + "::" + event;
	}

	public performSubscribe(account: string, model: string, keys: any, event: any, callback: any) {

		this.joinRoom(account, model);

		const eventName = this.getEventName(account, model, keys, event);
		this.socket.on(eventName, (data) => {
			callback(data);
		});
	}

	public performUnsubscribe(account: string, model: string, keys: any, event: any) {
		this.socket.off(this.getEventName(account, model, keys, event));
	}

}

export const NotificationServiceModule = angular
	.module("3drepo")
	.service("NotificationService", NotificationService);
