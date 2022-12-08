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
import { CoordsProperty } from './coordsProperty.component';
import { DateProperty } from './dateProperty.component';
import { ImageProperty } from './imageProperty.component';
import { LongTextProperty } from './longTextProperty.component';
import { ManyOfProperty } from './manyOfProperty.component';
import { NumberProperty } from './numberProperty.component';
import { OneOfProperty } from './oneOfProperty.component';
import { TextProperty } from './textProperty.component';
import { BooleanProperty } from './booleanProperty.component';
import { ViewProperty } from './viewProperty.component';

export const TicketProperty = {
	text: TextProperty,
	longText: LongTextProperty,
	date: DateProperty,
	oneOf: OneOfProperty,
	manyOf: ManyOfProperty,
	boolean: BooleanProperty,
	coords: CoordsProperty,
	number: NumberProperty,
	image: ImageProperty,
	view: ViewProperty,
};
