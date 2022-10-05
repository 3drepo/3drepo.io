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

import { PropertyDefinition } from '@/v5/store/tickets/tickets.types';
import { DateTimePicker } from '@mui/lab';
import { TextField } from '@mui/material';

export const DateProperty = ({ property, value }: {property: PropertyDefinition, value:any}) => {
	const maskValue = (val) => (!val ? '' : new Date(val));
	return (
		<div>
    &nbsp;
			<DateTimePicker
				label={property.name}
				inputFormat="MM/DD/YYYY"
				value={maskValue(value)}
				onChange={() => { }}
				renderInput={({ error, ...params }) => (
					<TextField
						{...params}
						value={maskValue(value)}
						disabled={property.readOnly}
					/>
				)}
			/>
		</div>
	);
};
