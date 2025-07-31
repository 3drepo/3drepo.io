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

const DEFAULT_LOCALE = 'en-GB';

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
			onError: (error) => {
				if (error.code === 'MISSING_TRANSLATION') {
					return;
				}
		
				console.error(error);
			},
		},
		cache,
	);
};

export const getIntl = () => {
	if (!intlInternal) {
		initializeIntl(DEFAULT_LOCALE);
	}

	return intlInternal;
};

export const formatMessage = (descriptor, values?, opts?): string => getIntl().formatMessage(descriptor, values, opts);

export const formatDate: typeof intlInternal.formatDate = (value, opts?): string => value && getIntl().formatDate(value, opts);

export const formatTime: typeof intlInternal.formatTime = (value, opts?): string => value && getIntl().formatTime(value, opts);

export const formatRelativeTime: typeof intlInternal.formatRelativeTime = (value, unit?, opts?): string => getIntl().formatRelativeTime(value, unit, opts);

export const formatPlural: typeof intlInternal.formatPlural = (value, opts?): Intl.LDMLPluralRule => getIntl().formatPlural(value, opts);
