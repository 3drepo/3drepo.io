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
import { FormattedMessage } from 'react-intl';
import { Gap, Link } from './unexpectedError.styles';

type UnexpectedErrorProps = {
	gapTop?: boolean,
};

export const UnexpectedError = ({ gapTop }: UnexpectedErrorProps) => (
	<>
		{gapTop && <Gap />}
		<ErrorMessage>
			<FormattedMessage
				id="editProfile.form.error.unexpected"
				defaultMessage="An unexpected error has occurred. Please try again later."
			/>
			<Gap />
			<FormattedMessage
				id="editProfile.form.error.unexpected.contactSupport"
				defaultMessage="If the error persists, please {contactSupport}."
				values={{
					contactSupport: (
						<Link to={{ pathname: 'https://3drepo.com/contact/' }}>
							<FormattedMessage
								id="editProfile.form.error.contactSupport"
								defaultMessage="contact the support"
							/>
						</Link>
					),
				}}
			/>
		</ErrorMessage>
	</>
);
