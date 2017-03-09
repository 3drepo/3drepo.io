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

	var socket = io(serverConfig.chatHost, {path: serverConfig.chatPath, transports: ['websocket']});
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
			var project = room[1];

			joinRoom(account, project);
		});
	});

	function joinRoom(account, project){
		
		var projectNameSpace = '';
		
		if(project){
			projectNameSpace = '::' + project;
		}

		var room =  account + projectNameSpace;
		if(joined.indexOf(room) === -1){

			socket.emit('join', {account: account, project: project});
			joined.push(room);
		}
	}

	function getEventName(account, project, keys, event){

		var projectNameSpace = '';
		
		if(project){
			projectNameSpace = '::' + project;
		}
		
		keys = keys || [];
		var keyString = '';
		
		if(keys.length){
			keyString =  '::' + keys.join('::');
		}

		return account + projectNameSpace +  keyString + '::' + event;
	}

	function subscribe(account, project, keys, event, callback){

		joinRoom(account, project);
		console.log('sub', getEventName(account, project, keys, event));
		socket.on(getEventName(account, project, keys, event), function(data){
			console.log('msg rec', getEventName(account, project, keys, event));
			callback(data);
		});
	}

	function unsubscribe(account, project, keys, event){
		console.log('unsub', getEventName(account, project, keys, event));
		socket.off(getEventName(account, project, keys, event));
	}

	function subscribeNewIssues(account, project, callback){
		subscribe(account, project, [], 'newIssues', callback);
	}

	function unsubscribeNewIssues(account, project){
		unsubscribe(account, project, [], 'newIssues');
	}

	function subscribeNewComment(account, project, issueId, callback){
		subscribe(account, project, [issueId], 'newComment', callback);
	}

	function unsubscribeNewComment(account, project, issueId){
		unsubscribe(account, project, [issueId], 'newComment');
	}

	function subscribeCommentChanged(account, project, issueId, callback){
		subscribe(account, project, [issueId], 'commentChanged', callback);
	}

	function unsubscribeCommentChanged(account, project, issueId){
		unsubscribe(account, project, [issueId], 'commentChanged');
	}

	function subscribeCommentDeleted(account, project, issueId, callback){
		subscribe(account, project, [issueId], 'commentDeleted', callback);
	}

	function unsubscribeCommentDeleted(account, project, issueId){
		unsubscribe(account, project, [issueId], 'commentDeleted');
	}

	function subscribeIssueChanged(account, project, issueId, callback){
		if(arguments.length === 3){
			callback = issueId;
			subscribe(account, project, [], 'issueChanged', callback);
		} else {
			subscribe(account, project, [issueId], 'issueChanged', callback);
		}
	}

	function unsubscribeIssueChanged(account, project, issueId){
		if(arguments.length === 2){
			unsubscribe(account, project, [], 'issueChanged');
		} else {
			unsubscribe(account, project, [issueId], 'issueChanged');
		}
		
	}

	function subscribeProjectStatusChanged(account, project, callback){
		subscribe(account, project, [], 'projectStatusChanged', callback);
	}

	function unsubscribeProjectStatusChanged(account, project){
		unsubscribe(account, project, [], 'projectStatusChanged');
	}

	function subscribeNewProject(account, callback){
		subscribe(account, null, [], 'newProject', callback);
	}

	function unsubscribeNewProject(account, project){
		unsubscribe(account, null, [], 'newProject');
	}

	return {
		subscribe: {
			newIssues: subscribeNewIssues,
			newComment: subscribeNewComment,
			commentChanged: subscribeCommentChanged,
			commentDeleted: subscribeCommentDeleted,
			issueChanged: subscribeIssueChanged,
			projectStatusChanged: subscribeProjectStatusChanged,
			newProject: subscribeNewProject

		},
		unsubscribe:{
			newIssues: unsubscribeNewIssues,
			newComment: unsubscribeNewComment,
			commentChanged: unsubscribeCommentChanged,
			commentDeleted: unsubscribeCommentDeleted,
			issueChanged: unsubscribeIssueChanged,
			projectStatusChanged: unsubscribeProjectStatusChanged,
			newProject: unsubscribeNewProject
		}
	};
};


