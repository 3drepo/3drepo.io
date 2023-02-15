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

import { FormattedMessage } from 'react-intl';
import { useEffect, useRef, useState } from 'react';
import { useForm, SubmitHandler, useFormContext } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { UserSignupSchemaTermsAndSubmit } from '@/v5/validation/userSchemes/userSignupSchemes';
import { clientConfigService } from '@/v4/services/clientConfig';
import ReCAPTCHA from 'react-google-recaptcha';
import { pick, defaults, isMatch } from 'lodash';
import SignupIcon from '@assets/icons/outlined/add_user-outlined.svg';
import { TERMS_ROUTE, PRIVACY_ROUTE, COOKIES_ROUTE } from '@/v5/ui/routes/routes.constants';
import { UnhandledErrorInterceptor } from '@controls/errorMessage/unhandledErrorInterceptor/unhandledErrorInterceptor.component';
import { emailAlreadyExists, usernameAlreadyExists } from '@/v5/validation/errors.helpers';
import {
	CreateAccountButton,
	CheckboxContainer,
	CheckboxMessage,
	TermsContainer,
	FormCheckbox,
	Link,
} from './userSignupFormStepTermsAndSubmit.styles';
import { SubmitButton } from '@controls/submitButton';

export interface ITermsAndSubmitFormInput {
	termsAgreed: boolean;
	mailListAgreed: boolean;
	captcha: string;
	username: string;
}

type MinimalTermsAndSubmitFormInput = Omit<ITermsAndSubmitFormInput, 'captcha' | 'username'>;

type UserSignupFormStepTermsAndSubmitProps = {
	updateFields: (fields: any) => void;
	onSubmitStep: () => void;
	onComplete: () => void;
	onUncomplete: () => void;
	fields: ITermsAndSubmitFormInput;
	isActiveStep: boolean;
	formIsSubmitting: boolean;
};

export const UserSignupFormStepTermsAndSubmit = ({
	updateFields,
	onSubmitStep,
	onComplete,
	onUncomplete,
	fields,
	isActiveStep,
	formIsSubmitting,
}: UserSignupFormStepTermsAndSubmitProps) => {
	const DEFAULT_FIELDS: MinimalTermsAndSubmitFormInput = {
		termsAgreed: false,
		mailListAgreed: false,
	};

	const getTermsAndSubmitFields = (): MinimalTermsAndSubmitFormInput => defaults(
		pick(fields, ['termsAgreed', 'mailListAgreed']),
		DEFAULT_FIELDS,
	);

	const {
		control,
		getValues,
		formState,
		formState: { isValid: formIsValid },
	} = useFormContext<ITermsAndSubmitFormInput>();

	const captchaRef = useRef<ReCAPTCHA>();
	const [captchaIsPending, setCaptchaIsPending] = useState(false);

	const handleCaptchaChange = async (captcha) => {
		if (!fields.captcha && captcha) {
			setCaptchaIsPending(true);
			updateFields({ captcha });
			setCaptchaIsPending(false);
		}
	};

	useEffect(() => {
		if (!clientConfigService.captcha_client_key && !fields.captcha) {
			updateFields({
				captcha: 'CAPTCHA_IS_DISABLED',
			});
		}
	}, []);

	useEffect(() => {
		if (formIsValid) {
			onComplete();
			if (!fields.captcha) {
				captchaRef?.current?.execute();
			}
		} else {
			onUncomplete();
		}
	}, [formIsValid]);

	// useEffect(() => {
	// 	const formValues = getValues();
	// 	if (isActiveStep && !isMatch(getTermsAndSubmitFields(), formValues)) {
	// 		updateFields(formValues);
	// 	}
	// }, [formState]);

	return (
		<>
			<TermsContainer>
				<CheckboxContainer>
					<FormCheckbox
						name="termsAgreed"
						control={control}
						label={(
							<CheckboxMessage>
								<FormattedMessage
									id="userSignup.form.terms.termsAndConditions"
									defaultMessage={`
										I agree to the <termsLink>Terms & Conditions</termsLink> and I have
										read the <privacyLink>Privacy Policy</privacyLink> and the 
										<cookiesLink>Cookies Policy</cookiesLink>.
									`}
									values={{
										termsLink: (label) => <Link to={TERMS_ROUTE} target="_blank">{label}</Link>,
										privacyLink: (label) => <Link to={PRIVACY_ROUTE} target="_blank">{label}</Link>,
										cookiesLink: (label) => <Link to={COOKIES_ROUTE} target="_blank">{label}</Link>,
									}}
								/>
							</CheckboxMessage>
						)}
					/>
				</CheckboxContainer>
				<CheckboxContainer>
					<FormCheckbox
						name="mailListAgreed"
						control={control}
						label={(
							<CheckboxMessage>
								<FormattedMessage
									id="userSignup.form.terms.latestNews"
									defaultMessage="Sign up for the latest news and tutorials."
								/>
							</CheckboxMessage>
						)}
					/>
				</CheckboxContainer>
				{clientConfigService.captcha_client_key && (
					<ReCAPTCHA
						ref={captchaRef}
						size="invisible"
						sitekey={clientConfigService.captcha_client_key}
						onChange={handleCaptchaChange}
					/>
				)}
			</TermsContainer>
			<UnhandledErrorInterceptor expectedErrorValidators={[emailAlreadyExists, usernameAlreadyExists]} />
			<CreateAccountButton
				isPending={formIsSubmitting || captchaIsPending}
				startIcon={<SignupIcon />}
				disabled={!formIsValid || !fields.captcha}
				// onClick={handleSubmit(createAccount)}
			>
				<FormattedMessage
					id="userSignup.form.button.createAccount"
					defaultMessage="Create account"
				/>
			</CreateAccountButton>
			<SubmitButton />
		</>
	);
};
