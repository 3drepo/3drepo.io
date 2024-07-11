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

import axios from 'axios';
import { useEffect, useState } from 'react';

// It uses axios config to pass the token so images are returned safely
export const useAuthenticatedResource = (url: string, onError?) => {
	const [blobUrl, setbaseBlobUrl] = useState<string>(undefined);

	useEffect(() => {
		if (!url) return;
		let mounted = true;

		(async () => {
			try {
				const response = await axios.get(url, { responseType: 'blob' });
				const objectUrl = URL.createObjectURL(response.data);
				
				if (!mounted) return;  // to avoid changing the state in unmounted components
				setbaseBlobUrl(objectUrl);
			} catch (e) {
				onError?.(e);
			}
		})();

		return () => { mounted = false;};
	}, [url]);

	return blobUrl;
};
