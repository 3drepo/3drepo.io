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
/* eslint-disable max-len */

import { TextField } from '@mui/material';

const TicketProperty = ({ property, value }) => {
	switch (property.type) {
		case 'text':
			return <TextField label={property.name} value={value} />;
			break;
		default:
			return <>Unsupported property(for now) {JSON.stringify(value).substring(0, 80)}</>;
			break;
	}
};

export const TicketForm = ({ template, ticket }) => (
	<>
		{template.properties.map((property) => <TicketProperty property={property} value={ticket.properties[property.name]} />)}
	</>
);
