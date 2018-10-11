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

const SubscriptionSchema = Yup.object().shape({
  firstName: schema.firstName,
  lastName: schema.lastName,
  address: Yup.string().required(VALIDATIONS_MESSAGES.REQUIRED),
  city: Yup.string().required(VALIDATIONS_MESSAGES.REQUIRED),
  postalCode: Yup.string().required(VALIDATIONS_MESSAGES.REQUIRED),
});

export class SubscriptionForm extends React.PureComponent<any, any> {
	public handleConfirmSubsription = () => {
		console.log('Confirm form');
	}

	public render() {
		return (
			<Formik
				initialValues={{}}
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
											type="number"
											value="0"
											disabled />
										} />
                  <Field name="quotaUsed" render={({ field }) =>
										<StyledTextField
											{...field}
											label="Quota used"
											margin="normal"
											type="number"
											value="0"
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
										label="VAT Number"
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
										<StyledSelectField {...field} type="text" value="none">
											<StyledSelectItem value="red">
												Red
											</StyledSelectItem>
											<StyledSelectItem value="green">
												Green
											</StyledSelectItem>
											<StyledSelectItem value="blue">
												Blue
											</StyledSelectItem>
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
