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

import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { isNil } from 'lodash';
import { onlyText } from 'react-children-utilities';
import { Container, Tooltip } from './textOverflow.styles';

interface ITextOverflow {
	children: ReactNode;
}

export const TextOverflow = ({ children }: ITextOverflow): JSX.Element => {
	const [labelRef, setLabelRef] = useState<HTMLElement>(null);
	const [isTruncated, setIsTruncated] = useState(false);

	const checkIfTruncated = useCallback(() => {
		if (!isNil(labelRef)) {
			return labelRef.scrollWidth > labelRef.clientWidth;
		}
		return false;
	}, [labelRef, children]);

	useEffect(() => {
		setIsTruncated(checkIfTruncated());
	}, [checkIfTruncated, setIsTruncated, children]);

	return (
		<Tooltip
			title={onlyText(children)}
			style={{ pointerEvents: isTruncated ? 'all' : 'none' }}
			placement="bottom"
		>
			<Container ref={setLabelRef} isTruncated={isTruncated}>{children}</Container>
		</Tooltip>
	);
};
