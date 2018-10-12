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

import * as React from 'react';
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { schema, VALIDATIONS_MESSAGES } from '../../../services/validation';
import { formatBytesGB } from '../../../services/formatting/formatCapacity';

import {
  StyledTextField,
  StyledSelectField,
  StyledSelectItem,
  StyledInputLabel,
  StyledFormControl,
  StyledButton,
  FormContainer,
  FieldsRow,
  FieldsColumn,
  FormFooter,
  FormInfoContainer,
  ConfirmContainer,
  FormInfo,
  PayPalLogo,
} from "../subscription.styles";

const REQUIRED_FIELD = Yup.string().required(VALIDATIONS_MESSAGES.REQUIRED);

const SubscriptionSchema = Yup.object().shape({
  firstName: schema.firstName,
  lastName: schema.lastName,
  address: REQUIRED_FIELD,
  city: REQUIRED_FIELD,
  postalCode: REQUIRED_FIELD,
});

interface IProps {
	billingInfo: any;
	countries: any;
	spaceInfo: any;
}

interface IState {
	spaceInfo: {
		spaceUsed: Number,
		spaceLimit: Number,
	};
}

export class SubscriptionForm extends React.PureComponent<IProps, IState> {
	public state = {
		spaceInfo: {
			spaceUsed: 0,
			spaceLimit: 0,
		}
	};

	public handleConfirmSubsription = (data) => {
		console.log('Confirm form', data);
	}

	public componentDidUpdate(prevProps, prevState) {
		if (prevProps.spaceInfo !== this.props.spaceInfo && this.props.spaceInfo) {
			this.setState({
				spaceInfo: this.props.spaceInfo
			});
		}
	}

	public render() {
		const {	countries, billingInfo: { firstName, lastName, city, postalCode, company, line1, line2, countryCode } } = this.props;
		const { spaceInfo: { spaceUsed, spaceLimit } } = this.state;

		return (
			<Formik
				initialValues={{
					firstName,
					lastName,
					city,
					businessName: company,
					address: line1,
					address2: line2,
					postalCode,
					country: countryCode,
					quotaAvailable: spaceLimit,
					quotaUsed: spaceUsed,
				}}
				onSubmit={this.handleConfirmSubsription}
				validationSchema={SubscriptionSchema}
			>
        <Form>
          <FormContainer container direction="column">
            <FieldsRow container wrap="nowrap">
              <FieldsColumn>
                <FieldsRow container wrap="nowrap">
                  <Field name="licenses" render={({ field }) =>
										<StyledTextField
											{...field}
											label="Licencses"
											margin="normal"
											required
											type="number"
											value="0" />
										} />
									<Field name="payment" render={({ field }) =>
										<StyledTextField
											{...field}
											label="Payment (£ / month)"
											margin="normal"
											required
											type="number"
											value="0"
											disabled />
										} />
                </FieldsRow>
                <Field name="firstName" render={({ field, form }) =>
									<StyledTextField
										{...field}
										error={Boolean(form.errors.firstName)}
										helperText={form.errors.firstName}
										label="First Name"
										margin="normal"
										required
										type="text" />
								}	/>
                <Field name="businessName" render={({ field, form }) =>
									<StyledTextField
										{...field}
										label="Business Name"
										margin="normal"
										type="text" />
									} />
                <Field name="address" render={({ field, form }) =>
									<StyledTextField
										{...field}
										error={Boolean(form.errors.address)}
										helperText={form.errors.address}
										label="Address"
										margin="normal"
										required
										type="text" />
									} />
                <Field name="address2" render={({ field }) =>
									<StyledTextField
										{...field}
										label="Address 2"
										margin="normal"
										type="text" />
									} />
              </FieldsColumn>
              <FieldsColumn>
                <FieldsRow container wrap="nowrap">
                  <Field name="quotaAvailable" render={({ field }) =>
										<StyledTextField
											{...field}
											label="Quota available"
											margin="normal"
											type="text"
											disabled
											value={`${formatBytesGB(spaceLimit)}`}
											/>
										} />
                  <Field name="quotaUsed" render={({ field }) =>
										<StyledTextField
											{...field}
											label="Quota used"
											margin="normal"
											type="text"
											value={`${formatBytesGB(spaceUsed)}`}
											disabled />
										} />
                </FieldsRow>
                <Field name="lastName" render={({ field, form }) =>
									<StyledTextField
										{...field}
										error={Boolean(form.errors.lastName)}
										helperText={form.errors.lastName}
										label="Last name"
										margin="normal"
										required
										type="text"	/>
								} />
                <Field name="vatNumber" render={({ field }) =>
									<StyledTextField
										{...field}
										label="VAT Number **"
										margin="normal"
										type="text" />
									} />
                <Field name="city" render={({ field, form }) =>
									<StyledTextField
										{...field} label="City"
										error={Boolean(form.errors.city)}
										helperText={form.errors.city}
										margin="normal"
										required
										type="text" />
									} />
                <Field name="postalCode" render={({ field, form }) =>
									<StyledTextField
										{...field}
										error={Boolean(form.errors.postalCode)}
										helperText={form.errors.postalCode}
										label="Postal code"
										margin="normal"
										required
										type="text" />
									} />
                <StyledFormControl>
                  <StyledInputLabel>Country</StyledInputLabel>
                  <Field name="country" render={({ field }) =>
										<StyledSelectField {...field} type="text">
											{ countries.map(country => (
												<StyledSelectItem key={country.code} value={country.code}>
													{country.name}
												</StyledSelectItem>
											)	)}
										</StyledSelectField>}
									/>
                </StyledFormControl>
              </FieldsColumn>
            </FieldsRow>
            <FormFooter>
              <FormInfoContainer>
                <FormInfo>
                  Changing your billing information could affect your
                  applicable tax rate
                </FormInfo>
                <FormInfo>* Required field</FormInfo>
                <FormInfo>** Subject to VAT where applicable</FormInfo>
              </FormInfoContainer>
              <ConfirmContainer>
                <PayPalLogo src="/images/paypal.png" />
                <Field render={({ form }) =>
									<StyledButton
										color="secondary"
										variant="raised"
										disabled={!form.isValid || form.isValidating}
										type="submit">Confirm</StyledButton>
									} />
              </ConfirmContainer>
            </FormFooter>
          </FormContainer>
        </Form>
			</Formik>
		);
	}
}
