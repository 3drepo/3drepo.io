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

import { formatDate } from '@/v5/services/intl';
import { FormattedMessage } from 'react-intl';
import { IDueDateEmptyLabel } from './dueDateEmptyLabel.component';
import { DateContainer } from './dueDateLabel.styles';

type IDueDateFilledLabel = IDueDateEmptyLabel & {
	value: number;
};

export const DueDateFilledLabel = ({ value, ...props }: IDueDateFilledLabel): JSX.Element => {
	const isOverdue = value < Date.now();
	const formattedDate = formatDate(value);
	return (
		<DateContainer isOverdue={isOverdue} {...props}>
			{isOverdue ? (
				<FormattedMessage id="dueDate.overdue" defaultMessage="Overdue {date}" values={{ date: formattedDate }} />
			) : (
				<FormattedMessage id="dueDate.due" defaultMessage="Due {date}" values={{ date: formattedDate }} />
			)}
		</DateContainer>
	);
};
