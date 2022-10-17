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
import { FormNumberField } from '@controls/formNumberField/formNumberField.component';

export const NumberProperty = ({
	property: { name, readOnly, required },
	value,
}: { property: PropertyDefinition, value: any }) => (
	<FormNumberField label={name} name={name} defaultValue={value} disabled={readOnly} reuiqred={required} />
);
