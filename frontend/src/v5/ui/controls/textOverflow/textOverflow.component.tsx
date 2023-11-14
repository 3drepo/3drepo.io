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
	children: ReactNode;
	className?: string;
	tooltipText?: string;
}

export const TextOverflow = ({ children, className, tooltipText }: ITextOverflow): JSX.Element => {
	const ref = useRef(null);
	const [isTruncated, setIsTruncated] = useState(false);

	const checkIfTruncated = useCallback(() => {
		const { current } = ref
		if (!current) return false;
		return current.scrollWidth > current.clientWidth;
	}, [children]);

	useEffect(() => {
		setIsTruncated(checkIfTruncated());
	}, [checkIfTruncated, setIsTruncated, children]);

	return (
		<>
			<Tooltip
				title={tooltipText || onlyText(children)}
				style={{ pointerEvents: isTruncated ? 'all' : 'none' }}
				placement="bottom"
			>
				<Container ref={ref} className={className}>
					{children}
				</Container>
			</Tooltip>
			<WindowEventListener event="resize" onEventTriggered={() => setIsTruncated(checkIfTruncated())} />
		</>
	);
};
