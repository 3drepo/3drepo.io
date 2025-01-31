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
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { verifyUser } from '@/v5/services/api/signup';
import { FormattedMessage } from 'react-intl';
import { formatMessage } from '@/v5/services/intl';
import { AuthForm } from '@components/authTemplate/authTemplate.styles';
import { AuthTemplate, Title, Message, BackToLogin } from './userVerification.styles';

export const UserVerification = () => {
	const [title, setTitle] = useState('');
	const [message, setMessage] = useState('');
	const { search } = useLocation();
	const searchQuery = new URLSearchParams(search);

	useEffect(() => {
		const token = searchQuery.get('token');
		const username = searchQuery.get('username');

		if (!token || !username) {
			setTitle(formatMessage({
				id: 'userVerification.alreadyVerified.title',
				defaultMessage: ' Registration could not be completed',
			}));
			setMessage(formatMessage({
				id: 'userVerification.missingParameter.message',
				defaultMessage: 'Can\'t verify: Token and/or Username not provided.',
			}));
			return;
		}

		verifyUser(token, username)
			.then(() => {
				setTitle(formatMessage({
					id: 'userVerification.success.title',
					defaultMessage: 'Registration complete',
				}));
				setMessage(formatMessage({
					id: 'userVerification.success.message',
					defaultMessage: 'Your account has been verified. You can now log in.',
				}));
			})
			.catch((e) => {
				const errorMessage = e.response?.data?.message;
				if (errorMessage === 'Already verified') {
					setTitle(formatMessage({
						id: 'userVerification.alreadyVerified.title',
						defaultMessage: 'Registration complete',
					}));
					setMessage(formatMessage({
						id: 'userVerification.alreadyVerified.message',
						defaultMessage: 'Account already verified.',
					}));
				} else if (errorMessage === 'Token is invalid or expired') {
					setTitle(formatMessage({
						id: 'userVerification.tokenInvalid.title',
						defaultMessage: ' Registration could not be completed',
					}));
					setMessage(formatMessage({
						id: 'userVerification.tokenInvalid.message',
						defaultMessage: 'Token is invalid or expired.',
					}));
				}
			});
	}, []);

	return (
		<AuthTemplate>
			<AuthForm>
				<Title>
					{title}
				</Title>
				<Message>
					{message}
				</Message>
				<BackToLogin>
					<FormattedMessage
						id="userVerification.backToLogin"
						defaultMessage="Back to login"
					/>
				</BackToLogin>
			</AuthForm>
		</AuthTemplate>
	);
};
