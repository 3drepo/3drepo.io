/**
 *  Copyright (C) 2023 3D Repo Ltd
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
import { HTMLAttributes, useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { AddCircleIcon, Container, Message } from './groupOption.styles';
import { EditFederationContext } from '../../../../editFederationContext';

type GroupOptionProps = HTMLAttributes<HTMLLIElement> & {
	value: string;
	onClick: (e) => void;
};

// "props" include css styles and behaviours from Material-UI that are applied to the Option
export const GroupOption = ({ value, ...props }: GroupOptionProps) => {
	const { groups } = useContext(EditFederationContext);
	const trimmedValue = value.trim();

	const isNew = !groups.includes(trimmedValue);

	if (!groups.length && !trimmedValue) {
		return (
			<Container {...props} disabled>
				<Message>
					<FormattedMessage id="tickets.groups.field.noOptions" defaultMessage="No options" />
				</Message>
			</Container>
		);
	}

	if (!trimmedValue) return (<></>);

	return (
		<Container {...props}>
			{isNew && <AddCircleIcon />}
			<Message>{trimmedValue}</Message>
		</Container>
	);
};
