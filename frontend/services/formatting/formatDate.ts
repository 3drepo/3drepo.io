import dayjs from 'dayjs';

export const SHORT_DATE_FORMAT = 'DD/MM/YYYY';
export const DATE_TIME_FORMAT = 'HH:mm DD MMM';
export const LONG_DATE_TIME_FORMAT = 'DD/MM/YYYY HH:mm';
export const LONG_DATE_TIME_FORMAT_NO_MINUTES = 'DD/MM/YYYY HH:00';
export const NAMED_MONTH_DATE_FORMAT = 'DD MMM YYYY';
export const NAMED_MONTH_DATETIME_FORMAT = 'DD MMM YYYY HH:mm';

export const invoiceDate = (input) => {
	const date: Date = new Date(input);
	let invoiceDateStr: string;

	invoiceDateStr =
		(date.getDate() < 10 ? '0' : '') +
		date.getDate() +
		'-' +
		(date.getMonth() + 1 < 10 ? '0' : '') +
		(date.getMonth() + 1) +
		'-' +
		date.getFullYear() +
		' ' +
		(date.getHours() < 10 ? '0' : '') +
		date.getHours() +
		':' +
		(date.getMinutes() < 10 ? '0' : '') +
		date.getMinutes();

	return invoiceDateStr;
};

export const prettyDate = (input, showFullDateTime) => {
	const date: Date = new Date(input);
	const today: Date = new Date();
	const options: any = {};

	if (showFullDateTime ||
		(today.getFullYear() === date.getFullYear() &&
			today.getMonth() === date.getMonth() &&
			today.getDate() === date.getDate())
	) {
		options.hour = 'numeric';
		options.minute = 'numeric';

		if (showFullDateTime) {
			options.second = 'numeric';
		} else {
			options.hour12 = true;
			options.weekday = 'short';
		}
	} else {
		if (new Date().getFullYear() !== date.getFullYear()) {
			options.year = 'numeric';
		}

		options.month = 'short';
		options.day = 'numeric';
	}

	return date
		.toLocaleDateString('en-GB', options)
		.replace(',', '')
		.replace('Mon ', '')
		.replace('Tue ', '')
		.replace('Wed ', '')
		.replace('Thu ', '')
		.replace('Fri ', '')
		.replace('Sat ', '')
		.replace('Sun ', '');
};

export const simpleDate = (input) => {
	const date: Date = new Date(input);
	return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatDate = (date, format) => dayjs(date).format(format);

export const formatShortDate = (date) => formatDate(date, SHORT_DATE_FORMAT);

export const formatShortDateTime = (date) => formatDate(date, LONG_DATE_TIME_FORMAT);

export const formatDateTime = (date) => formatDate(date, DATE_TIME_FORMAT);

export const formatNamedMonthDate = (date) => formatDate(date, NAMED_MONTH_DATE_FORMAT);
