/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import React from 'react';

import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import { Field, Form, Formik } from 'formik';
import { omit } from 'lodash';
import * as Yup from 'yup';

import { clientConfigService } from '../../services/clientConfig';
import { COOKIES_PAGE, PRIVACY_PAGE, TERMS_PAGE } from '../../services/staticPages';
import { getPasswordStrength, getPasswordStrengthMessage, schema } from '../../services/validation';
import { Panel } from '../components/panel/panel.component';
import { SelectField } from '../components/selectField/selectField.component';
import { SubmitButton } from '../components/submitButton/submitButton.component';
import { FieldsRow, StyledTextField } from '../profile/profile.styles';
import { Footer } from './components/footer';
import { ReCaptcha } from './components/reCaptcha/reCaptcha.component';
import {
	ButtonContainer,
	Container,
	Headline,
	StyledFormControl,
	StyledGrid,
	TermLink
} from './signUp.styles';

import * as queryString from 'query-string';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const PaperPropsStyle = {
	maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
	width: 250,
	transform: 'translate3d(0, 0, 0)'
};

const RegistrationInitialValues = {
	captcha: '',
	company: '',
	countryCode: '',
	email: '',
	emailConfirm: '',
	username: '',
	firstName: '',
	lastName: '',
	password: '',
	passwordConfirm: '',
	termsAgreed: false,
	mailListAgreed: true
};

const RegistrationSchema = Yup.object().shape({
	username: schema.username,
	password: schema.password
		.strength(1, 'This password is weak'),
	passwordConfirm: schema.password
		.equalTo(
			Yup.ref('password'),
			'Password confirmation must match password'
		),
	firstName: schema.required,
	lastName: schema.required,
	email: schema.email,
	emailConfirm: schema.email
		.equalTo(
			Yup.ref('email'),
			'Email confirmation must match email'
		),
	countryCode: schema.required,
	captcha: clientConfigService.captcha_client_key ? schema.required : Yup.string(),
	termsAgreed: Yup.boolean().oneOf([true])
});

const DEFAULT_INPUT_PROPS = {
	margin: 'normal',
	required: true
};

interface IProps {
	history: any;
	location: any;
	headlineText?: string;
	onRegister: (username, data) => void;
	isPending: boolean;
}

interface IState {
	passwordStrengthMessage: string;
	countries: any[];
}

const TermsLabel = () => (
		<>
			I agree to the <TermLink href={TERMS_PAGE.path} target="_blank">{TERMS_PAGE.title}</TermLink>&nbsp;
			and I have read the <TermLink href={PRIVACY_PAGE.path} target="_blank">{PRIVACY_PAGE.title}</TermLink> policy
			and the <TermLink href={COOKIES_PAGE.path} target="_blank">{COOKIES_PAGE.title}</TermLink> policy.
		</>
);

export class SignUp extends React.PureComponent<IProps, IState> {
	public state = {
		passwordStrengthMessage: '',
		countries: []
	};

	public form: any = React.createRef();

	public reCaptchaWrapperRef = React.createRef<any>();

	public componentDidMount() {
		const defaultCountry = clientConfigService.countries.find((country) => country.code === 'GB');
		const countries = clientConfigService.countries.filter((country) => country !== defaultCountry);
		countries.unshift(defaultCountry);
		this.setState({ countries });
	}

	public componentDidUpdate(prevProps: IProps) {
		if (prevProps.isPending !== this.props.isPending && !this.props.isPending) {
			this.form.current.setFieldValue('password', '', true);
			this.form.current.setFieldValue('passwordConfirm', '', true);
		}
	}

	public handleSubmit = (values, form) => {
		const data = omit(values, 'username', 'emailConfirm', 'passwordConfirm', 'termsAgreed');
		this.props.onRegister(values.username, data);
		this.setState({
			passwordStrengthMessage: ''
		});
		if (this.reCaptchaWrapperRef.current) {
			this.reCaptchaWrapperRef.current.reCaptchaRef.current.reset();
		}
	}

	public handlePasswordChange = (onChange) => (event, ...params) => {
		const password = event.target.value;
		getPasswordStrength(password).then((strength) => {
			this.setState({
				passwordStrengthMessage: password.length > 7 ? ` (${getPasswordStrengthMessage(strength)})` : ''
			});
		});

		onChange(event, ...params);
	}

	public renderCountries = () =>
		this.state.countries.map((country) => (
			<MenuItem key={country.code} value={country.code}>
				{country.name}
			</MenuItem>
		))

	public render() {
		const {isPending} = this.props;
		const { email: defaultEmail } = queryString.parse(this.props.location.search) || '';
		const defaultValues = { ...RegistrationInitialValues, email: defaultEmail, emailConfirm: defaultEmail};

		return (
			<Container
				container
				direction="column"
				alignItems="center"
				wrap="nowrap">
				<StyledGrid item xs={9} sm={6} md={6} lg={6} xl={2}>
					<Panel title="Sign up" hiddenScrollbars>
						<Headline>Creating a 3D Repo account is free</Headline>
						<Formik
							initialValues={defaultValues}
							onSubmit={this.handleSubmit}
							validationSchema={RegistrationSchema}
							ref={this.form}
						>
							<Form >
								<Field name="username" render={({ field, form }) => (
									<StyledTextField
										{...DEFAULT_INPUT_PROPS}
										{...field}
										error={Boolean(form.touched.username && form.errors.username)}
										helperText={form.touched.username && (form.errors.username || '')}
										label="Username"
										disabled={isPending}
										fullWidth
									/>
								)} />
								<FieldsRow container wrap="nowrap">
									<Field name="password" render={({ field, form }) => (
										<StyledTextField
											{...DEFAULT_INPUT_PROPS}
											{...field}
											error={Boolean(form.touched.password && form.errors.password)}
											helperText={form.touched.password && (form.errors.password || '')}
											label={`Password${this.state.passwordStrengthMessage}`}
											type="password"
											autoComplete="new-password"
											disabled={isPending}
											onChange={this.handlePasswordChange(field.onChange)}
										/>
									)} />
									<Field name="passwordConfirm" render={({ field, form }) => (
										<StyledTextField
											{...DEFAULT_INPUT_PROPS}
											{...field}
											error={Boolean(form.touched.passwordConfirm && form.errors.passwordConfirm)}
											helperText={form.touched.passwordConfirm && (form.errors.passwordConfirm || '')}
											label="Password confirmation"
											type="password"
											autoComplete="new-password"
											disabled={isPending}
											onChange={this.handlePasswordChange(field.onChange)}
										/>
									)} />
								</FieldsRow>
								<FieldsRow container wrap="nowrap">
									<Field name="firstName" render={({ field, form }) => (
										<StyledTextField
											{...DEFAULT_INPUT_PROPS}
											{...field}
											error={Boolean(form.touched.firstName && form.errors.firstName)}
											helperText={form.touched.firstName && (form.errors.firstName || '')}
											label="First name"
											disabled={isPending}
										/>
									)} />
									<Field name="lastName" render={({ field, form }) => (
										<StyledTextField
											{...DEFAULT_INPUT_PROPS}
											{...field}
											error={Boolean(form.touched.lastName && form.errors.lastName)}
											helperText={form.touched.lastName && (form.errors.lastName || '')}
											label="Last name"
											disabled={isPending}
										/>
									)} />
								</FieldsRow>
								<FieldsRow container wrap="nowrap">
									<Field name="email" render={({ field, form }) => (
										<StyledTextField
											{...DEFAULT_INPUT_PROPS}
											{...field}
											error={Boolean(form.touched.email && form.errors.email)}
											helperText={form.touched.email && (form.errors.email || '')}
											label="Email"
											disabled={isPending}
										/>
									)} />
									<Field name="emailConfirm" render={({ field, form }) => (
										<StyledTextField
											{...DEFAULT_INPUT_PROPS}
											{...field}
											error={Boolean(form.touched.emailConfirm && form.errors.emailConfirm)}
											helperText={form.touched.emailConfirm && (form.errors.emailConfirm || '')}
											label="Confirm email"
											disabled={isPending}
										/>
									)} />
								</FieldsRow>
								<FieldsRow container wrap="nowrap">
									<Field name="company" render={({ field }) => (
										<StyledTextField
											{...field}
											label="Company"
											margin="normal"
											disabled={isPending}
										/>
									)} />
									<StyledFormControl>
										<InputLabel>Country *</InputLabel>
										<Field name="countryCode" render={({ field }) => (
											<SelectField
												{...field}
												MenuProps={{ PaperProps: {style: PaperPropsStyle}, disabled: isPending}}
											>
												{this.renderCountries()}
											</SelectField>
										)} />
									</StyledFormControl>
								</FieldsRow>

								{ clientConfigService.captcha_client_key &&
									<Field name="captcha" render={({ field }) =>
											<ReCaptcha
												{...field}
												sitekey={clientConfigService.captcha_client_key}
												ref={this.reCaptchaWrapperRef}
											/>}
									/>
								}
								<Field name="mailListAgreed" render={({ field }) => (
										<FormControlLabel
											{...field}
											value={field.value ? '1' : '0'}
											control={<Checkbox color="secondary" checked={field.value} />}
											label="Sign up for the latest news and tutorials!"
											disabled={isPending}
										/>
									)}
								/>
								<Field name="termsAgreed" required render={({ field }) => (
										<FormControlLabel
											{...field}
											value={field.value ? '1' : '0'}
											disabled={isPending}
											control={<Checkbox color="secondary" checked={field.value} />}
											label={<TermsLabel />}
										/>
									)}
								/>
								<ButtonContainer>
									<Field render={({ form }) => (
										<SubmitButton
											pending={isPending}
											disabled={!form.isValid || form.isValidating}
										>
											Sign up
										</SubmitButton>)}
									/>
								</ButtonContainer>
							</Form>
						</Formik>
						<Divider light />
						<Footer />
					</Panel>
				</StyledGrid>
			</Container>
		);
	}
}
