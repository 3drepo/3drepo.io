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
import { DateContainer, EmptyDateContainer } from './dueDate.styles';

type IDueDateLabel = {
	value: number;
	clickable: boolean;
	onClick?: (event) => void;
};

export const DueDateLabel = ({ value, clickable, onClick }: IDueDateLabel): JSX.Element => {
	if (!value) {
		return (
			<EmptyDateContainer clickable={clickable} onClick={onClick}>
				{clickable ? (
					<FormattedMessage id="dueDate.emptyText.clickable" defaultMessage="Set Due Date" />
				) : (
					<FormattedMessage id="dueDate.emptyText.nonClickable" defaultMessage="Due Date Unset" />
				)}
			</EmptyDateContainer>
		);
	}
	const isOverdue = value < Date.now();
	const formattedDate = formatDate(value);
	return (
		<DateContainer clickable={clickable} isOverdue={isOverdue} onClick={onClick}>
			{isOverdue ? (
				<FormattedMessage id="dueDate.overdue" defaultMessage="Overdue {date}" values={{ date: formattedDate }} />
			) : (
				<FormattedMessage id="dueDate.due" defaultMessage="Due {date}" values={{ date: formattedDate }} />
			)}
		</DateContainer>
	);
};
