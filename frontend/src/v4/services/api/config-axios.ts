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

import { AuthActionsDispatchers, DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { formatMessage } from '@/v5/services/intl';
import axios from 'axios';

const configAxios = () => {
	axios.defaults.withCredentials = true;

	axios.interceptors.response.use(
		(response) => response,
		(error) => {
			try {
				const invalidMessages = ['Authentication error', 'You are not logged in'] as any;

				switch (error.response.status) {
					case 401:
						if (error.response.data) {
							const notLogin = !error.response.data.place.includes('/login');
							const unauthorized = invalidMessages.includes(error.response.data.message);

							const sessionHasExpired = unauthorized && notLogin;

							if (sessionHasExpired) {
								AuthActionsDispatchers.sessionExpired();
							} else {
								throw error.response;
							}
							error.handled = true;
						}
						break;
					case 403:
						DialogsActionsDispatchers.open('alert', {
							currentActions: formatMessage({
								id: 'v4.error.forbidden',
								defaultMessage: 'trying to forbidden resources',
							}),
							error,
						});
						error.handled = true;
						break;
					default:
						break;
				}

				return Promise.reject(error);
			} catch (e) {
				return Promise.reject(error);
			}
		}
	);

}

export default configAxios;
