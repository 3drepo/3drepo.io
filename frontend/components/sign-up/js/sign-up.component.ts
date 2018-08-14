/**
 *	Copyright (C) 2016 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
declare const grecaptcha;
declare let zxcvbn;
class SignupController implements ng.IController {

	public static $inject: string[] = [
		"$scope",
		"$mdDialog",
		"$location",
		"$window",

		"ClientConfigService",
		"APIService",
		"AuthService",
		"PasswordService"
	];

	private reCaptchaResponse;

	private enterKey;
	private agreeToText;
	private haveReadText;

	private buttonLabel;
	private newUser;
	private version;
	private logo;
	private captchaKey;
	private passwordStrength;
	private passwordResult;

	private mailListAgreed;
	private tcAgreed;
	private useReCAPTCHA;
	private registering;
	private showLegalText;
	private countries;
	private legalText;
	private legalTitle;
	private allowedPhone;
	private registerErrorMessage: string;
	private registerPasswordMessage: string;
	private registerConfirmEmailMessage: string;

	constructor(
		private $scope,
		private $mdDialog,
		private $location,
		private $window,

		private ClientConfigService,
		private APIService,
		private AuthService,
		private PasswordService
	) {

	}

	public $onInit() {

		this.allowedPhone = new RegExp(/^[0-9 ()+-]+$/);

		this.PasswordService.addPasswordStrengthLib();

		this.AuthService.sendLoginRequest().then((response) => {
			if (response.data.username) {
				this.goToLoginPage();
			}
		}).catch((response) => {
			console.debug("User is not logged in");
		});

		this.enterKey = 13;
		this.agreeToText = "",
		this.haveReadText = "";

		this.buttonLabel = "Sign Up!";
		this.newUser = {
			username: "", email: "", confirmEmail: "",
			company: "", confirmPassword: "", password: "", mailListAgreed: true, tcAgreed: false
		};
		this.version = this.ClientConfigService.VERSION;
		this.logo = "/images/3drepo-logo-white.png";
		this.captchaKey = this.ClientConfigService.captcha_client_key;

		this.mailListAgreed = this.newUser.mailListAgreed;
		this.tcAgreed = this.newUser.tcAgreed;
		this.useReCAPTCHA = false;
		this.registering = false;
		this.showLegalText = false;
		this.countries = this.ClientConfigService.countries.concat();
		let gbIndex;

		this.countries.find((country, i) => {
			if (country.code === "GB") {
				gbIndex = i;
			}
		});

		this.countries.unshift(this.countries.splice(gbIndex, 1)[0]);

		/*
		* Recapcha
		*/

		const reCaptchaExists = this.ClientConfigService.auth.hasOwnProperty("captcha") &&
			(this.ClientConfigService.auth.captcha);

		if (reCaptchaExists) {
			if (this.ClientConfigService.captcha_client_key) {
				this.captchaKey = this.ClientConfigService.captcha_client_key;
				this.useReCAPTCHA = true;
			} else {
				console.debug("Captcha key is not set in config");
			}

		} else {
			console.debug("Captcha is not set in config");
		}

		// Legal text
		if (this.isDefined(this.ClientConfigService.legal)) {
			this.showLegalText = true;
			this.legalText = "";
			for (const legalItem in this.ClientConfigService.legal) {
				if (this.ClientConfigService.legal[legalItem]) {
					this.handleLegalItem(legalItem);
				}
			}

			this.legalText = this.agreeToText;
			if (this.legalText !== "") {
				this.legalText += " and ";
			}
			this.legalText += this.haveReadText;
			if (this.legalText !== "") {
				this.legalText += ".";
			}
		}
		this.watchers();

	}

	public isDefined(variable) {
		return variable !== undefined && variable !== null;
	}

	public watchers() {
		/**
		* Watch changes to register fields to clear warning message
		*/

		this.$scope.$watch("vm.newUser", (newValue) => {
			if (this.isDefined(newValue)) {
				this.registerErrorMessage = "";
			}
			if (this.newUser.password !== undefined && this.PasswordService.passwordLibraryAvailable()) {
				const result = this.PasswordService.evaluatePassword(this.newUser.password);
				this.passwordResult = result;
				this.passwordStrength = this.PasswordService.getPasswordStrength(this.newUser.password, result.score);
				this.$scope.signup.password.$setValidity("required", result.score > 2);
			}
		}, true);

		this.$scope.$watch("AuthService.isLoggedIn()", (newValue) => {
			// TODO: this is a hack
			if (newValue === true) {
				this.goToLoginPage();
			}
		});
	}

	/**
	 * Take two user input values and check for duplicate values
	 */

	public checkDuplicateValues(isPasswordField) {
		if (isPasswordField) {
			const passwordValid = this.newUser.password === this.newUser.confirmPassword;
			this.$scope.signup.confirmPassword.$setValidity("invalid", passwordValid);
			this.registerPasswordMessage = passwordValid ? "" : "(Password mismatched)";
		} else {
			// The only other thing to check is email
			const emailValid = this.newUser.email === this.newUser.confirmEmail;
			this.$scope.signup.confirmEmail.$setValidity("invalid", emailValid);
			this.registerConfirmEmailMessage = emailValid ? "" : "(Email mismatched)";
		}
	}

	public handleLegalItem(legalItem) {

		if (this.ClientConfigService.legal.hasOwnProperty(legalItem)) {

			const legal = this.ClientConfigService.legal[legalItem];
			const legalText = this.getLegalText(legal);

			if (legal.type === "agreeTo") {
				if (this.agreeToText === "") {
					this.agreeToText = "I agree to the " + legalText;
				} else {
					this.agreeToText += " and the " + legalText;
				}
			} else if (legal.type === "haveRead") {
				if (this.haveReadText === "") {
					this.haveReadText = "I have read the " + legalText + " policy";
				} else {
					this.haveReadText += " and the " + legalText + " policy";
				}
			}
		}

	}

	public goToLoginPage() {
		this.$window.location.href = "/";
	}

	public register(event: any) {
		if (this.isDefined(event)) {
			if (event.which === this.enterKey) {
				this.doRegister();
			}
		} else {
			this.doRegister();
		}
	}

	public showPage() {
		this.$location.path("/registerRequest");
	}

	/**
	 * Close the dialog
	 */
	public closeDialog() {
		this.$mdDialog.cancel();
	}

	/**
	 * Close the dialog by not clicking the close button
	 */
	public removeDialog() {
		this.closeDialog();
	}

	public getPasswordLabel() {
		if (this.newUser.password && this.passwordStrength) {
			return "(" + this.passwordStrength + ")";
		}
		return "";
	}

	/**
	 * Do the user registration
	 */
	public doRegister() {
		let allowRegister = true;
		const formatRegex = this.ClientConfigService.usernameRegExp;
		const allowedFormat = new RegExp(formatRegex); // English letters, numbers, underscore, not starting with number

		if (
			(!this.isDefined(this.newUser.username)) ||
			(!this.isDefined(this.newUser.email)) ||
			(!this.isDefined(this.newUser.confirmEmail)) ||
			(!this.isDefined(this.newUser.password)) ||
			(!this.isDefined(this.newUser.confirmPassword)) ||
			(!this.isDefined(this.newUser.firstName)) ||
			(!this.isDefined(this.newUser.lastName)) ||
			(!this.isDefined(this.newUser.country))
		) {

			const emailInvalid = this.$scope.signup.$error.email;
			if (emailInvalid) {
				this.registerErrorMessage = "Email is invalid";
			} else {
				this.registerErrorMessage = "Please fill all required fields";
			}
			return;
		}

		if (!allowedFormat.test(this.newUser.username)) {
			this.registerErrorMessage = `Username not allowed: Max length 64 characters. Can contain upper and lowercase letters,
				numbers, underscore allowed only, and must not start with number`;
			return;
		}

		if (!this.newUser.password || this.newUser.password.length < 8) {
			this.registerErrorMessage = "Password must be at least 8 characters long";
			return;
		}

		if (this.passwordResult && this.passwordResult.score < 2) {
			this.registerErrorMessage = "Password is too weak; " + this.passwordResult.feedback.suggestions.join(" ");
			return;
		}

		if (this.showLegalText) {
			allowRegister = this.newUser.tcAgreed;
		}

		if (allowRegister) {
			this.sendRegistration();
		} else {
			this.registerErrorMessage = "You must agree to the terms and conditions";
		}

	}

	public sendRegistration() {
		const data = {
			captcha: undefined,
			company: this.newUser.company,
			countryCode: this.newUser.country,
			email: this.newUser.email,
			firstName: this.newUser.firstName,
			lastName: this.newUser.lastName,
			password: this.newUser.password,
			mailListAgreed: this.newUser.mailListAgreed
		};

		if (this.useReCAPTCHA) {
			data.captcha = this.reCaptchaResponse;
		}
		this.registering = true;
		this.APIService.post(this.newUser.username, data)
			.then((response) => {
				if (response.status === 200) {
					this.showPage();
				} else {
					this.registerErrorMessage = this.APIService.getErrorMessage(response.data);
				}
				this.registering = false;
				if (this.useReCAPTCHA) {
					grecaptcha.reset(); // reset reCaptcha
				}
			})
			.catch((response) => {
				console.error(response);
				this.registering = false;
				this.registerErrorMessage = response.data.message;
				if (this.useReCAPTCHA) {
					grecaptcha.reset(); // reset reCaptcha
				}
			});
	}

	public getLegalText(legalItem) {
		return `<a target='_blank' href='/${legalItem.page}'>${legalItem.title}</a>`;
	}
}

export const SignupComponent: ng.IComponentOptions = {
	bindings: {},
	controller: SignupController,
	controllerAs: "vm",
	templateUrl: "templates/sign-up.html"
};

export const SignupComponentModule = angular
	.module("3drepo")
	.component("signUp", SignupComponent);
