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
import { Tooltip } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { formatMessage } from '@/v5/services/intl';
import { IButton } from '@controls/button/button.component';
import { Button, Container } from './revisionsListItemButton.styles';

import type { JSX } from "react";

type IProps = IButton & {
	status?: boolean;
};

const VOID_STATUS = formatMessage({ id: 'revisionDetails.void', defaultMessage: 'void' });
const ACTIVE_STATUS = formatMessage({ id: 'revisionDetails.active', defaultMessage: 'active' });

export const RevisionsListItemButton = ({ status: isVoid, disabled, ...props }: IProps): JSX.Element => {
	const currentStatus = isVoid ? VOID_STATUS : ACTIVE_STATUS;
	const oppositeStatus = isVoid ? ACTIVE_STATUS : VOID_STATUS;

	return (
		<Container>
			<Tooltip
				title={disabled ? '' : (
					<FormattedMessage
						id="revisionDetails.list.item.button.tooltip"
						defaultMessage="Change to {oppositeStatus}"
						values={{ oppositeStatus }}
					/>
				)}
			>
				<span>
					<Button $isVoid={isVoid} disabled={disabled} {...props}>
						{currentStatus}
					</Button>
				</span>
			</Tooltip>
		</Container>
	);
};
