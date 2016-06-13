/**
 *	Copyright (C) 2015 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/***************************************************************************
*  @file Contains functionality to dispatch work to the 
 *       queue via amqp protocol. A compute node with a worker must be running
 *       to fulfil the tasks in order for the work to be done.
****************************************************************************/

var amqp = require('amqplib');
var fs = require('fs.extra');
var uuid = require('node-uuid');

function ImportQueue() {}

/*******************************************************************************
 * Create a connection and a channel in ampq and init variables
 * @param {url} url - ampq connection string 
 * @param {options} options - defines sharedSpacePath, logger, callbackQName and workerQName
 *******************************************************************************/
ImportQueue.prototype.connect = function(url, options) {
    'use strict';

    if(this.conn){
        return Promise.resolve();
    }

    if(!options.sharedSpacePath){
        return Promise.reject({ message: 'Please define sharedSpacePath in options'});
    } else if(!options.logger){
        return Promise.reject({ message: 'Please define logger in options'});
    } else if(!options.callbackQName){
        return Promise.reject({ message: 'Please define callbackQName in options'});
    } else if(!options.workerQName){
        return Promise.reject({ message: 'Please define workerQName in options'});
    } 


    return amqp.connect(url).then( conn => {

        this.conn = conn;
        
        conn.on('close', () => {
            this.conn = null;
        });

        return conn.createChannel();

    }).then(channel => {

        this.channel = channel;
        this.sharedSpacePath = options.sharedSpacePath;
        this.logger = options.logger;
        this.callbackQName = options.callbackQName;
        this.workerQName = options.workerQName;
        this.deferedObjs = {};

        return this._consumeCallbackQueue();

    }).catch( err => {
        return Promise.reject(err);
    });
};

/*******************************************************************************
 * Dispatch work to queue to import a model via a file uploaded by User
 * @param {filePath} filePath - Path to uploaded file
 * @param {orgFileName} orgFileName - Original file name of the file
 * @param {databaseName} databaseName - name of database to commit to
 * @param {projectName} projectName - name of project to commit to
 * @param {userName} userName - name of user
 *******************************************************************************/
ImportQueue.prototype.importFile = function(filePath, orgFileName, databaseName, projectName, userName, copy){
    'use strict';

    let corID = uuid.v1();

    //console.log(filePath);
    //console.log(orgFileName);

    return this._moveFileToSharedSpace(corID, filePath, orgFileName, copy).then(newPath => {
    
        let msg = 'import ' + newPath + ' ' + databaseName + ' ' + projectName + ' ' + userName;
        return this._dispatchWork(corID, msg);
    
    }).then(() => {

        return new Promise((resolve, reject) => {


            this.deferedObjs[corID] = {
                resolve: () => resolve(corID),
                reject: errCode => reject({corID, errCode})
            };

        });

    });
};

/*******************************************************************************
 * Move a specified file to shared storage (area shared by queue workers)
 * move the file to shared storage space, put it in a corID/newFileName
 * note: using move(in fs.extra) instead of rename(in fs) as rename doesn't allow cross device
 * @param {corID} corID - Correlation ID
 * @param {orgFilePath} orgFilePath - Path to where the file is currently
 * @param {newFileName} newFileName - New file name to rename to
 *******************************************************************************/
ImportQueue.prototype._moveFileToSharedSpace = function(corID, orgFilePath, newFileName, copy) {
    'use strict';

    let newFileDir = this.sharedSpacePath + "/" + corID + "/";
    let filePath = newFileDir + newFileName;
    
    return new Promise((resolve, reject) => {
        fs.mkdir(newFileDir, function (err){
            if (err) {
                reject(err);
            } else {

                let move = copy ? fs.copy : fs.move;

                move(orgFilePath, filePath, function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(filePath);
                    }
                });
            }

        });
    });

};

/*******************************************************************************
 * Insert a job item in worker queue
 *
 * @param {corID} corID - Correlation ID
 * @param {msg} orgFilePath - Path to where the file is currently
 *******************************************************************************/
ImportQueue.prototype._dispatchWork = function(corID, msg){
    'use strict';

    let info;
    return this.channel.assertQueue(this.workerQName, { durable: true }).then( _info => {

        info = _info;
        
        return this.channel.sendToQueue(this.workerQName, 
            new Buffer(msg), 
            {
                correlationId: corID, 
                replyTo: this.callbackQName, 
                persistent: true 
            }
        );

    }).then( () => {

        this.logger.logInfo(
            'Sent work to queue: ' + msg.toString() + ' with corr id: ' + corID.toString() + ' reply queue: ' + this.callbackQName,
            {
                corID: corID.toString()
            }
        );


        if(info.consumerCount <= 0){
            this.logger.logError(
                `No consumer found in the queue`,
                {
                    corID: corID.toString()
                }
            );
        }

        return Promise.resolve(() => {});
    });

};

// ImportQueue.prototype.assertQueue = function(){
//     return this.channel.assertQueue(this.workerQName, { durable: true });
// }

/*******************************************************************************
 * Listen to callback queue, resolve promise when job done
 * Should be called once only, presumably in constructor
 *******************************************************************************/
ImportQueue.prototype._consumeCallbackQueue = function(){
    'use strict';

    let self = this;

    return this.channel.assertQueue(this.callbackQName, { durable: true }).then(() => {
        return this.channel.consume(this.callbackQName, function(rep) {
            self.logger.logInfo('Job request id ' + rep.properties.correlationId + ' returned with: ' + rep.content);
            

            let defer = self.deferedObjs[rep.properties.correlationId];

            let resErrorCode = parseInt(JSON.parse(rep.content).value);

            if(defer && resErrorCode === 0){
                defer.resolve();
            } else if (defer) {
                defer.reject(resErrorCode);
            } else {
                self.logger.logError('Job done but cannot find corresponding defer object with cor id ' + rep.properties.correlationId);
            }

            defer && delete self.deferedObjs[rep.properties.correlationId];
            
        }, { noAck: true });
    });
};

module.exports = new ImportQueue();
