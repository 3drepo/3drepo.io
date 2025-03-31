/**
 *  Copyright (C) 2025 3D Repo Ltd
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
import { formatMessage } from '@/v5/services/intl';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { AuthModal } from './authenticatingModal.styles';

export const AuthenticatingModal = ({ onClickClose }) => {
	const currentLocation = useLocation();
	const initialLocation = useRef(currentLocation);

	useEffect(() => {
		if (currentLocation.pathname !== initialLocation.current.pathname) onClickClose();
	}, [currentLocation]);

	return (
		<AuthModal
			disableClose
			open
			title={formatMessage({
				id: 'unauthorizedModal.unauthTeamspace.header',
				defaultMessage: 'Teamspace Authentication',
			})}
			message={formatMessage({
				defaultMessage: "We're authenticating you against this teamspace, this may take a few seconds",
				id: 'unauthorizedModal.unauthTeamspace.description',
			})}
		/>
	);
};