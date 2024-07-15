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

import { isApiUrl } from '@/v5/services/api/default';
import { downloadAuthUrl } from './authenticatedResource.hooks';


export const AuthAnchor = (props: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>) => {
	const a = document.createElement('a');
	a.download = props.download;
	
	const onClick = async (e) => {
		if (!isApiUrl(props.href)) return;
		e.preventDefault();

		if (!a.href) {
			a.href = await downloadAuthUrl(props.href);
		}

		a.click();
	};

	return (
		<a {...props} onClick={onClick} /> 
	);
};

