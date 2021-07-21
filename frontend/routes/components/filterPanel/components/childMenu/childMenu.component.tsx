/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import List from '@material-ui/core/List';

import { renderWhenTrue } from '../../../../../helpers/rendering';
import { Wrapper } from './childMenu.styles';

interface IProps {
	item: any;
	renderItem: (subItem) => React.ReactNode;
}

export const ChildMenu = ({ item, renderItem }: IProps) => {
	const [top, setTop] = React.useState(0);
	const wrapperRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		const rect = wrapperRef.current.getBoundingClientRect();

		if (rect.top !== top) {
			setTop(Math.floor(rect.top));
		}
	}, [wrapperRef]);

	return (
		<Wrapper top={top} ref={wrapperRef}>
			{renderWhenTrue(() => (
				<List>{item.values.map(renderItem)}</List>
			))(!!top)}
		</Wrapper>
	);
};
