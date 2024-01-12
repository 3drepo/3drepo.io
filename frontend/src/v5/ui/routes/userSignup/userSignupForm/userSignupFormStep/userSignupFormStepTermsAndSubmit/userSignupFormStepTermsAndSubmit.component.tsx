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
import SignupIcon from '@assets/icons/outlined/add_user-outlined.svg';
import { TERMS_ROUTE, PRIVACY_ROUTE, COOKIES_ROUTE } from '@/v5/ui/routes/routes.constants';
import { UnhandledErrorInterceptor } from '@controls/errorMessage/unhandledErrorInterceptor/unhandledErrorInterceptor.component';
import { emailAlreadyExists, usernameAlreadyExists } from '@/v5/validation/errors.helpers';
import { useFormContext } from 'react-hook-form';
import {
	CreateAccountButton,
	CheckboxContainer,
	CheckboxMessage,
	TermsContainer,
	FormCheckbox,
	Link,
} from './userSignupFormStepTermsAndSubmit.styles';

export interface ITermsAndSubmitFormInput {
	termsAgreed: boolean;
	mailListAgreed: boolean;
	captcha: string;
	username: string;
}

export const UserSignupFormStepTermsAndSubmit = () => {
	const {
		control,
		formState: { isValid: formIsValid, isSubmitting },
	} = useFormContext<ITermsAndSubmitFormInput>();

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
										privacyLink: (label) => <Link to={{ pathname: PRIVACY_ROUTE }} target="_blank" rel="noopener noreferrer">{label}</Link>,
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
			</TermsContainer>
			<UnhandledErrorInterceptor expectedErrorValidators={[emailAlreadyExists, usernameAlreadyExists]} />
			<CreateAccountButton
				isPending={isSubmitting}
				startIcon={<SignupIcon />}
				disabled={!formIsValid}
			>
				<FormattedMessage
					id="userSignup.form.button.createAccount"
					defaultMessage="Create account"
				/>
			</CreateAccountButton>
		</>
	);
};
