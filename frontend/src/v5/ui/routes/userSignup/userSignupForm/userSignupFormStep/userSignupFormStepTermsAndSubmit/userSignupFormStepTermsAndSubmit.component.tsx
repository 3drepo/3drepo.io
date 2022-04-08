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
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { UserSignupSchemaTermsAndSubmit } from '@/v5/validation/schemes';
import { FormCheckbox } from '@controls/formCheckbox/formCheckbox.component';
import { clientConfigService } from '@/v4/services/clientConfig';
import ReCAPTCHA from 'react-google-recaptcha';
import { pick, defaults, isMatch } from 'lodash';
import SignupIcon from '@assets/icons/outlined/add_user-outlined.svg';
import {
	CreateAccountButton,
	CheckboxContainer,
	CheckboxMessage,
	TermsContainer,
	ErrorContainer,
	ErrorMessage,
	ErrorIcon,
	Link,
	Gap,
} from './userSignupFormStepTermsAndSubmit.styles';

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
	unexpectedError: string;
	fields: ITermsAndSubmitFormInput;
	isActiveStep: boolean;
};

export const UserSignupFormStepTermsAndSubmit = ({
	updateFields,
	onSubmitStep,
	onComplete,
	onUncomplete,
	unexpectedError,
	fields,
	isActiveStep,
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
		handleSubmit,
		control,
		getValues,
		formState,
		formState: { errors, isValid: formIsValid },
	} = useForm<ITermsAndSubmitFormInput>({
		mode: 'onChange',
		resolver: yupResolver(UserSignupSchemaTermsAndSubmit),
		defaultValues: getTermsAndSubmitFields(),
	});

	const captchaRef = useRef<ReCAPTCHA>();
	const [submitButtonIsPending, setSubmitButtonIsPending] = useState(false);

	const createAccount: SubmitHandler<ITermsAndSubmitFormInput> = () => {
		setSubmitButtonIsPending(true);
		onSubmitStep();
	};

	const handleCaptchaChange = async (captcha) => {
		if (!fields.captcha && captcha) {
			setSubmitButtonIsPending(true);
			updateFields({ captcha });
			setSubmitButtonIsPending(false);
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

	useEffect(() => {
		const formValues = getValues();
		if (isActiveStep && !isMatch(getTermsAndSubmitFields(), formValues)) {
			updateFields(formValues);
		}
	}, [formState]);

	useEffect(() => setSubmitButtonIsPending(false), [unexpectedError]);

	return (
		<>
			<TermsContainer>
				<CheckboxContainer>
					<FormCheckbox
						name="termsAgreed"
						control={control}
						formError={errors.termsAgreed}
						label={(
							<CheckboxMessage>
								<FormattedMessage
									id="userSignup.form.terms.termsAndContitions"
									defaultMessage={`
										I agree to the {termsAndConditions} and I have
										read the {privacyPolicy} and the {cookiesPolicy}.
									`}
									values={{
										termsAndConditions: (
											<Link
												to="/terms"
												target="_blank"
											>
												<FormattedMessage
													id="userSignup.form.terms.termsAndConditions.link"
													defaultMessage="Terms & Conditions"
												/>
											</Link>
										),
										privacyPolicy: (
											<Link
												to="/privacy"
												target="_blank"
											>
												<FormattedMessage
													id="userSignup.form.terms.privacyPolicy.link"
													defaultMessage="Privacy Policy"
												/>
											</Link>
										),
										cookiesPolicy: (
											<Link
												to="/cookies"
												target="_blank"
											>
												<FormattedMessage
													id="userSignup.form.terms.cookiesPolicy.link"
													defaultMessage="Cookies Policy"
												/>
											</Link>
										),
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
						formError={errors.mailListAgreed}
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
				{ clientConfigService.captcha_client_key && (
					<ReCAPTCHA
						ref={captchaRef}
						size="invisible"
						sitekey={clientConfigService.captcha_client_key}
						onChange={handleCaptchaChange}
					/>
				)}
			</TermsContainer>
			{ unexpectedError && (
				<ErrorContainer>
					<ErrorIcon />
					<ErrorMessage>
						<FormattedMessage
							id="userSignup.form.error.unexpected"
							defaultMessage="An unexpected error has occurred: &quot;{unexpectedError}&quot;. Please try again later."
							values={{ unexpectedError }}
						/>
						<Gap />
						<FormattedMessage
							id="userSignup.form.error.unexpected.contactSupport"
							defaultMessage="If the error persists, please {contactSupport}."
							values={{
								contactSupport: (
									<Link to={{ pathname: 'https://3drepo.com/contact/' }}>
										<FormattedMessage
											id="userSignup.form.error.contactSupport"
											defaultMessage="contact the support"
										/>
									</Link>
								),
							}}
						/>
					</ErrorMessage>
				</ErrorContainer>
			)}
			<CreateAccountButton
				isPending={submitButtonIsPending}
				startIcon={<SignupIcon />}
				disabled={!formIsValid || !fields.captcha || !!unexpectedError}
				onClick={handleSubmit(createAccount)}
			>
				<FormattedMessage
					id="userSignup.form.button.createAccount"
					defaultMessage="Create account"
				/>
			</CreateAccountButton>
		</>
	);
};
