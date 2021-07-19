/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import { useEffect, useRef, useState } from 'react';

// Source: https://usehooks.com/useOnScreen/
export const useOnScreen = (ref, rootMargin = '0px', onlyFirstAppearing = false) => {
	// State and setter for storing whether element is visible
	const [isIntersecting, setIntersecting] = useState (false);
	const prevIsIntersecting = useRef(false);

	const handleChange = (value) => {
		if (!(onlyFirstAppearing && prevIsIntersecting.current)) {
			prevIsIntersecting.current = value;
			setIntersecting(value);
		}
	};

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				handleChange(entry.isIntersecting);
			},
			{ rootMargin }
		);

		if (ref.current) {
			observer.observe(ref.current);
		}

		return () => {
			observer.unobserve(ref.current);
		};
	}, []);

	return isIntersecting;
};
