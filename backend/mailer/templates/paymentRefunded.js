/**
 *  Copyright (C) 2020 3D Repo Ltd
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
"use strict";

const {  basicEmailTemplate } = require("./basicEmailTemplate");

const html = ({amount}) => basicEmailTemplate(`
	We have just refunded <b>${amount}</b> to you through PayPal.
	<br><br>
	If you have any questions please do not hesitate to contact us.
<br>`);

const subject = "We have refunded your payment to 3D Repo";

module.exports =  {
	html: html,
	subject: subject
};
