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

import {
  StyledTextField,
  StyledSelectField,
  StyledSelectItem,
  StyledInputLabel,
  StyledFormControl,
  FormContainer,
  FieldsRow,
	FieldsColumn,
} from "../subscription.styles";

export class SubscriptionForm extends React.PureComponent<any, any> {

	public render() {
		return (
			<Formik>
				<Form>
					<FormContainer container direction="column">
						<FieldsRow container wrap="nowrap">
							<Field name="licenses" render={({ field }) => (
								<StyledTextField
									{...field}
									label="Licencses"
									margin="normal"
									required
									type="number"
									value="0"
								/>
							)} />
							<Field name="payment" render={({ field }) => (
								<StyledTextField
									{...field}
									label="Payment (£ / month)"
									margin="normal"
									required
									type="number"
									value="0"
									disabled
								/>
							)} />
							<Field name="quotaAvailable" render={({ field }) => (
								<StyledTextField
									{...field}
									label="Quota available"
									margin="normal"
									type="number"
									value="0"
									disabled
								/>
							)} />
							<Field name="quotaUsed" render={({ field }) => (
								<StyledTextField
									{...field}
									label="Quota used"
									margin="normal"
									type="number"
									value="0"
									disabled
								/>
							)} />
						</FieldsRow>
						<FieldsRow container wrap="nowrap">
							<FieldsColumn>
								<Field name="firstName" render={({ field }) => (
									<StyledTextField
										{...field}
										label="First Name"
										margin="normal"
										required
										type="text"
									/>
								)} />
								<Field name="businessName" render={({ field }) => (
									<StyledTextField
										{...field}
										label="Business Name"
										margin="normal"
										type="text"
									/>
								)} />
								<Field name="address" render={({ field }) => (
									<StyledTextField
										{...field}
										label="Address"
										margin="normal"
										required
										type="text"
									/>
								)} />
								<Field name="address2" render={({ field }) => (
									<StyledTextField
										{...field}
										label="Address 2"
										margin="normal"
										type="text"
									/>
								)} />
							</FieldsColumn>
							<FieldsColumn>
								<Field name="lastName" render={({ field }) => (
									<StyledTextField
										{...field}
										label="Last name"
										margin="normal"
										required
										type="text"
									/>
								)} />
								<Field name="vatNumber" render={({ field }) => (
									<StyledTextField
										{...field}
										label="VAT Number"
										margin="normal"
										type="text"
									/>
								)} />
								<Field name="city" render={({ field }) => (
									<StyledTextField
										{...field}
										label="City"
										margin="normal"
										required
										type="text"
									/>
								)} />
								<Field name="postalCode" render={({ field }) => (
									<StyledTextField
										{...field}
										label="Postal code"
										margin="normal"
										required
										type="text"
									/>
								)} />
								<StyledFormControl>
									<StyledInputLabel>Country</StyledInputLabel>
									<Field name="country" component="select" render={({ field }) => (
										<StyledSelectField
											{...field}
											margin="normal"
											type="text"
										>
											<StyledSelectItem value="red">Red</StyledSelectItem>
											<StyledSelectItem value="green">Green</StyledSelectItem>
											<StyledSelectItem value="blue">Blue</StyledSelectItem>
										</StyledSelectField>
									)} />
								</StyledFormControl>
							</FieldsColumn>
						</FieldsRow>
					</FormContainer>
				</Form>
			</Formik>
		);
	}
}
