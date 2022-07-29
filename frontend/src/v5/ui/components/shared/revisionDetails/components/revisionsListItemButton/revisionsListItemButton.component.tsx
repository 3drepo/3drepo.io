/**
 *  Copyright (C) 2021 3D Repo Ltd
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
import { SyntheticEvent } from 'react';
import { Tooltip } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { formatMessage } from '@/v5/services/intl';
import { Button, Container } from './revisionsListItemButton.styles';

type IRevisionsListItemButton= {
	status?: boolean;
	onClick?: (e: SyntheticEvent) => void;
};

export const RevisionsListItemButton = ({ status, onClick }: IRevisionsListItemButton): JSX.Element => {
	const isVoid = !!status;
	const voidStr = formatMessage({ id: 'revisionDetails.void', defaultMessage: 'void' });
	const activeStr = formatMessage({ id: 'revisionDetails.active', defaultMessage: 'active' });
	const textStatus = isVoid ? voidStr : activeStr;
	const changeToStatus = isVoid ? activeStr : voidStr;

	return (
		<Container>
			<Tooltip
				title={(
					<FormattedMessage
						id="revisionDetails.list.item.button.tooltip"
						defaultMessage={`Change to ${changeToStatus}`}
						values={{ changeToStatus }}
					/>
				)}
			>
				<Button $isVoid={isVoid} onClick={onClick}>
					{textStatus}
				</Button>
			</Tooltip>
		</Container>
	);
};
