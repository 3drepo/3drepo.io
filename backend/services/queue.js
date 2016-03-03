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
 *       queue via amqp protocol. The queue configuration has to be specified
 *       in config.js and a compute node with a worker must be running
 *       to fulfil the tasks in order for the work to be done.
****************************************************************************/

var amqp = require('amqplib/callback_api');
var fs = require('fs.extra');
var uuid = require('node-uuid');
var responseCodes = require('../response_codes.js');
var config = require('../config.js');
var log_iface = require('../logger.js');
var logger = log_iface.logger;

/*******************************************************************************
 * Converts error code from repobouncerclient to a response error object
 * @param {errCode} - error code referenced in error_codes.h
 *******************************************************************************/
function convertToErrorCode(errCode){
    logger.log("debug", "convert To response code: " + errCode);
    var errObj;
    switch (errCode) {
        case 0:
            errObj = responseCodes.OK;
            break;
        case 1:
            errObj = responseCodes.FILE_IMPORT_INVALID_ARGS;
            break;
        case 2:
            errObj = responseCodes.NOT_AUTHORIZED;
            break;
        case 3:
            errObj = responseCodes.FILE_IMPORT_UNKNOWN_CMD;
            break;
        case 5:
            errObj = responseCodes.FILE_IMPORT_PROCESS_ERR;
            break;
        default:
            errObj = responseCodes.FILE_IMPORT_UNKNOWN_ERR;
            break;

    }
    return errObj;
}

/*******************************************************************************
 * Move a specified file to shared storage (area shared by queue workers)
 * move the file to shared storage space defined in config.js, put it in a corID/newFileName
 * note: using move(in fs.extra) instead of rename(in fs) as rename doesn't allow cross device
 * @param {corID} corID - Correlation ID
 * @param {orgFilePath} orgFilePath - Path to where the file is currently
 * @param {newFileName} newFileName - New file name to rename to
 * @param {callback} callback - callback(err)
 *******************************************************************************/
function dispatchWork(corID, msg, callback){
    amqp.connect(config.cn_queue.host, function (err, conn) {
        if (err === null) {
            logger.log('debug', 'established connection to ' + config.cn_queue.host);
        }
        else {
            callback(responseCodes.QUEUE_CONN_ERR);
            return;
        }
        conn.createChannel(function (err, ch) {
            if (err === null) {
                logger.log('debug', 'created channel in' + config.cn_queue.host);
            }
            else {
                logger.log('error' , 'Failed to create a channel to ' + config.cn_queue.host);
                callback(responseCodes.QUEUE_CONN_ERR);
                return;
            }
                    
            //initiate callback queue
            ch.assertQueue(config.cn_queue.callback_queue, { durable: true }, function (err) {
                if (err) {
                    callback(responseCodes.QUEUE_CONN_ERR);
                    return;
                }
                ch.consume(config.cn_queue.callback_queue, function (rep) {
                    //consume callback
                    if (this.corID === rep.properties.correlationId) {
                        logger.log('info', 'Upload request id ' + this.corID + ' returned: ' + rep.content);
                        callback(convertToErrorCode(parseInt(JSON.parse(rep.content).value)));
                    }
                    else {
                        logger.log('info', '[UNMATCHED]Upload request id ' + this.corID + 'returned: ' + rep.properties.correlationId);
                    }
                }, { noAck: true });
                
                this.corID = corID;
                //Send request to queue
                ch.sendToQueue(config.cn_queue.worker_queue, new Buffer(msg), { correlationId: corID, replyTo: config.cn_queue.callback_queue, persistent: true });
                logger.log('info', 'Sent work to queue: ' + msg.toString() + ' with corr id: ' + corID.toString() + ' reply queue: ' + config.cn_queue.callback_queue);

            });
		

        });
    });

}

/*******************************************************************************
 * Move a specified file to shared storage (area shared by queue workers)
 * move the file to shared storage space defined in config.js, put it in a corID/newFileName
 * note: using move(in fs.extra) instead of rename(in fs) as rename doesn't allow cross device
 * @param {corID} corID - Correlation ID
 * @param {orgFilePath} orgFilePath - Path to where the file is currently
 * @param {newFileName} newFileName - New file name to rename to
 * @param {callback} callback - callback(err)
 *******************************************************************************/
function moveFileToSharedSpace(corID, orgFilePath, newFileName, callback) {
    var newFileDir = config.cn_queue.shared_storage + "/" + corID + "/";
    var filePath = newFileDir + newFileName;
    
    fs.mkdir(newFileDir, function (err) {
        if (err) {
            callback(responseCodes.QUEUE_INTERNAL_ERR, filePath);
        }
        else {
            fs.move(orgFilePath, filePath, function (err) {
                if (err) {
                    callback(responseCodes.QUEUE_INTERNAL_ERR, filePath);
                } else {
                    callback(err, filePath);
                }
            });
        }

    });
}

/*******************************************************************************
 * Dispatch work to queue to import a model via a file uploaded by User
 * @param {filePath} filePath - Path to uploaded file
 * @param {orgFileName} orgFileName - Original file name of the file
 * @param {databaseName} databaseName - name of database to commit to
 * @param {projectName} projectName - name of project to commit to
 * @param {userName} userName - name of user
 * @param {callback} callback - callback(status)
 *******************************************************************************/
exports.importFile = function (filePath, orgFileName, databaseName, projectName, userName, callback) {
    //structure is import file database project [owner] [config]
    var corID = uuid.v1();
    
    moveFileToSharedSpace(corID, filePath, orgFileName, function (err, newPath) {
        if (err) {
            callback(responseCodes.QUEUE_INTERNAL_ERR);
        } else {
            var msg = 'import ' + newPath + ' ' + databaseName + ' ' + projectName + ' ' + userName;
            dispatchWork(corID, msg, function (err) {
                if (callback) { callback(err); }
            });
        }

    });
};

