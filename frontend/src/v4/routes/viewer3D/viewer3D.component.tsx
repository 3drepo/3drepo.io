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
import { PureComponent, createRef, useContext } from 'react';
import { difference, differenceBy, isEqual } from 'lodash';
import { DialogActions } from '@/v4/modules/dialog';
import { Toolbar } from '@/v5/ui/routes/viewer/toolbar/toolbar.component';
import { CalibrationToolbar } from '@/v5/ui/routes/dashboard/projects/calibration/calibrationToolbar/calibrationToolbar.component';
import { LifoQueue } from '@/v5/helpers/functions.helpers';
import { dispatch } from '@/v5/helpers/redux.helpers';
import { CalibrationContext } from '@/v5/ui/routes/dashboard/projects/calibration/calibrationContext';
import { useViewerCalibrationSetup } from '@/v5/ui/routes/dashboard/projects/calibration/useViewerCalibrationSetup';
import {queuableFunction} from '../../helpers/async';

import { ROUTES } from '../../constants/routes';
import { addColorOverrides, overridesColorDiff, removeColorOverrides } from '../../helpers/colorOverrides';
import { pinsDiff, pinsRemoved, pinsSelectionChanged } from '../../helpers/pins';
import { moveMeshes, resetMovedMeshes, transformationDiffChanges,
transformationDiffRemoves } from '../../modules/sequences/sequences.helper';
import { ViewerService } from '../../services/viewer/viewer';
import { Calibration3DInfoBox } from './calibration3DInfoBox/calibration3DInfoBox.component';
import { ViewerContainer } from './viewer3D.styles';

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
	measurementsAngle: any[];
	measurementsArea: any[];
	measurementsLength: any[];
	transformations: any[];
	gisLayers: string[];
	hasGisCoordinates: boolean;
	gisCoordinates: any;
	handleTransparencyOverridesChange: any;
	viewerManipulationEnabled: boolean;
	isPresentationPaused: boolean;
	issuesShapes: any[];
	risksShapes: any[];
	issuesHighlightedShapes: any[];
	risksHighlightedShapes: any[];
	ticketPins: any;
	isCalibrating: boolean;
}

export class Viewer3DBase extends PureComponent<IProps, any> {
	private containerRef = createRef<HTMLDivElement>();
	public state = { updatesQueue: new LifoQueue((prevProps, currProps) => this.onComponentDidUpdate(prevProps, currProps), 1, false) };

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
	}

	public async renderGisCoordinates(coordinates) {
		const { viewer, gisLayers } = this.props;
		viewer.mapInitialise(coordinates);

		if (gisLayers.length > 0) {
			viewer.mapStop();
			await new Promise((resolve) => setTimeout(resolve, 100));
			viewer.mapStart();
		}
	}

	public async renderPins(prev, curr) {
		if (this.shouldBeVisible) {
			const { viewer } = this.props;

			const toShow = pinsDiff(curr, prev);
			const toRemove = pinsRemoved(prev, curr);
			const toChangeSelection = pinsSelectionChanged(curr, prev);

			await Promise.all([
				...toRemove.map(viewer.removePin.bind(viewer)),
				...toShow.map(viewer.showPin.bind(viewer)),
			]);

			await Promise.all(toChangeSelection.map(viewer.setSelectionPin.bind(viewer)));
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
		this.state.updatesQueue.enqueue(prevProps, this.props);
	}

	public async onComponentDidUpdate(prevProps, currProps) {
		const { colorOverrides, issuePins, riskPins, measurementPins, hasGisCoordinates,
			gisCoordinates, gisLayers, transparencies, transformations,
			viewerManipulationEnabled, viewer, issuesShapes, issuesHighlightedShapes,
			risksShapes, risksHighlightedShapes,
			ticketPins, measurementsAngle, measurementsArea, measurementsLength
		} = currProps;

		if (colorOverrides && !isEqual(colorOverrides, prevProps.colorOverrides)) {
			this.renderColorOverrides(prevProps.colorOverrides, colorOverrides);
		}

		if (transparencies && !isEqual(transparencies, prevProps.transparencies)) {
			currProps.handleTransparencyOverridesChange(transparencies, prevProps.transparencies);
		}

		if (transformations && !isEqual(transformations, prevProps.transformations)) {
			this.renderTransformations(prevProps.transformations, transformations);
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
			await this.renderPins(prevProps.ticketPins, ticketPins);
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

		if (!isEqual(prevProps.measurementsAngle, measurementsAngle)) {
			await this.renderMeasurements(prevProps.measurementsAngle, measurementsAngle);
		}

		if (!isEqual(prevProps.measurementsLength, measurementsLength)) {
			await this.renderMeasurements(prevProps.measurementsLength, measurementsLength);
		}

		if (!isEqual(prevProps.measurementsArea, measurementsArea)) {
			await this.renderMeasurements(prevProps.measurementsArea, measurementsArea);
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
			<ViewerContainer visible={this.shouldBeVisible} >
				<Calibration3DInfoBox />
				<div ref={this.containerRef} className={this.props.className} />
				{this.props.isCalibrating ? <CalibrationToolbar /> : <Toolbar />}
			</ ViewerContainer>
		);
	}
}

const getCalibrationProps = (props) => ({
	...props,
	issuePins: [],
	riskPins: [],
	measurementPins: [],
	ticketPins: [],
	measurementsArea: [],
	measurementsLength: [],
	measurementsAngle: [],
});

export const Viewer3D = (props: Omit<IProps, 'isCalibrating'>) => {
	const { isCalibrating } = useContext(CalibrationContext);
	useViewerCalibrationSetup();
	return (<Viewer3DBase {...(isCalibrating ? getCalibrationProps(props) : props)} isCalibrating={isCalibrating} />)
}
