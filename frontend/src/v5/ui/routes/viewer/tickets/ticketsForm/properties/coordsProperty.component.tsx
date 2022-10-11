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
import { TextField } from '@mui/material';

export const CoordsProperty = ({ property, value }: {property: PropertyDefinition, value:any}) => {
	const coordsVal = value || [];

	return (
		<div>
        &nbsp;
			{property.name}
			<br />
			x: <TextField name={property.name} value={coordsVal[0]} disabled={property.readOnly} />
			y: <TextField name={property.name} value={coordsVal[1]} disabled={property.readOnly} />
			z: <TextField name={property.name} value={coordsVal[2]} disabled={property.readOnly} />
		</div>
	);
};
