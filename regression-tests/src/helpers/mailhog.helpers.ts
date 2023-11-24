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

import { WebDriver } from 'selenium-webdriver';
import { get } from './api.helpers';
import  * as quotedPrintable from 'quoted-printable';
import { reTry } from './functions.helpers';

const apiUrl = 'http://localhost:8025/api/v2'; 
const getApiUrl = (url: string): string => encodeURI(apiUrl + url);

interface MailItemAddress { 
	Relays: string[];
	Mailbox: string;
	Domain: string;
	Params: string;
}


interface MailItem {
	ID:string;
	From: MailItemAddress;
	To: MailItemAddress[];
	Content: {
		Headers: Record<string, string[]>;
		Body: string;
	}
	Created: string;
	Body: string;
}


interface Messages {
	total: number;
	count: number;
	start: number;
	items: MailItem[];
}

export const getMessages = async (driver:WebDriver): Promise<Messages> => {
	const response = await get(driver, getApiUrl('/messages'));
	return response.json;
} ;

const fetchEmail = async (driver:WebDriver, email:string) => {
	const messages = await getMessages(driver);
	const mailItem = messages.items.find((item) => item.To.some((t) => t.Mailbox + '@' + t.Domain === email));
	
	if (mailItem) {
		return quotedPrintable.decode(mailItem.Content.Body);
	}
	return null;
};


export const readLatestMailFor = async (driver:WebDriver, email:string) => {
	const mailContent = await reTry(async () => {
		const mail = await fetchEmail(driver, email);

		if (!mail) {
			throw new Error('Mail not received');
		}

		return mail;
	}, 100, 100);

	await driver.executeScript('document.write(`' + mailContent + '`)');
};

// export const clearEmails = async (driver: WebDriver) => {

// };