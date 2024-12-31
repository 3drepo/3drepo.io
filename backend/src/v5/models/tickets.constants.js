/**
 *  Copyright (C) 2022 3D Repo Ltd
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

const Tickets = {};

Tickets.TICKETS_RESOURCES_COL = 'tickets.resources';

Tickets.queryOperators = {
	EXISTS: 'ex',
	NOT_EXISTS: 'nex',
	EQUALS: 'eq',
	NOT_EQUALS: 'neq',
	CONTAINS: 'ss',
	NOT_CONTAINS: 'nss',
	RANGE: 'rng',
	NOT_IN_RANGE: 'nrng',
	GREATER_OR_EQUAL_TO: 'gte',
	LESSER_OR_EQUAL_TO: 'lte',
};

Tickets.defaultQueryProps = {
	TITLE: 'title',
	TICKET_CODE: 'ticketCode',
	TEMPLATE: 'template',
};

Tickets.defaultQueryOperators = [
	Tickets.queryOperators.EQUALS,
	Tickets.queryOperators.NOT_EQUALS,
	Tickets.queryOperators.CONTAINS,
	Tickets.queryOperators.NOT_CONTAINS,
];

module.exports = Tickets;
