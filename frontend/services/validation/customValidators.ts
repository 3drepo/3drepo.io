const loadPasswordLibrary = () => new Promise((resolve) => {
	if (!window.zxcvbn) {
		const ZXCVBN_SRC = '/dist/zxcvbn.js';
		const script = document.createElement('script');
		script.src = ZXCVBN_SRC;
		script.type = 'text/javascript';
		script.async = true;
		document.body.appendChild(script);
		script.onload = () => resolve(window.zxcvbn);
	} else {
		resolve(window.zxcvbn);
	}
});

export const getPasswordStrength = (password) => loadPasswordLibrary().then((zxcvbn: any) => zxcvbn(password).score);

export const differentThan = function(ref: any, message: any) {
	return this.test({
		name: 'differentThan',
		exclusive: false,
		// tslint:disable-next-line: no-invalid-template-strings
		message: message || '${path} must be the different than ${reference}',
		params: {
			reference: ref.path
		},
		test(value: any) {
			return value !== this.resolve(ref);
		}
	});
};

export const equalTo = function(ref: any, message: any) {
	return this.test({
		name: 'equalTo',
		exclusive: false,
		// tslint:disable-next-line: no-invalid-template-strings
		message: message || '${path} must be equal to ${reference}',
		params: {
			reference: ref.path
		},
		test(value: any) {
			return value === this.resolve(ref);
		}
	});
};

export const strength = function(requiredValue: any, message: any) {
	return this.test({
		name: 'strength',
		exclusive: false,
		// tslint:disable-next-line: no-invalid-template-strings
		message: message || '${path} is too weak',
		async test(value: any) {
			const result = await getPasswordStrength(value);
			return result > requiredValue;
		}
	});
};
