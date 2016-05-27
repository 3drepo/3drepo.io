/**
 *  Copyright (C) 2014 3D Repo Ltd
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

var html = data => `
	Hi there,<br>
	<br>
	Your payment of ${data.amount} is failed. Please make sure you have enough credits in your PayPal account.
	<br><br> PayPal reattempts to collect recurring payments three days after the day on which recurring payments fail. 
	If the first reattempt to collect a recurring payment fails, PayPal waits 5 days to reattempt a second time. 
	If the second reattempt fails, PayPal cancels the subscription.
`;

var subject = 'Your payment to 3D Repo is failed';

module.exports =  {
	html: html,
	subject: subject
};
