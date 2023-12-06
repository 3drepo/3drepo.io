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

import TagManager from 'react-gtm-module';
import { clientConfigService } from '../../v4/services/clientConfig';

export const initializeGoogleTagManager = () => {
	const { development, gtm } = clientConfigService;

	if (!development && gtm && gtm.gtmId) {
		console.debug('Adding Google Tag Manager');
		TagManager.initialize(gtm);
	}
};