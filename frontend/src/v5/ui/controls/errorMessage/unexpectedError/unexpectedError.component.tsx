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
import { ErrorMessage } from '@controls/errorMessage/errorMessage.component';
import { Gap } from '@controls/gap';
import { FormattedMessage } from 'react-intl';
import { Link } from './unexpectedError.styles';

type UnexpectedErrorProps = {
	className?: string;
};

export const UnexpectedError = ({ className }: UnexpectedErrorProps) => (
	<ErrorMessage className={className}>
		<FormattedMessage
			id="form.unexpectedError.mainMessage"
			defaultMessage="An unexpected error has occurred. Please try again later."
		/>
		<Gap $height="10px" />
		<FormattedMessage
			id="form.unexpectedError.contactSupport.message"
			defaultMessage="If the error persists, please {contactSupport}."
			values={{
				contactSupport: (
					<Link to={{ pathname: 'https://3drepo.com/contact/' }}>
						<FormattedMessage
							id="form.unexpectedError.contactSupport.link"
							defaultMessage="contact the support"
						/>
					</Link>
				),
			}}
		/>
	</ErrorMessage>
);
