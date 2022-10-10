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
import { DateContainer, EmptyDateContainer } from './dueDate.style';

export const DueDate = ({ epochTime, onClick }) => {
	if (!epochTime) {
		return (
			<EmptyDateContainer onClick={onClick}>
				<FormattedMessage id="dueDate.emptyText" defaultMessage="Set Due Date" />
			</EmptyDateContainer>
		);
	}
	const isOverdue = epochTime < Date.now();
	return (
		<DateContainer isOverdue={isOverdue}>
			{isOverdue ? (
				<FormattedMessage id="dueDate.overdue" defaultMessage="Overdue" />
			) : (
				<FormattedMessage id="dueDate.due" defaultMessage="Due" />
			)} {formatDate(epochTime)}
		</DateContainer>
	);
};
