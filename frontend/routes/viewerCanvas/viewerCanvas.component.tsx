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

import { isEqual } from 'lodash';
import React from 'react';
import { ROUTES } from '../../constants/routes';
import { pinsDiff } from '../../helpers/pins';
import { Container } from './viewerCanvas.styles';

interface IProps {
	location: any;
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
	issuePins: any[];
	riskPins: any[];
	handleColorOverridesChange: (currentOvverides, previousOverrides) => void;
}

export class ViewerCanvas extends React.PureComponent<IProps, any> {
	private containerRef = React.createRef<HTMLElement>();

	public get shouldBeVisible() {
		return this.props.location.pathname.includes(ROUTES.VIEWER);
	}

	public componentDidMount() {
		const { viewer } = this.props;
		viewer.setupInstance(this.containerRef.current);
	}

	public renderPins(prev, curr) {
		if (this.shouldBeVisible) {
			const { viewer } = this.props;

			const toAdd = pinsDiff(curr, prev);
			const toRemove = pinsDiff(prev, curr);

			toRemove.forEach(viewer.removePin.bind(viewer));
			toAdd.forEach(viewer.addPin.bind(viewer));
		}
	}

	public componentDidUpdate(prevProps) {
		const { colorOverrides, issuePins, riskPins, handleColorOverridesChange } = this.props;
		if (prevProps.colorOverrides && !isEqual(colorOverrides, prevProps.colorOverrides)) {
			handleColorOverridesChange(colorOverrides, prevProps.colorOverrides);
		}

		if (issuePins !== prevProps.issuePins && prevProps.issuePins) {
			this.renderPins(prevProps.issuePins, issuePins);
		}

		if (riskPins !== prevProps.riskPins && prevProps.riskPins) {
			this.renderPins(prevProps.riskPins, riskPins);
		}
	}

	public render() {
		return (
			<Container
				visible={this.shouldBeVisible}
				id="viewer"
				ref={this.containerRef}
				className={this.props.className}
			/>
		);
	}
}
