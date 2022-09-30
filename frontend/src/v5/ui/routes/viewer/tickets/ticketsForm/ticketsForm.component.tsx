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

import { DateTimePicker } from '@mui/lab';
import { InputLabel, MenuItem, Select, TextField } from '@mui/material';

const TicketProperty = ({ property, value }) => {
	const maskValue = (val) => (!val ? '' : new Date(val));

	switch (property.type) {
		case 'text':
			return (
				<div>
				&nbsp;
					<TextField label={property.name} value={value} disabled={property.readOnly} />
				</div>
			);
			break;
		case 'date':
			return (
				<div>
				&nbsp;
					<DateTimePicker
						label={property.name}
						inputFormat="MM/DD/YYYY"
						value={maskValue(value)}
						onChange={() => { }}
						renderInput={(params) => <TextField {...params} value={maskValue(value)} disabled={property.readOnly} />}
					/>
				</div>
			);
			break;
		case 'oneOf':
			return (
				<div>
				&nbsp;
					{property.name}
					<br />
					<Select value={value}>
						{property.values.map((propValue) => (
							<MenuItem key={propValue} value={propValue}>
								{propValue}
							</MenuItem>
						))}
					</Select>
				</div>
			);
			break;
		default:
			return <div>Unsupported property {`${property.name}:${property.type}`} (for now) {(`${JSON.stringify(value)}`).substring(0, 80)}</div>;
			break;
	}
};

export const TicketForm = ({ template, ticket }) => (
	<>
		{(template?.properties || []).map((property) => <TicketProperty property={property} value={ticket.properties[property.name]} />)}
	</>
);
