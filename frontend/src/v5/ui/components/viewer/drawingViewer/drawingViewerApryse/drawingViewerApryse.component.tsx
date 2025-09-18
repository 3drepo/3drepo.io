/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { forwardRef, useEffect, useRef, useCallback } from 'react';
import { ZoomableImage, Transform } from '../zoomableImage.types';
import { DrawingViewerImageProps } from '../drawingViewerImage/drawingViewerImage.component';
import { Core } from '@pdftron/webviewer';
import { ISnapHelper, SnapResults } from '../snapping/types';
import { Vector2Like } from 'three';
import { EventEmitter } from 'eventemitter3';
import { Events } from '../panzoom/panzoom';
import { PanZoomHandler } from '../panzoom/centredPanZoom';
import { clientConfigService } from '@/v4/services/clientConfig';

// (webviewer-core.min.js will load the Core library into window when it is
// added)
declare global {
	interface Window {
		Core: typeof Core;
	}
}

export type DrawingViewerApryseType = ZoomableImage & ISnapHelper & PanZoomHandler;

export const DrawingViewerApryse = forwardRef<DrawingViewerApryseType, DrawingViewerImageProps>(({ onLoad, src }, ref) => {
	const viewer = useRef(null);
	const scrollView = useRef(null);
	const documentViewer = useRef(null);
	const pageContainer = useRef(null);
	const snapModes = useRef(null);
	const emitter = useRef(new EventEmitter());
	const minZoom = useRef(0.5);
	const maxZoom = useRef(10);

	// Should be called from inside this Component whenever the Apryse navigation
	// updates the display of the PDF.

	const emitTransformEvent = () => {
		// When the document changes position in the viewer (including zooming),
		// emit an event that notifies the 2D viewer it should update the
		// 2d overlay.
		// This is only required when using Apryse's navigation tools - if an
		// external pan zoom handler is in use, this should be disabled.

		if (scrollView.current && pageContainer.current && documentViewer.current) {
			emitter.current.emit(Events.transform);
		}
	};

	const getTransform = (): Transform => {
		const container = scrollView.current.getBoundingClientRect();
		const rect = pageContainer.current.getBoundingClientRect();
		return {
			x: rect.left - container.left,
			y: rect.top - container.top,
			scale: documentViewer.current.getZoomLevel(),
		};
	};

	const on = (event, fn) => {
		emitter.current.on(event, fn);
		emitTransformEvent();
	};

	const off = (event, fn) => {
		emitter.current.off(event, fn);
	};

	const throwPanZoomNotImplementedException = () => {
		throw new Error('The inbuilt panzoom handler of DrawingViewerApryse is read only and this method is not supported.');
	};

	// Gets the full image as a blob that can be loaded into another image
	// source, regardless of the current transformation.

	const getImageBlob = async () => {
		return new Promise((resolve) => {
			documentViewer.current.getDocument().loadCanvas({
				pageNumber: 1,
				zoom: 1,
				drawComplete: async (imageCanvas) => {
					imageCanvas.toBlob( (blob) => {
						resolve(blob);
					});
				},
			});
		});
	};

	const getPageSize = () => {
		return {
			width: documentViewer.current.getPageWidth(1),
			height: documentViewer.current.getPageHeight(1),
		}
	}

	// Multiplies the scale by factor, while keeping the image centered (if taking
	// up the whole view).

	const zoom = (factor: number) => {

		// The x,y coordinates provided to zoomTo are used to directly update
		// the scrollLeft and scrollTop position of the document. Therefore all
		// calculations should be done relative to this element (viewer), rather
		// than say, pdf coordinates, or indeed the page container - as this may
		// have padding.
		// Additionally, the parameters are what the scroll position should be
		// *after* scaling.

		const container = scrollView.current.getBoundingClientRect();
		const rect = viewer.current.getBoundingClientRect();

		// The following snippet keeps the current point below the center of the
		// viewer in the same place, where possible. It does this by getting the
		// normalised position within the document that should remain stationary.
		// After scaling the document, this can be used to get a new absolute
		// positition from which the offset to the top-left can be determined.

		const scroll = {
			x: container.left - rect.left,
			y: container.top - rect.top,
		};

		// (p is the focal point in container - the current implementation
		// assumes it is always at the center, since scrolling with the mouse
		// uses a different method, but we could place it elsewhere if desired.)

		const p = {
			x: container.width * 0.5,
			y: container.height * 0.5,
		};

		// Normalised coordinates relative to rect

		const n = {
			x: (scroll.x + p.x) / rect.width,
			y: (scroll.y + p.y) / rect.height,
		};

		const newScale = Math.max(Math.min(documentViewer.current.getZoomLevel() * factor, maxZoom.current), minZoom.current);

		const scaleChange = newScale / documentViewer.current.getZoomLevel();

		const expectedRect = {
			width: rect.width * scaleChange,
			height: rect.height * scaleChange,
		};

		// New absolute coordinates that should be under p. The offset from p
		// gives the desired scroll position.

		const x = (expectedRect.width * n.x) - p.x;
		const y = (expectedRect.height * n.y) - p.y;

		documentViewer.current.zoomTo(
			newScale,
			x,
			y,
		);
	}

	// For snapping, mousePos should be in viewer coordinates (i.e. coordinates
	// within the 2D overlay). Currently, this means we do not support rotating
	// pages, which is a feature of Apryse. To do this, we would need to introduce
	// the concept of document coordinates vs mouse coordinates to the viewer2D
	// component.

	const snap = (mousePos: Vector2Like, radius: number): Promise<SnapResults> => {

		// mousePos should be in the space of the 2D overlay, which should be
		// identical to Apryse's viewer coordinates.
		// https://docs.apryse.com/web/guides/coordinates

		return documentViewer.current.snapToNearest(1, mousePos.x, mousePos.y, snapModes.current).then((snapPos) => {
			const results = new SnapResults();
			// snapToNearest will consider the entire document, so filter
			// the results by the radius to match the expected behaviour
			// of the other viewers.
			const d = (snapPos.x - mousePos.x) * (snapPos.x - mousePos.x) + (snapPos.y - mousePos.y) * (snapPos.y - mousePos.y);
			if (d < (radius * radius)) {
				if (snapPos.modeName == 'PATH_ENDPOINT') {
					results.closestNode = snapPos;
				} else if (snapPos.modeName == 'LINE_INTERSECTION') {
					results.closestIntersection = snapPos;
				} else if (snapPos.modeName == 'POINT_ON_LINE') {
					results.closestEdge = snapPos;
				}
			}
			return results;
		});
	};

	const loadDocument = useCallback(()=>{
		if (documentViewer.current) {
			documentViewer.current.closeDocument();
			if (src) {
				// The pdf is loaded asynchronously. Apryse also has its own loading
				// indicator so we could immediately call onLoad if we wanted and show
				// that instead. However, this should not be done if using our own
				// navigation, as some other references may not be set up yet...

				documentViewer.current.loadDocument(src, { extension: 'pdf' }).then(onLoad);
			}
		}
	}, [src, onLoad]);

	const loadScript = async (uri) => {
		if (document.querySelectorAll(`script[src='${uri}']`).length) {
			return Promise.resolve();
		}
		const script = document.createElement('script');
		script.src = uri;
		document.body.appendChild(script);
		return new Promise((resolve)=>{
			script.onload = resolve;
		});
	};

	const loadDependencies = async () => {
		// core defines a namespace that PDFNet depends on, so must be loaded first.
		await loadScript('/lib/webviewer/core/webviewer-core.min.js');
		await loadScript('/lib/webviewer/core/pdf/PDFNet.js');
	};

	//#5660 need to be able to reload a drawing multiple times...
	// react is going to re-render a bunch, so perhaps change this so we only
	// re-render when the src changes...
	useEffect(() => {
		loadDependencies().then(async () => {
			const Core = window.Core as typeof Core;
			if (!Core.PDFNetRunning) {
				Core.setWorkerPath('/lib/webviewer/core');

				// The Pan tool will try to load assets at this path - though
				// they won't be visible by default, we still must change the
				// cursor explicitly if desired.

				Core.setResourcesPath('/lib/webviewer/core/assets');

				// This next snippet concerned with PDFNet initialises the fullAPI, which
				// is required for snapping...

				async function main() {
					const doc = await Core.PDFNet.PDFDoc.create();
					doc.initSecurityHandler();
					// Locks all operations on the document
					doc.lock();
				}

				const { apryseLicense } = clientConfigService;
				if (!apryseLicense) {
					console.error('Invalid licence for Apryse WebViewer. Cannot load PDF viewer.');
					return;
				}

				await Core.PDFNet.runWithCleanup(
					main,
					apryseLicense,
				);
				Core.PDFNetRunning = true;
			}

			// When using a custom UI, we must provide the DOM elements for the
			// (scrolling) container and the container of the document (which will
			// be transformed underneath the scroll view). These are the ones we
			// create for the Component.

			// The scroll view should be the ImageContainer of the viewer2D component,
			// so that the same container emits events for all viewers.

			scrollView.current = viewer.current.parentElement;

			// The scroll view must have the overflow mode set to hidden for the viewer
			// to work correctly - if the element is created outside this component,
			// ensure that this property is set..

			scrollView.current.style.overflow = 'hidden';

			documentViewer.current = new Core.DocumentViewer();
			documentViewer.current.setScrollViewElement(scrollView.current);
			documentViewer.current.setViewerElement(viewer.current);

			// At the moment, we must use Apryse's inbuilt navigation. The following
			// snippet sets this up.

			documentViewer.current.setToolMode(Core.Tools.ToolNames.PAN);
			const panTool = documentViewer.current.getTool(Core.Tools.ToolNames.PAN);

			// Forward events for the Pan Tool for Apryse's built in navigation.
			// Another possibility would be to have a modified panzoomhandler
			// forward such events, though at the moment there is no need for that
			// additional complexity.

			scrollView.current.addEventListener('mousedown', (e) => {
				panTool.mouseLeftDown(e);
			});

			scrollView.current.addEventListener('mousemove', (e) => {
				panTool.mouseMove(e);
			});

			scrollView.current.addEventListener('mouseup', (e) => {
				panTool.mouseLeftUp(e);
			});

			scrollView.current.addEventListener('wheel', (e) => {
				let scale = documentViewer.current.getZoomLevel();
				if (e.wheelDelta > 0) {
					scale = scale * 1.1;
				} else {
					scale = scale / 1.1;
				}
				const viewerRect = scrollView.current.getBoundingClientRect();
				documentViewer.current.zoomToMouse(scale, viewerRect.left, viewerRect.top);
			});

			// When using Apryse's navigation, we must tell our 2d overlay where the
			// viewBox is whenever it changes.

			documentViewer.current.addEventListener('zoomUpdated', emitTransformEvent);
			scrollView.current.addEventListener('scroll', emitTransformEvent);

			// When the drawing is zoomed, the DOM for the page may be recreated,
			// so update the reference we have for this.

			documentViewer.current.addEventListener('pageComplete', () => {
				pageContainer.current = document.getElementById('pageContainer1');
				emitTransformEvent();
			});

			// This simply initialises an array of snap modes, which we do not expect
			// to change, but need the Core namespace to populate.

			snapModes.current = [
				documentViewer.current.SnapMode.PATH_ENDPOINT,
				documentViewer.current.SnapMode.LINE_INTERSECTION,
				documentViewer.current.SnapMode.POINT_ON_LINE,
			];

			loadDocument();
		});

		// Clean up function
		return () => {
			documentViewer.current.closeDocument();
			documentViewer.current.dispose();
		}
	}, []);

	useEffect(loadDocument, [src]);

	(ref as any).current = {

		// This section implements ZoomableImage

		setTransform: (transform: Transform) => {
			// Currently, there is no known way to set the transform of a document
			// in the Apryse WebSDK, so navigation must be controlled by the
			// Apryse viewer.
			// See: https://community.apryse.com/t/simplest-way-to-set-the-exact-position-offset-of-a-page-within-the-scroll-view/11932
		},

		getEventsEmitter: () => {
			return scrollView.current;
		},

		getBoundingClientRect: () => {
			return pageContainer.current.getBoundingClientRect();
		},

		getNaturalSize: getPageSize,

		// This section implements ISnapHandler

		snap,

		// This section implements PanZoom/PanZoomHandler. As the transform of the
		// in-built handler is read-only, only a subset of methods are implemented,
		// and attempting to call any outside of these will result in an exception.

		getTransform,
		
		on,
		
		off,

		dispose: () => {},

		smoothZoom: throwPanZoomNotImplementedException,

		smoothSetTransform: throwPanZoomNotImplementedException,

		moveTo: throwPanZoomNotImplementedException,

		setMinZoom: throwPanZoomNotImplementedException,

		getMinZoom: () => {
			return minZoom.current;
		},

		getMaxZoom: () => {
			return maxZoom.current;
		},

		zoom,

		//#5660 zooming does zoom to center of image atm.
		zoomIn: () => {
			zoom(1.5);
		},

		zoomOut: () => {
			zoom(1 / 1.5);
		},

		getOriginalSize: getPageSize,

		centreView: () => {
			documentViewer.current.setFitMode(documentViewer.current.FitMode.FitPage);
		},

		// The following method is used to get the pdf as a blob for calibration
		// purposes

		getImageBlob,
	};

	 return (
		<div id='apryse-repo-viewer' ref={viewer}></div>
	);
});