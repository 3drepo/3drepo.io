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

import { messagesEs } from '@/locales/messagesEs';
import { createIntl, createIntlCache, IntlShape } from 'react-intl';

let intlInternal:IntlShape = null;

const DEFAULT_LOCALE = 'en';

export const initializeIntl = (locale: string) => {
	let messages = {};

	switch (locale.toLocaleLowerCase().split('-')[0]) {
		case 'es':
			messages = messagesEs;
			break;
		default:
			messages = {};
	}

	const cache = createIntlCache();

	// Create the `intl` object
	intlInternal = createIntl(
		{
			// Locale of the application
			locale,
			// Locale of the fallback defaultMessage
			defaultLocale: DEFAULT_LOCALE,
			messages,
		},
		cache,
	);
};

const getIntl = () => {
	if (!intlInternal) {
		initializeIntl(DEFAULT_LOCALE);
	}

	return intlInternal;
};

// eslint-disable-next-line max-len
export const formatMessage: typeof intlInternal.formatMessage = (descriptor, values?, opts?): string => getIntl().formatMessage(descriptor, values, opts);

// eslint-disable-next-line max-len
export const formatDate: typeof intlInternal.formatDate = (value, opts?): string => getIntl().formatDate(value, opts);

// eslint-disable-next-line max-len
export const formatPlural: typeof intlInternal.formatPlural = (value, opts?): string => getIntl().formatPlural(value, opts);

export const getIntlProviderProps = () => ({
	messages: getIntl().messages,
	defaultLocal: getIntl().defaultLocale,
	locale: getIntl().locale,
});
