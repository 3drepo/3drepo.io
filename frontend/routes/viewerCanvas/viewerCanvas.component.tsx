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

import { difference, isEqual } from 'lodash';

import { ROUTES } from '../../constants/routes';
import { addColorOverrides, overridesColorDiff, removeColorOverrides } from '../../helpers/colorOverrides';
import { pinsDiff } from '../../helpers/pins';
import { PresentationMode } from '../../modules/presentation/presentation.constants';
import { moveMeshes, resetMovedMeshes, transformationDiffChanges,
transformationDiffRemoves } from '../../modules/sequences/sequences.helper';
import { ViewerService } from '../../services/viewer/viewer';
import { Border, Container } from './viewerCanvas.styles';

interface IProps {
	location: any;
	className?: string;
	viewer: ViewerService;
	match: {
		params: {
			model: string;
			teamspace: string;
			revision?: string;
		}
	};
	colorOverrides: any;
	transparencies: any;
	issuePins: any[];
	riskPins: any[];
	measurementPins: any[];
	transformations: any[];
	gisLayers: string[];
	sequenceHiddenNodes: string[];
	hasGisCoordinates: boolean;
	gisCoordinates: any;
	handleTransparencyOverridesChange: any;
	viewerManipulationEnabled: boolean;
	presentationMode: PresentationMode;
	isPresentationPaused: boolean;
	handleTransparenciesVisibility: any;
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

	public renderGisCoordinates(coordinates) {
		const { viewer, gisLayers } = this.props;
		viewer.mapInitialise(coordinates);

		if (gisLayers.length > 0) {
			viewer.mapStop();
			viewer.mapStart();
		}
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

	public renderColorOverrides(prev, curr) {
		const toAdd = overridesColorDiff(curr, prev);
		const toRemove = overridesColorDiff(prev, curr);

		removeColorOverrides(toRemove);
		addColorOverrides(toAdd);
	}

	public renderTransformations(prev, curr) {
		const changes = transformationDiffChanges(prev, curr);
		const removes = transformationDiffRemoves(prev, curr);

		moveMeshes(changes);
		resetMovedMeshes(removes);
	}

	public renderGisLayers(prev: string[], curr: string[]) {
		const { viewer } = this.props;
		const toAdd = difference(curr, prev);
		const toRemove = difference(prev, curr);

		toAdd.forEach(viewer.addMapSource.bind(viewer));
		toRemove.forEach(viewer.removeMapSource.bind(viewer));

		if (curr.length === 0) {
			viewer.mapStop();
		}

		if (prev.length === 0 && curr.length > 0) {
			viewer.mapStart();
		}

	}

	public componentDidUpdate(prevProps: IProps) {
		const { colorOverrides, issuePins, riskPins, measurementPins, hasGisCoordinates,
			gisCoordinates, gisLayers, transparencies, transformations: transformation,
			sequenceHiddenNodes, viewerManipulationEnabled, viewer
		} = this.props;

		if (prevProps.colorOverrides && !isEqual(colorOverrides, prevProps.colorOverrides)) {
			this.renderColorOverrides(prevProps.colorOverrides, colorOverrides);
		}

		if (prevProps.transparencies && !isEqual(transparencies, prevProps.transparencies)) {
			this.props.handleTransparencyOverridesChange(transparencies, prevProps.transparencies);
		}

		if (prevProps.transformations && !isEqual(transformation, prevProps.transformations)) {
			this.renderTransformations(prevProps.transformations, transformation);
		}

		if (!isEqual(issuePins, prevProps.issuePins)) {
			this.renderPins(prevProps.issuePins, issuePins);
		}

		if (!isEqual(riskPins, prevProps.riskPins)) {
			this.renderPins(prevProps.riskPins, riskPins);
		}

		if (!isEqual(measurementPins, prevProps.measurementPins)) {
			this.renderPins(prevProps.measurementPins, measurementPins);
		}

		if (hasGisCoordinates && !isEqual(prevProps.gisCoordinates, gisCoordinates)) {
			this.renderGisCoordinates(gisCoordinates);
		}

		if (hasGisCoordinates && !isEqual(prevProps.gisLayers, gisLayers)) {
			this.renderGisLayers(prevProps.gisLayers, gisLayers);
		}

		if (prevProps.viewerManipulationEnabled !== viewerManipulationEnabled) {
			if (viewerManipulationEnabled) {
				viewer.setNavigationOn();
			} else {
				viewer.setNavigationOff();
			}
		}
		if (prevProps.transparencies && !isEqual(prevProps.sequenceHiddenNodes, sequenceHiddenNodes)) {
			this.props.handleTransparenciesVisibility(sequenceHiddenNodes);
		}
	}

	public render() {
		return (
			<>
				<Container
					visible={this.shouldBeVisible}
					id="viewer"
					ref={this.containerRef}
					className={this.props.className}
				/>
				<Border
					presentationMode={this.props.presentationMode}
					isPresentationPaused={this.props.isPresentationPaused}
				/>
			</>
		);
	}
}
