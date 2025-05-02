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

import { ReactNode, useCallback, useEffect, useState, useRef } from 'react';
import { WindowEventListener } from '@/v4/helpers/windowEventListener';
import { onlyText } from 'react-children-utilities';

import { Container, Tooltip } from './textOverflow.styles';

interface ITextOverflow {
	lines?: number;
	tooltipText?: string;
	children: ReactNode;
	className?: string;
	onClick?: () => void;
}

export const TextOverflow = ({ children, className, tooltipText, lines, onClick }: ITextOverflow): JSX.Element => {
	const ref = useRef(null);
	const [isTruncated, setIsTruncated] = useState(false);

	const checkIfTruncated = useCallback(() => {
		if (!ref.current) return false;

		const { current } = ref;
		return current.scrollWidth > current.clientWidth || current.scrollHeight > current.clientHeight;
	}, [children]);

	useEffect(() => {
		setIsTruncated(checkIfTruncated());
	}, [checkIfTruncated, setIsTruncated, children]);
	
	useEffect(() => {
		if (!ref.current) return;
		const resizeObserver = new ResizeObserver(() => {
			setIsTruncated(checkIfTruncated());
		});
		resizeObserver.observe(ref.current);
		return () => resizeObserver.disconnect();
	}, [checkIfTruncated]);

	return (
		<>
			<Tooltip
				title={tooltipText || onlyText(children)}
				style={{ pointerEvents: (isTruncated || !onClick) ? 'all' : 'none' }}
				placement="bottom"
			>
				<Container ref={ref} lines={lines} className={className} onClick={onClick}>
					{children}
				</Container>
			</Tooltip>
			<WindowEventListener event="resize" onEventTriggered={() => setIsTruncated(checkIfTruncated())} />
		</>
	);
};
