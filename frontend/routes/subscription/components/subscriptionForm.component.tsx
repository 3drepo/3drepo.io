/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import { Field, Formik } from 'formik';
import { isEmpty, isEqual } from 'lodash';
import * as React from 'react';
import * as Yup from 'yup';

import { formatBytesGB } from '../../../services/formatting/formatCapacity';
import { schema } from '../../../services/validation';

import {
	ConfirmContainer,
	FieldsColumn,
	FieldsRow,
	FormContainer,
	FormFooter,
	FormInfo,
	FormInfoContainer,
	PayPalLogo,
	StyledButton,
	StyledForm,
	StyledFormControl,
	StyledInputLabel,
	StyledSelectField,
	StyledSelectItem,
	StyledTextField
} from '../subscription.styles';

const SubscriptionSchema = Yup.object().shape({
	firstName: schema.firstName,
	lastName: schema.lastName,
	line1: schema.required,
	city: schema.required,
	postalCode: schema.required,
	licences: schema.required
});

interface IProps {
	billingInfo: any;
	countries: any[];
	spaceInfo: any;
	licencesInfo: any;
	teamspace: any;
	changeSubscription: (teamspace, subscriptionData) => void;
}

interface IState {
	spaceInfo: {
		spaceUsed: number;
		spaceLimit: number;
	};
	numLicences: number;
	pricePerLicense: number;
	payment: number;
}

export class SubscriptionForm extends React.PureComponent<IProps, IState> {
	public state = {
		spaceInfo: {
			spaceUsed: 0,
			spaceLimit: 0
		},
		numLicences: 0,
		pricePerLicense: 0,
		payment: 0
	};

	public handleConfirmSubsription = (addressData) => {
		const { licencesInfo: { planId }, teamspace, changeSubscription } = this.props;
		const subscriptionData = {
			billingAddress: { ...addressData },
			plans: [ { plan: planId, quantity: this.state.numLicences } ]
		};

		changeSubscription(teamspace, subscriptionData);
	}

	public handleLicencesChange = (onChange) => (event, ...params) => {
		const licences = Number(event.target.value);

		this.setState(() => ({
			numLicences: licences,
			payment: licences * this.state.pricePerLicense
		}));

		onChange(event, ...params);
	}

	public componentDidMount() {
		const {
			spaceInfo,
			licencesInfo: { numLicences, pricePerLicense }
		} = this.props;
		const payment = numLicences * pricePerLicense;

		this.setState({ spaceInfo, numLicences, pricePerLicense, payment });
	}

	public componentDidUpdate(prevProps) {
		const changes = {} as any;
		const { spaceInfo, licencesInfo: { numLicences, pricePerLicense } } = this.props;

		const spaceInfoChanged = !isEqual(prevProps.spaceInfo, spaceInfo);
		if (spaceInfoChanged) {
			changes.spaceInfo = spaceInfo;
		}

		const numLicencesChanged = !isEqual(
			prevProps.licencesInfo.numLicences,
			numLicences
		);
		if (numLicencesChanged) {
			changes.numLicences = numLicences;
		}

		const pricePerLicenseChanged = !isEqual(
			prevProps.licencesInfo.pricePerLicense,
			pricePerLicense
		);
		if (pricePerLicenseChanged) {
			changes.pricePerLicense = pricePerLicense;
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public render() {
		const { countries, billingInfo } = this.props;
		const { spaceInfo: { spaceUsed, spaceLimit }, numLicences } = this.state;

		return (
			<Formik
				initialValues={{...billingInfo, licences: numLicences}}
				onSubmit={this.handleConfirmSubsription}
				validationSchema={SubscriptionSchema}
			>
				<StyledForm>
					<FormContainer
						container={true}
						direction="column"
						wrap="nowrap"
					>
						<FieldsRow container={true} wrap="nowrap">
							<FieldsColumn>
								<FieldsRow container={true} wrap="nowrap">
									<Field
										name="licences"
										render={ ({ field }) => (
											<StyledTextField
												{...field}
												label="Licences"
												margin="normal"
												required={true}
												type="number"
												value={numLicences}
												inputProps={{ min: '0', max: '1000' }}
												onChange={this.handleLicencesChange(field.onChange)}
											/>
										)}
									/>
									<Field
										name="payment"
										render={ ({ field }) => (
											<StyledTextField
												{...field}
												label="Payment (£ / month)"
												margin="normal"
												required={true}
												type="number"
												value={this.state.payment}
												disabled={true}
											/>
										)}
									/>
								</FieldsRow>
								<Field
									name="firstName"
									render={ ({ field, form }) => (
										<StyledTextField
											{...field}
											error={Boolean(form.errors.firstName)}
											helperText={form.errors.firstName}
											label="First Name"
											margin="normal"
											required={true}
											type="text"
										/>
									)}
								/>
								<Field
									name="company"
									render={ ({ field }) => (
										<StyledTextField
											{...field}
											label="Business Name"
											margin="normal"
											type="text"
										/>
									)}
								/>
								<Field
									name="line1"
									render={ ({ field, form }) => (
										<StyledTextField
											{...field}
											error={Boolean(form.errors.address)}
											helperText={form.errors.address}
											label="Address"
											margin="normal"
											required={true}
											type="text"
										/>
									)}
								/>
								<Field
									name="line2"
									render={ ({ field }) => (
										<StyledTextField
											{...field}
											label="Address 2"
											margin="normal"
											type="text"
										/>
									)}
								/>
							</FieldsColumn>
							<FieldsColumn>
								<FieldsRow container={true} wrap="nowrap">
									<Field
										name="quotaAvailable"
										render={ ({ field }) => (
											<StyledTextField
												{...field}
												label="Quota available"
												margin="normal"
												type="text"
												disabled={true}
												value={`${formatBytesGB(spaceLimit)}`}
											/>
										)}
									/>
									<Field
										name="quotaUsed"
										render={ ({ field }) => (
											<StyledTextField
												{...field}
												label="Quota used"
												margin="normal"
												type="text"
												value={`${formatBytesGB(spaceUsed)}`}
												disabled={true}
											/>
										)}
									/>
								</FieldsRow>
								<Field
									name="lastName"
									render={ ({ field, form }) => (
										<StyledTextField
											{...field}
											error={Boolean(form.errors.lastName)}
											helperText={form.errors.lastName}
											label="Last name"
											margin="normal"
											required={true}
											type="text"
										/>
									)}
								/>
								<Field
									name="vat"
									render={ ({ field }) => (
										<StyledTextField
											{...field}
											label="VAT Number **"
											margin="normal"
											type="text"
										/>
									)}
								/>
								<Field
									name="city"
									render={ ({ field, form }) => (
										<StyledTextField
											{...field}
											label="City"
											error={Boolean(form.errors.city)}
											helperText={form.errors.city}
											margin="normal"
											required={true}
											type="text"
										/>
									)}
								/>
								<Field
									name="postalCode"
									render={ ({ field, form }) => (
										<StyledTextField
											{...field}
											error={Boolean(form.errors.postalCode)}
											helperText={form.errors.postalCode}
											label="Postal code"
											margin="normal"
											required={true}
											type="text"
										/>
									)}
								/>
								<StyledFormControl>
									<StyledInputLabel>Country</StyledInputLabel>
									<Field
										name="countryCode"
										render={ ({ field }) => (
											<StyledSelectField {...field} type="text" disabled={true}>
												{ countries.map((country) => (
													<StyledSelectItem
														key={country.code}
														value={country.code}
													>
														{country.name}
													</StyledSelectItem>
												)) }
											</StyledSelectField>
										)}
									/>
								</StyledFormControl>
							</FieldsColumn>
						</FieldsRow>
						<FormFooter>
							<FormInfoContainer>
								<FormInfo>
									Changing your billing information could affect your applicable
									tax rate
								</FormInfo>
								<FormInfo>* Required field</FormInfo>
								<FormInfo>** Subject to VAT where applicable</FormInfo>
							</FormInfoContainer>
							<ConfirmContainer>
								<PayPalLogo src="/images/paypal.png" />
								<Field render={ ({ form }) =>
										<StyledButton
											color="secondary"
											variant="raised"
											disabled={!form.isValid || form.isValidating || !form.dirty}
											type="submit">
											Confirm
										</StyledButton>}
								/>
							</ConfirmContainer>
						</FormFooter>
					</FormContainer>
				</StyledForm>
			</Formik>
		);
	}
}
