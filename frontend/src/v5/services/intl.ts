/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import { createIntl, createIntlCache, IntlShape } from 'react-intl';

let intlInternal:IntlShape = null;

export const initializeIntl = () => {
	const messages = {
		another: [
			{
				type: 0,
				value: 'compiled: bites the dust',
			},
		],
		myMessage: [
			{
				type: 0,
				value: 'another compiled: My other message',
			},
		],
		'projects.fetchErrorLocation': [
			{
				type: 0,
				value: 'a compiled error message',
			},
		],
	};

	const cache = createIntlCache();

	// Create the `intl` object
	intlInternal = createIntl(
		{
			// Locale of the application
			locale: 'en',
			// Locale of the fallback defaultMessage
			defaultLocale: 'en',
			messages,
		},
		cache,
	);
};

// eslint-disable-next-line max-len
export const formatMessage: typeof intlInternal.formatMessage = (descriptor, values?, opts?): string => intlInternal.formatMessage(descriptor, values, opts);

// eslint-disable-next-line max-len
export const formatDate: typeof intlInternal.formatDate = (value, opts?): string => intlInternal.formatDate(value, opts);

// eslint-disable-next-line max-len
export const formatPlural: typeof intlInternal.formatPlural = (value, opts?): string => intlInternal.formatPlural(value, opts);
