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
import { PureComponent, createRef } from 'react';
import { difference, differenceBy, isEqual } from 'lodash';
import { isV5 } from '@/v4/helpers/isV5';
import { dispatch } from '@/v4/modules/store';
import { DialogActions } from '@/v4/modules/dialog';
import {queuableFunction} from '../../helpers/async';

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
	issuesShapes: any[];
	risksShapes: any[];
	issuesHighlightedShapes: any[];
	risksHighlightedShapes: any[];
	ticketPins: any;
}

export class ViewerCanvas extends PureComponent<IProps, any> {
	private containerRef = createRef<HTMLDivElement>();

	private handleUnityError = (message: string, reload: boolean, isUnity: boolean) => {
		let errorType = '3D Repo Error';

		if (isUnity) {
			errorType = 'Unity Error';
		}

		dispatch(DialogActions.showDialog({
			title: errorType,
			content: message,
			onCancel: () => {
				if (reload) {
					location.reload();
				}
			}
		}));

		console.error('Unity errored and user canceled reload', message);
	}

	constructor(props) {
		super(props);
		this.renderMeasurements = queuableFunction(this.renderMeasurements, this);
	}

	public get shouldBeVisible() {
		return this.props.location.pathname.includes(ROUTES.VIEWER);
	}

	public componentDidMount() {
		const { viewer } = this.props;
		viewer.setupInstance(this.containerRef.current, this.handleUnityError);
		if (isV5()) {
			viewer.setBackgroundColor([0.949, 0.965, 0.988, 1])
		}
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

	public async renderMeasurements(prev: any[], curr: any[]) {
		const { viewer } = this.props;

		const toAdd = differenceBy(curr, prev, 'uuid', 'color');
		const toRemove = differenceBy(prev, curr, 'uuid', 'color');

		await viewer.removeMeasurements(toRemove);
		await viewer.addMeasurements(toAdd, true);
	}

	public async renderMeasurementsHighlights(prev: any[], curr: any[]) {
		const { viewer } = this.props;

		const toAdd = difference(curr, prev);
		const toRemove = difference(prev, curr);

		await viewer.deselectMeasurements(toRemove);
		await viewer.selectMeasurements(toAdd);
	}

	public async componentDidUpdate(prevProps: IProps) {
		const { colorOverrides, issuePins, riskPins, measurementPins, hasGisCoordinates,
			gisCoordinates, gisLayers, transparencies, transformations: transformation,
			sequenceHiddenNodes, viewerManipulationEnabled, viewer,
			issuesShapes, issuesHighlightedShapes, risksShapes, risksHighlightedShapes,
			ticketPins
		} = this.props;

		if (prevProps.transparencies && !isEqual(prevProps.sequenceHiddenNodes, sequenceHiddenNodes)) {
			this.props.handleTransparenciesVisibility(sequenceHiddenNodes);
		}

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

		if (!isEqual(ticketPins, prevProps.ticketPins)) {
			this.renderPins(prevProps.ticketPins, ticketPins);
		}

		if (hasGisCoordinates && !isEqual(prevProps.gisCoordinates, gisCoordinates)) {
			this.renderGisCoordinates(gisCoordinates);
		}

		if (hasGisCoordinates && !isEqual(prevProps.gisLayers, gisLayers)) {
			this.renderGisLayers(prevProps.gisLayers, gisLayers);
		}

		if (!isEqual(prevProps.issuesShapes, issuesShapes)) {
			await this.renderMeasurements(prevProps.issuesShapes, issuesShapes);
		}

		if (!isEqual(prevProps.issuesHighlightedShapes, issuesHighlightedShapes)) {
			await this.renderMeasurementsHighlights(prevProps.issuesHighlightedShapes, issuesHighlightedShapes);
		}

		if (!isEqual(prevProps.risksShapes, risksShapes)) {
			await this.renderMeasurements(prevProps.risksShapes, risksShapes);
		}

		if (!isEqual(prevProps.risksHighlightedShapes, risksHighlightedShapes)) {
			await this.renderMeasurementsHighlights(prevProps.risksHighlightedShapes, risksHighlightedShapes);
		}

		if (prevProps.viewerManipulationEnabled !== viewerManipulationEnabled) {
			if (viewerManipulationEnabled) {
				viewer.setNavigationOn();
			} else {
				viewer.setNavigationOff();
			}
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
