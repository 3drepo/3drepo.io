/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { useContext, useEffect, useState } from 'react';
import { TicketFilterOperator, TicketFilterType, BaseFilter, TicketFilter } from '../cardFilters.types';
import { getDefaultOperator, getFilterFormTitle } from '../cardFilters.helpers';
import { getValidOperators } from '../filtersSelection/tickets/ticketFilters.helpers';
import { Container, TitleContainer } from './filterForm.styles';
import { FilterFormValues } from './filterFormValues/filterFormValues.component';
import { FilterFormOperators } from './filterFormValues/operators/filterFormOperators.component';
import { ActionMenuContext } from '@controls/actionMenu/actionMenuContext';

type FilterFormProps = {
	module: string,
	property: string,
	type: TicketFilterType,
	filter?: BaseFilter,
	onSubmit: (newFilter: TicketFilter) => void,
	onClickBack?: () => void,
};

export const FilterForm = ({ module, property, type, filter, onSubmit, onClickBack }: FilterFormProps) => {
	const { close } = useContext(ActionMenuContext);

	const getInitialOperator = (): TicketFilterOperator => {
		const defaultOperator = filter?.operator || getDefaultOperator(type);
		return getValidOperators(type).includes(defaultOperator) ? defaultOperator : getDefaultOperator(type);
	};
	const [operator, setOperator] = useState<TicketFilterOperator>(getInitialOperator);

	useEffect(() => {
		setOperator(getInitialOperator());
	}, [filter?.operator, type]);

	const onClickCancelOrBack = () => {
		if (onClickBack) {
			onClickBack();
		} else {
			close();
		}
	};

	const handleSubmit = (newFilter: TicketFilter) => {
		onSubmit(newFilter);
		close();
	};

	return (
		<Container>
			<TitleContainer>
				{getFilterFormTitle([module, property])}
			</TitleContainer>
			<FilterFormOperators type={type} operator={operator} onOperatorChange={setOperator} />
			<FilterFormValues
				module={module}
				property={property}
				type={type}
				filter={filter}
				operator={operator}
				isBackButton={!!onClickBack}
				onClickCancelOrBack={onClickCancelOrBack}
				onSubmit={handleSubmit}
			/>
		</Container>
	);
};
