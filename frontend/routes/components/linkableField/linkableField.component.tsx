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

import React from 'react';
import Linkify from 'react-linkify';

interface IProps {
	children?: React.ReactChild;
	className?: string;
	style?: any;
}

export const LinkableField: React.FC<IProps> = React.forwardRef(
	({ style, className, children }: IProps, ref: React.Ref<HTMLSpanElement>) => (
		<span style={style} ref={ref} className={className}>
			<Linkify properties={{target: '_blank', rel: 'noopener noreferrer'}}>{children}</Linkify>
		</span>
	)
);
