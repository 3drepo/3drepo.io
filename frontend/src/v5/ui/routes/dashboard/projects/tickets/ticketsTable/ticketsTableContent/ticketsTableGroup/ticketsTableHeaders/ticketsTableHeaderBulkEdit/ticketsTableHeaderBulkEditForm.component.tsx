/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { Button, ButtonsContainer, Container, TitleContainer } from "@components/viewer/cards/cardFilters/filterForm/filterForm.styles";
import { ActionMenuItem } from "@controls/actionMenu";
import { isEmpty } from "lodash";
import { FormProvider, useForm } from "react-hook-form";
import { FormattedMessage } from "react-intl";
import { findFilterByPropertyName } from "../ticketsTableHeaderFilter.component";
import { useTicketFiltersContext } from "@components/viewer/cards/cardFilters/ticketsFilters.context";
import { getFilterFormTitle } from "@components/viewer/cards/cardFilters/cardFilters.helpers";
import { BulkEditInputField } from "./bulkEditInputField/bulkEditInputField.component";
import { useContext } from "react";
import { TicketsTableContext } from "../../../../ticketsTableContext/ticketsTableContext";

type FormType = { value: any; };

export const TicketsTableHeaderBulkEditForm = ({ name, onCancel }) => {
	const { filters, choosablefilters } = useTicketFiltersContext();
	const { selectedIds } = useContext(TicketsTableContext);
	const { module, property, type } = findFilterByPropertyName([...filters, ...choosablefilters], name); 
	const defaultValues: FormType = {
		value: type === 'manyOf' ? [] : '',
	};

	const formData = useForm<FormType>({
		defaultValues,
		mode: 'onChange',
	});
	const { formState: { isValid, dirtyFields, errors } } = formData;
	const canSubmit = isValid && !isEmpty(dirtyFields);

	const handleSubmit = formData.handleSubmit((filledForm: FormType) => {
		console.log('@@ SUBMIT VALUE:', filledForm);
		console.log('@@ FOR PROPERTY:', module, property);
		console.log('@@ FOR TICKETS:', selectedIds);
	});

	return (
		<FormProvider {...formData}>
			<Container>
				<TitleContainer>
					{getFilterFormTitle([module, property])}
				</TitleContainer>
				<BulkEditInputField
					name="value"
					module={module}
					property={property}
					type={type}
				/>
				<ButtonsContainer>
					<Button onClick={onCancel} color="secondary">
						<FormattedMessage id="ticketsTable.headers.bulkEditForm.cancel" defaultMessage="Cancel" />
					</Button>
					<ActionMenuItem disabled={!canSubmit}>
						<Button onClick={handleSubmit} color="primary" variant="contained" disabled={!canSubmit}>
							<FormattedMessage id="ticketsTable.headers.bulkEditForm.apply" defaultMessage="Apply" />
						</Button>
					</ActionMenuItem>
				</ButtonsContainer>
			</Container>
		</FormProvider>
	);
}