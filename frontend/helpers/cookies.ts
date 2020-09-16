export const setCookie = (key, value, numberOfDays = 30) => {
	const now = new Date();

	now.setTime(now.getTime() + numberOfDays * 60 * 60 * 24 * 1000);
	document.cookie = `${key}=${value}; expires=${now.toUTCString()}; path=/`;
};

export const getCookie = (key) => document.cookie.split('; ').reduce((total, currentCookie) => {
	const item = currentCookie.split('=');
	const storedKey = item[0];
	const storedValue = item[1];

	return key === storedKey ? decodeURIComponent(storedValue) : total;
}, '');
