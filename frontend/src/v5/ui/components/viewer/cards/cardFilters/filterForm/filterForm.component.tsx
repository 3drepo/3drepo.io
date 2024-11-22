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

import { formatSimpleDate } from '@/v5/helpers/intl.helper';
import { FormattedMessage } from 'react-intl';
import { CardFilterOperator } from '../cardFilters.types';
import { FILTER_OPERATOR_LABEL } from '../cardFilters.helpers';
import { Container, ButtonsContainer, Button } from './filterForm.styles';
import { Select } from '@controls/inputs/select/select.component';
import { MenuItem } from '@mui/material';


type FilterFormProps = {
	title: any,
	type: string,
	values?: any,
	operator?: CardFilterOperator,
	onSubmit: () => void,
	onCancel: () => void,
};
export const FilterForm = ({ title, type, values = [], operator = 'eq', onSubmit, onCancel }: FilterFormProps) => (
	<Container>
		{title}
		<Select defaultValue={operator}>
			{Object.entries(FILTER_OPERATOR_LABEL).map(([key, label]) => (
				<MenuItem key={key} value={key}>{label}</MenuItem>
			))}
		</Select>
		type: {type}
		{/* values: {['date', 'pastDate'].includes(type) ? values.map(formatSimpleDate) : values.join(', ') ?? ''} */}
		<ButtonsContainer>
			<Button onClick={onCancel} color="secondary">
				<FormattedMessage id="viewer.card.tickets.filters.form.back" defaultMessage="Back" />
			</Button>
			<Button onClick={onSubmit} color="primary" variant="contained">
				<FormattedMessage id="viewer.card.tickets.filters.form.apply" defaultMessage="Apply" />
			</Button>
		</ButtonsContainer>
	</Container>
);