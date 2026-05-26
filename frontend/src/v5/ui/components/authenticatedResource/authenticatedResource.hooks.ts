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
import { downloadAuthUrl } from '@/v5/helpers/download.helper';
import { useEffect, useState } from 'react';

// It uses axios config to pass the token so images are returned safely
export const useAuthenticatedImage = (src: string, onError?) => {
	const [blobSrc, setbaseBlobSrc] = useState<string>(undefined);

	useEffect(() => {
		if (!src) return;
		let mounted = true;

		(async () => {
			try {
				const blobUrl = await downloadAuthUrl(src);
				if (!mounted) return;  // to avoid changing the state in unmounted components
				setbaseBlobSrc(blobUrl);
			} catch (e) {
				onError?.(e);
			}
		})();

		return () => { mounted = false;};
	}, [src]);

	return blobSrc;
};
