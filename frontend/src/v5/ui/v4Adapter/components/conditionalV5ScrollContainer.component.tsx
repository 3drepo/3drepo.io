/**
 *  Copyright (C) 2022 3D Repo Ltd
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
import { forwardRef } from 'react';
import { ScrollbarProps } from 'react-custom-scrollbars';
import { isV5 } from '@/v4/helpers/isV5';
import { ConditionalV5ScrollContainerBase } from './conditionalV5ScrollContainer.styles';

export const ConditionalV5ScrollContainer = forwardRef(({ children, ...props }: ScrollbarProps, ref: any) => {
	if (isV5()) {
		return (
			<ConditionalV5ScrollContainerBase {...props} ref={ref}>
				{children}
			</ConditionalV5ScrollContainerBase>
		);
	}
	return <div ref={ref}>{children}</div>;
});
