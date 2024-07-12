/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { clientConfigService } from '@/v4/services/clientConfig';
import { downloadUrl } from './authenticatedResource.hooks';

const isApiRequest = (url) => {
	const apiUrl = clientConfigService.apiUrl('all', '');
	return url.includes(apiUrl);
};


export const AuthAnchor = (props: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>) => {
	const a = document.createElement('a');
	a.download = props.download;
	
	const onClick = async (e) => {
		if (!isApiRequest(props.href)) return;
		e.preventDefault();

		if (!a.href) {
			a.href = await downloadUrl(props.href);
		}

		a.click();
	};

	return (
		<a {...props} onClick={onClick} /> 
	);
};

