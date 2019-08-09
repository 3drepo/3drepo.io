/**
 *  Copyright (C) 2019 3D Repo Ltd
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

import React, { useEffect, useRef } from 'react';

import { usePrevious } from '../../hooks';
import { Container } from './viewerCanvas.styles';

interface IProps {
	className?: string;
	viewer: any;
	match: {
		params: {
			model: string;
			teamspace: string;
			revision?: string;
		}
	};
	colorOverrides: any;
	handleColorOverridesChange: (currentOvverides, previousOverrides) => void;
}

export const ViewerCanvas = (props: IProps) => {
	const containerRef = useRef();
	const previousColorOverrides = usePrevious(props.colorOverrides);

	useEffect(() => {
		const { viewer } = props;
		viewer.setupInstance(containerRef.current);
	}, [containerRef.current]);

	useEffect(() => {
		if (props.colorOverrides !== previousColorOverrides && previousColorOverrides) {
			props.handleColorOverridesChange(props.colorOverrides, previousColorOverrides);
		}
	}, [props.colorOverrides]);

	return (
		<Container
			id="viewer"
			ref={containerRef}
			className={props.className}
		/>
	);
};
