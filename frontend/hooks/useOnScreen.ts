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
