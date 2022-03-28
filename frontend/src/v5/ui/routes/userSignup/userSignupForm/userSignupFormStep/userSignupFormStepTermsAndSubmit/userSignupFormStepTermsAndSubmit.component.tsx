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

import Recaptcha from 'react-google-invisible-recaptcha';
import { FormattedMessage } from 'react-intl';
import { useEffect, useState } from 'react';
import { CircularProgress } from '@material-ui/core';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { UserSignupSchemaTermsAndSubmit } from '@/v5/validation/schemes';
import { pick } from 'lodash';
import { FormCheckbox } from '@controls/formCheckbox/formCheckbox.component';
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

	const termsIsTicked = watch('terms');

	const getFields = () => pick(getValues(), ['terms', 'news']);

	const createAccount: SubmitHandler<ITermsAndSubmitFormInput> = () => {
		updateFields(getFields());
		onSubmitStep();
	};
	const [captchaIsValidated, setCaptchaIsValidated] = useState(false);
	const [refRecaptcha, setRefRecaptcha] = useState<Recaptcha | null>(null);

	useEffect(() => {
		(termsIsTicked ? onComplete : onUncomplete)();
		refRecaptcha?.execute();
	}, [termsIsTicked]);

	useEffect(() => () => { updateFields(getFields()); }, []);

	return (
		<>
			<TermsContainer>
				<CheckboxContainer>
					<FormCheckbox
						name="terms"
						control={control}
						formError={errors.terms}
					/>
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
				</CheckboxContainer>
				<CheckboxContainer>
					<FormCheckbox
						name="news"
						control={control}
						formError={errors.news}
					/>
					<CheckboxMessage>
						<FormattedMessage
							id="userSignup.form.terms.latestNews"
							defaultMessage="Sign up for the latest news and tutorials."
						/>
					</CheckboxMessage>
				</CheckboxContainer>
				<Recaptcha
					ref={setRefRecaptcha}
					onResolved={() => setCaptchaIsValidated(true)}
					// TODO add site key
					sitekey="6Lc1og4fAAAAAGj5H0b-2neb3j6KP8C7paoCgGdv"
				/>
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
					// disabled={!termsIsTicked || isSubmitting || !captchaIsValidated}
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
