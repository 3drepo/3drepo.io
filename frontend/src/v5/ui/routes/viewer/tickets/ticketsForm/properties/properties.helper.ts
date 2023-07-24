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
import { TextField } from '@controls/inputs/textField/textField.component';
import { TextAreaFixedSize } from '@controls/inputs/textArea/textAreaFixedSize.component';
import { DatePicker } from '@controls/inputs/datePicker/datePicker.component';
import { Toggle } from '@controls/inputs/toggle/toggle.component';
import { NumberField } from '@controls/inputs/numberField/numberField.component';
import { PinDetails } from '@components/viewer/cards/tickets/pinDetails/pinDetails.component';
import { ManyOfProperty } from './manyOfProperty.component';
import { OneOfProperty } from './oneOfProperty.component';
import { TicketImage } from './ticketImageContent/ticketImage/ticketImage.component';
import { TicketView } from './ticketView/ticketView.component';

export const TicketProperty = {
	text: TextField,
	longText: TextAreaFixedSize,
	date: DatePicker,
	oneOf: OneOfProperty,
	manyOf: ManyOfProperty,
	boolean: Toggle,
	coords: PinDetails,
	number: NumberField,
	image: TicketImage,
	view: TicketView,
};
