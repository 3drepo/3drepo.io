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
.service('NotificationService', function() {
	"use strict";

	var socket = io('http://example.org:3000', {path: '/yay'});
	var joined = [];

	function joinRoom(account, project){
		
		var room =  account + '::' + project;
		if(joined.indexOf(room) === -1){
			console.log('join room');
			socket.emit('join', {account: account, project: project});
			joined.push(room);
		}
	}

	function subscribeNewIssue(account, project, callback){
	
		joinRoom(account, project);
		socket.on(account + '::' + project + '::newIssue', function(issue){
			callback(issue);
		});
	}

	function unsubscribeNewIssue(account, project){
		socket.off(account + '::' + project + '::newIssue');
	}


	function subscribeNewComment(account, project, issueId, callback){
	
		console.log('new comment sub', account, project, issueId)
		joinRoom(account, project);
		socket.on(account + '::' + project + '::' + issueId + '::newComment', function(issue){
			callback(issue);
		});
	}

	function unsubscribeNewComment(account, project, issueId, callback){
		socket.off(account + '::' + project + '::' + issueId + '::newComment');
	}

	return {
		subscribe: {
			newIssue: subscribeNewIssue,
			newComment: subscribeNewComment
		},
		unsubscribe:{
			newIssue: unsubscribeNewIssue,
			newComment: unsubscribeNewComment
		}
	}
});


