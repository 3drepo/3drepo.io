/**
 *  Copyright (C) 2026 3D Repo Ltd
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

import * as Yup from 'yup';
import { trimmedString } from '../shared/validators';
import { formatMessage } from '@/v5/services/intl';

export const ViewItemSchema = Yup.object().shape({
	name: trimmedString
		.required(
			formatMessage({
				id: 'validation.viewItem.name.error.required',
				defaultMessage: 'Name is a required field',
			}),
		)
		.max(37, formatMessage({
			id: 'validation.viewItem.name.error.max',
			defaultMessage: 'Name must be at most 37 characters',
		})),
});
