export const invoiceDate = (input) => {
	const date: Date = new Date(input);
	let invoiceDateStr: string;

	invoiceDateStr =
		(date.getDate() < 10 ? "0" : "") +
		date.getDate() +
		"-" +
		(date.getMonth() + 1 < 10 ? "0" : "") +
		(date.getMonth() + 1) +
		"-" +
		date.getFullYear() +
		" " +
		(date.getHours() < 10 ? "0" : "") +
		date.getHours() +
		":" +
		(date.getMinutes() < 10 ? "0" : "") +
		date.getMinutes();

	return invoiceDateStr;
};

export const prettyDate = (input, showFullDateTime) => {
	const date: Date = new Date(input);
	const today: Date = new Date();
	const options: any = {};

	if (
		showFullDateTime ||
		(today.getFullYear() === date.getFullYear() &&
			today.getMonth() === date.getMonth() &&
			today.getDate() === date.getDate())
	) {
		options.hour = "numeric";
		options.minute = "numeric";

		if (showFullDateTime) {
			options.second = "numeric";
		} else {
			options.hour12 = true;
			options.weekday = "short";
		}
	} else {
		if (new Date().getFullYear() !== date.getFullYear()) {
			options.year = "numeric";
		}

		options.month = "short";
		options.day = "numeric";
	}

	return date
		.toLocaleDateString("en-GB", options)
		.replace(",", "")
		.replace("Mon ", "")
		.replace("Tue ", "")
		.replace("Wed ", "")
		.replace("Thu ", "")
		.replace("Fri ", "")
		.replace("Sat ", "")
		.replace("Sun ", "");
};
