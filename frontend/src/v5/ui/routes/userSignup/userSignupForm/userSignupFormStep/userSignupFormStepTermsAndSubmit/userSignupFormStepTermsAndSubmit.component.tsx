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
import { useEffect, useRef } from 'react';
import { CircularProgress } from '@material-ui/core';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { UserSignupSchemaTermsAndSubmit } from '@/v5/validation/schemes';
import { FormCheckbox } from '@controls/formCheckbox/formCheckbox.component';
import { clientConfigService } from '@/v4/services/clientConfig';
import ReCAPTCHA from 'react-google-recaptcha';
import {
	CircularProgressContainer,
	CreateAccountButton,
	CreateAccountIcon,
	CheckboxContainer,
	CheckboxMessage,
	TermsContainer,
	ErrorContainer,
	ErrorIcon,
	Link,
} from './userSignupFormStepTermsAndSubmit.styles';

interface ITermsAndSubmitFormInput {
	terms: string;
	news: string;
	reCaptchaToken: string;
}

type UserSignupFormStepTermsAndSubmitProps = {
	updateFields: (fields: any) => void;
	onSubmitStep: () => void;
	onComplete: () => void;
	onUncomplete: () => void;
	fields: ITermsAndSubmitFormInput;
	unexpectedError: string;
	isSubmitting: boolean;
};

export const UserSignupFormStepTermsAndSubmit = ({
	updateFields,
	onSubmitStep,
	onComplete,
	onUncomplete,
	fields,
	unexpectedError,
	isSubmitting,
}: UserSignupFormStepTermsAndSubmitProps) => {
	const {
		watch,
		getValues,
		control,
		formState: { errors },
	} = useForm<ITermsAndSubmitFormInput>({
		mode: 'onChange',
		resolver: yupResolver(UserSignupSchemaTermsAndSubmit),
		defaultValues: fields,
	});

	const termsAgreed = watch('terms');

	const reCaptchaRef = useRef<ReCAPTCHA>();

	const createAccount: SubmitHandler<ITermsAndSubmitFormInput> = () => {
		updateFields(getValues());
		reCaptchaRef?.current?.reset();
		onSubmitStep();
	};

	useEffect(() => {
		if (termsAgreed) {
			onComplete();
			if (!fields.reCaptchaToken) {
				reCaptchaRef?.current?.execute();
			}
		} else {
			onUncomplete();
		}
	}, [termsAgreed]);

	useEffect(() => () => { updateFields(getValues()); }, []);

	const handleChange = (reCaptchaToken) => updateFields({ reCaptchaToken });

	return (
		<>
			<TermsContainer>
				<CheckboxContainer>
					<FormCheckbox
						name="terms"
						control={control}
						formError={errors.terms}
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
						name="news"
						control={control}
						formError={errors.news}
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
						ref={reCaptchaRef}
						size="invisible"
						sitekey={clientConfigService.captcha_client_key}
						onChange={handleChange}
					/>
				)}
			</TermsContainer>
			{ unexpectedError && (
				<ErrorContainer>
					<ErrorIcon />
					{unexpectedError}
				</ErrorContainer>
			)}
			{isSubmitting ? (
				<CircularProgressContainer>
					<CircularProgress size={20} thickness={7} />
				</CircularProgressContainer>
			) : (
				<CreateAccountButton
					disabled={!termsAgreed || !fields.reCaptchaToken || isSubmitting}
					onClick={createAccount}
					type="submit"
				>
					<CreateAccountIcon />
					<FormattedMessage
						id="userSignup.form.button.createAccount"
						defaultMessage="Create account"
					/>
				</CreateAccountButton>
			)}
		</>
	);
};
