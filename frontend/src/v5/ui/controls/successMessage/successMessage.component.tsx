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

import { FormattedMessage } from 'react-intl';
import TickIcon from '@assets/icons/outlined/fat_tick-outlined.svg';
import { Typography } from '@controls/typography';
import { PostSubmitSuccessfulMessage, IconContainer } from './successMessage.styles';

type SuccessMessageProps = {
	children: any;
	className?: string;
};
export const SuccessMessage = ({ children, className }: SuccessMessageProps) => (
	<PostSubmitSuccessfulMessage className={className}>
		<IconContainer>
			<TickIcon />
		</IconContainer>
		<Typography variant="h5">
			<FormattedMessage
				id="successfulMessage.title"
				defaultMessage="Success!"
			/>
		</Typography>
		<span />
		<Typography variant="body1">{children}</Typography>
	</PostSubmitSuccessfulMessage>
);
