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
import { FormNumberField } from '@controls/formNumberField/formNumberField.component';
import { FlexContainer } from './coordsProperty.styles';
import { PropertyProps } from './properties.types';

export const CoordsProperty = ({
	property: { readOnly, required },
	formError,
	defaultValue,
	name,
	...props
}: PropertyProps) => {
	const [x, y, z] = defaultValue || [];

	return (
		<FlexContainer>
			<FormNumberField name={`${name}[0]`} label="x" defaultValue={x} disabled={readOnly} required={required} formError={formError?.[0]} {...props} />
			<FormNumberField name={`${name}[1]`} label="y" defaultValue={y} disabled={readOnly} required={required} formError={formError?.[1]} {...props} />
			<FormNumberField name={`${name}[2]`} label="z" defaultValue={z} disabled={readOnly} required={required} formError={formError?.[2]} {...props} />
		</FlexContainer>
	);
};
