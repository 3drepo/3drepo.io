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

var gsocket;

angular.module('3drepo')
.service('NotificationService', function() {
	"use strict";

	var socket = io('http://example.org:3000', {path: '/yay'});
	gsocket = socket;
	var joined = [];

	socket.on('reconnect', function(){
		console.log('Rejoining all rooms on reconnect');

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
		
		var room =  account + '::' + project;
		if(joined.indexOf(room) === -1){

			socket.emit('join', {account: account, project: project});
			joined.push(room);
		}
	}

	function getEventName(account, project, keys, event){

		keys = keys || [];
		var keyString = '';
		
		if(keys.length){
			keyString =  '::' + keys.join('::');
		}

		return account + '::' + project +  keyString + '::' + event;
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

	function subscribeNewIssue(account, project, callback){
		subscribe(account, project, [], 'newIssue', callback);
	}

	function unsubscribeNewIssue(account, project){
		unsubscribe(account, project, [], 'newIssue');
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
	return {
		subscribe: {
			newIssue: subscribeNewIssue,
			newComment: subscribeNewComment,
			commentChanged: subscribeCommentChanged,
			commentDeleted: subscribeCommentDeleted,
			issueChanged: subscribeIssueChanged,
			projectStatusChanged: subscribeProjectStatusChanged,

		},
		unsubscribe:{
			newIssue: unsubscribeNewIssue,
			newComment: unsubscribeNewComment,
			commentChanged: unsubscribeCommentChanged,
			commentDeleted: unsubscribeCommentDeleted,
			issueChanged: unsubscribeIssueChanged,
			projectStatusChanged: unsubscribeProjectStatusChanged,
		}
	};
});


