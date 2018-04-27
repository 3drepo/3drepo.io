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
declare const io;

export class NotificationService {

	public static $inject: string[] = [
		"$injector",
		"ClientConfigService",
		"DialogService",
	];

	public subscribe: any;
	public unsubscribe: any;

	private dialogOpen;
	private lastDialogOpen;
	private socket;
	private joined;

	constructor(
		private $injector,
		private ClientConfigService,
		private DialogService,
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
			reconnectionAttempts: ClientConfigService.chatReconnectionAttempts || Infinity,
		});

		this.joined = [];
		this.setupSocketEvents();

		this.subscribe = {
			joinRoom: this.joinRoom,
			getEventName: this.getEventName,
			joined: this.joined,
			socket: this.socket,

			performSubscribe: this.performSubscribe,
			newIssues: this.subscribeNewIssues,
			newComment: this.subscribeNewComment,
			commentChanged: this.subscribeCommentChanged,
			commentDeleted: this.subscribeCommentDeleted,
			issueChanged: this.subscribeIssueChanged,
			modelStatusChanged: this.subscribeModelStatusChanged,
			newModel: this.subscribeNewModel,
		};

		this.unsubscribe = {
			joinRoom: this.joinRoom,
			getEventName: this.getEventName,
			joined: this.joined,
			socket: this.socket,

			performUnsubscribe: this.performUnsubscribe,
			newIssues: this.unsubscribeNewIssues,
			newComment: this.unsubscribeNewComment,
			commentChanged: this.unsubscribeCommentChanged,
			commentDeleted: this.unsubscribeCommentDeleted,
			issueChanged: this.unsubscribeIssueChanged,
			modelStatusChanged: this.unsubscribeModelStatusChanged,
			newModel: this.unsubscribeNewModel,
		};

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

	public getEventName(account: string, model: string, keys: any[], event): string {

		let modelNameSpace = "";

		if (model) {
			modelNameSpace = "::" + model;
		}

		keys = keys || [];
		let keyString = "";

		if (keys.length) {
			keyString =  "::" + keys.join("::");
		}

		return account + modelNameSpace +  keyString + "::" + event;
	}

	public subscribeNewIssues(account: string, model: string, callback: any) {
		this.performSubscribe(account, model, [], "newIssues", callback);
	}

	public unsubscribeNewIssues(account: string, model: string) {
		this.performUnsubscribe(account, model, [], "newIssues");
	}

	public subscribeNewComment(account: string, model: string, issueId: string, callback: any) {
		this.performSubscribe(account, model, [issueId], "newComment", callback);
	}

	public unsubscribeNewComment(account: string, model: string, issueId: string) {
		this.performUnsubscribe(account, model, [issueId], "newComment");
	}

	public subscribeCommentChanged(account: string, model: string, issueId: string, callback: any) {
		this.performSubscribe(account, model, [issueId], "commentChanged", callback);
	}

	public unsubscribeCommentChanged(account: string, model: string, issueId: string) {
		this.performUnsubscribe(account, model, [issueId], "commentChanged");
	}

	public subscribeCommentDeleted(account: string, model: string, issueId: string, callback: any) {
		this.performSubscribe(account, model, [issueId], "commentDeleted", callback);
	}

	public unsubscribeCommentDeleted(account: string, model: string, issueId: string) {
		this.performUnsubscribe(account, model, [issueId], "commentDeleted");
	}

	public subscribeIssueChanged(account: string, model: string, issueId: string, callback: any) {
		if (arguments.length === 3) {
			callback = issueId;
			this.performSubscribe(account, model, [], "issueChanged", callback);
		} else {
			this.performSubscribe(account, model, [issueId], "issueChanged", callback);
		}
	}

	public unsubscribeIssueChanged(account: string, model: string, issueId: string) {
		if (arguments.length === 2) {
			this.performUnsubscribe(account, model, [], "issueChanged");
		} else {
			this.performUnsubscribe(account, model, [issueId], "issueChanged");
		}
	}

	public subscribeModelStatusChanged(account: string, model: string, callback: any) {
		this.performSubscribe(account, model, [], "modelStatusChanged", callback);
	}

	public unsubscribeModelStatusChanged(account: string, model: string) {
		this.performUnsubscribe(account, model, [], "modelStatusChanged");
	}

	public subscribeNewModel(account: string, callback: any) {
		this.performSubscribe(account, null, [], "newModel", callback);
	}

	public unsubscribeNewModel(account: string, model: string) {
		this.performUnsubscribe(account, null, [], "newModel");
	}

	private performSubscribe(account: string, model: string, keys: any[], event: any, callback: any) {

		this.joinRoom(account, model);

		const eventName = this.getEventName(account, model, keys, event);
		this.socket.on(eventName, (data) => {
			callback(data);
		});
	}

	private performUnsubscribe(account: string, model: string, keys: any[], event: any) {
		this.socket.off(this.getEventName(account, model, keys, event));
	}

}

export const NotificationServiceModule = angular
	.module("3drepo")
	.service("NotificationService", NotificationService);
