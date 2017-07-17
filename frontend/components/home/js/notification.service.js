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

angular.module('3drepo')
.factory('NotificationService', NotificationService);

NotificationService.$inject = ["serverConfig", "$injector"];

function NotificationService(serverConfig, $injector){
	"use strict";

	if(!serverConfig.chatHost || !serverConfig.chatPath){
		console.log('Chat server settings missing');
	}

	var socket = io(serverConfig.chatHost, {
		path: serverConfig.chatPath, 
		transports: ['websocket'],
		reconnectionAttempts: serverConfig.chatReconnectionAttempts
	});
	var joined = [];

	function addSocketIdToHeader(socketId){
		
		var $httpProvider = $injector.get('$http');

		$httpProvider.defaults.headers.post = $httpProvider.defaults.headers.post || {};
		$httpProvider.defaults.headers.put = $httpProvider.defaults.headers.put || {};
		$httpProvider.defaults.headers.delete = $httpProvider.defaults.headers.delete || {};

		$httpProvider.defaults.headers.post['x-socket-id'] = socketId;
		$httpProvider.defaults.headers.put['x-socket-id'] = socketId;
		$httpProvider.defaults.headers.delete['x-socket-id'] = socketId;
	}

	socket.on('connect', function(){
		addSocketIdToHeader(socket.id);
	});

	socket.on('reconnect', function(){
		console.log('Rejoining all rooms on reconnect');
		addSocketIdToHeader(socket.id);

		var lastJoined = joined.slice(0);
		joined = [];

		lastJoined.forEach(function(room){

			room = room.split('::');

			var account = room[0];
			var model = room[1];

			joinRoom(account, model);
		});
	});

	function joinRoom(account, model){
		
		var modelNameSpace = '';
		
		if(model){
			modelNameSpace = '::' + model;
		}

		var room =  account + modelNameSpace;
		if(joined.indexOf(room) === -1){

			socket.emit('join', {account: account, model: model});
			joined.push(room);
		}
	}

	function getEventName(account, model, keys, event){

		var modelNameSpace = '';
		
		if(model){
			modelNameSpace = '::' + model;
		}
		
		keys = keys || [];
		var keyString = '';
		
		if(keys.length){
			keyString =  '::' + keys.join('::');
		}

		return account + modelNameSpace +  keyString + '::' + event;
	}

	function subscribe(account, model, keys, event, callback){

		joinRoom(account, model);
		console.log('sub', getEventName(account, model, keys, event));
		socket.on(getEventName(account, model, keys, event), function(data){
			console.log('msg rec', getEventName(account, model, keys, event));
			callback(data);
		});
	}

	function unsubscribe(account, model, keys, event){
		console.log('unsub', getEventName(account, model, keys, event));
		socket.off(getEventName(account, model, keys, event));
	}

	function subscribeNewIssues(account, model, callback){
		subscribe(account, model, [], 'newIssues', callback);
	}

	function unsubscribeNewIssues(account, model){
		unsubscribe(account, model, [], 'newIssues');
	}

	function subscribeNewComment(account, model, issueId, callback){
		subscribe(account, model, [issueId], 'newComment', callback);
	}

	function unsubscribeNewComment(account, model, issueId){
		unsubscribe(account, model, [issueId], 'newComment');
	}

	function subscribeCommentChanged(account, model, issueId, callback){
		subscribe(account, model, [issueId], 'commentChanged', callback);
	}

	function unsubscribeCommentChanged(account, model, issueId){
		unsubscribe(account, model, [issueId], 'commentChanged');
	}

	function subscribeCommentDeleted(account, model, issueId, callback){
		subscribe(account, model, [issueId], 'commentDeleted', callback);
	}

	function unsubscribeCommentDeleted(account, model, issueId){
		unsubscribe(account, model, [issueId], 'commentDeleted');
	}

	function subscribeIssueChanged(account, model, issueId, callback){
		if(arguments.length === 3){
			callback = issueId;
			subscribe(account, model, [], 'issueChanged', callback);
		} else {
			subscribe(account, model, [issueId], 'issueChanged', callback);
		}
	}

	function unsubscribeIssueChanged(account, model, issueId){
		if(arguments.length === 2){
			unsubscribe(account, model, [], 'issueChanged');
		} else {
			unsubscribe(account, model, [issueId], 'issueChanged');
		}
		
	}

	function subscribeModelStatusChanged(account, model, callback){
		subscribe(account, model, [], 'modelStatusChanged', callback);
	}

	function unsubscribeModelStatusChanged(account, model){
		unsubscribe(account, model, [], 'modelStatusChanged');
	}

	function subscribeNewModel(account, callback){
		subscribe(account, null, [], 'newModel', callback);
	}

	function unsubscribeNewModel(account, model){
		unsubscribe(account, null, [], 'newModel');
	}

	return {
		subscribe: {
			newIssues: subscribeNewIssues,
			newComment: subscribeNewComment,
			commentChanged: subscribeCommentChanged,
			commentDeleted: subscribeCommentDeleted,
			issueChanged: subscribeIssueChanged,
			modelStatusChanged: subscribeModelStatusChanged,
			newModel: subscribeNewModel

		},
		unsubscribe:{
			newIssues: unsubscribeNewIssues,
			newComment: unsubscribeNewComment,
			commentChanged: unsubscribeCommentChanged,
			commentDeleted: unsubscribeCommentDeleted,
			issueChanged: unsubscribeIssueChanged,
			modelStatusChanged: unsubscribeModelStatusChanged,
			newModel: unsubscribeNewModel
		}
	};
};


