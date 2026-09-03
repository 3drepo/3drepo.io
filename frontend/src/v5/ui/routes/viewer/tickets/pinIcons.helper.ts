/**
 *  Copyright (C) 2026 3D Repo Ltd
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

import DOMPurify from 'dompurify';
import { getUrl } from '@/v5/services/api/default';
import { downloadAuthUrl } from '@/v5/helpers/download.helper';
import { getState } from '@/v5/helpers/redux.helpers';
import { selectCurrentTeamspace } from '@/v5/store/teamspaces/teamspaces.selectors';

// Cache resolved (sanitized) SVG text by URL so repeated lookups of the same
// icon don't refetch it.
const embeddedPinCache: Record<string, Promise<string>> = {};

const fetchSvgText = async (url: string): Promise<string> => {
	const authSrc = await downloadAuthUrl(url);
	const res = await fetch(authSrc);
	const text = await res.text();
	return DOMPurify.sanitize(text);
};

const getPinIconUrl = (teamspace: string, icon: string, selected: boolean) => getUrl(
	`teamspaces/${teamspace}/settings/tickets/pinIcons/${icon}/${selected ? 'selected' : 'normal'}`,
);

/**
 * Returns a promise of the sanitized, embeddable SVG markup for a custom pin
 * icon uploaded to the backend. If `selected` is true it will attempt to load
 * the icon's `selected.svg` version, falling back to `normal.svg` if that
 * fails to load.
 */
export const getEmbeddedPin = (teamspace: string, icon: string, selected: boolean = false): Promise<string> => {
	const normalUrl = getPinIconUrl(teamspace, icon, false);

	if (!selected) {
		embeddedPinCache[normalUrl] ??= fetchSvgText(normalUrl);
		return embeddedPinCache[normalUrl];
	}

	const selectedUrl = getPinIconUrl(teamspace, icon, true);
	embeddedPinCache[selectedUrl] ??= fetchSvgText(selectedUrl).catch(() => {
		embeddedPinCache[normalUrl] ??= fetchSvgText(normalUrl);
		return embeddedPinCache[normalUrl];
	});
	return embeddedPinCache[selectedUrl];
};

const loadImage = (src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
	const img = new Image();
	img.onload = () => {
		const { naturalWidth, naturalHeight } = img;

		// Unity viewer does not do AA on the pin, The size of the image needs to be appropriate for the size.
		// approximately 48x48 is the target size for pin icon with 1.8 scale (which is the current default)
		const scale = 48 / Math.max(naturalWidth, naturalHeight);

		img.width = Math.round(naturalWidth * scale);
		img.height = Math.round(naturalHeight * scale);

		resolve(img);
	};

	img.onerror = reject;
	img.src = src;
	return img;
});

// Cache the [normal, selected] loaded HTMLImageElement pair per icon so
// repeated calls (e.g. re-dropping the same pin) don't refetch/reload them.
const pinImagesCache: Record<string, Promise<[HTMLImageElement, HTMLImageElement]>> = {};

/**
 * Returns a promise of the loaded [normal, selected] images for a custom pin
 * icon uploaded to the backend, ready to be passed to UnityUtil.createPinIcon.
 */
export const getPinImages = (icon: string): Promise<[HTMLImageElement, HTMLImageElement]> => {
	const teamspace = selectCurrentTeamspace(getState());

	pinImagesCache[icon] ??= (async () => {
		const normalUrl = getPinIconUrl(teamspace, icon, false);
		const selectedUrl = getPinIconUrl(teamspace, icon, true);

		const [normalSrc, selectedSrc] = await Promise.all([
			downloadAuthUrl(normalUrl),
			downloadAuthUrl(selectedUrl).catch(() => downloadAuthUrl(normalUrl)),
		]);

		return Promise.all([loadImage(normalSrc), loadImage(selectedSrc)]) as Promise<[HTMLImageElement, HTMLImageElement]>;
	})();

	return pinImagesCache[icon];
};
