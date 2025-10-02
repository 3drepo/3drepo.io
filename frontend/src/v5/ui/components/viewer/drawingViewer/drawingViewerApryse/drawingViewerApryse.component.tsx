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
import { SnapHelper, SnapResults } from '../snapping/types';
import { Vector2Like } from 'three';
import { PanZoomHandler } from '../panzoom/centredPanZoom';
import { clientConfigService } from '@/v4/services/clientConfig';

// (webviewer-core.min.js will load the Core library into window when it is
// added)
declare global {
	interface Window {
		Core: typeof Core;
	}
}

export type DrawingViewerApryseType = ZoomableImage & SnapHelper & PanZoomHandler;

// When a document zooms, the Apryse SDK will build a new canvas at the native
// zoom level, append it to the page section created in createPageSections and
// then call pageComplete. The following type tracks the page section(s) across
// this process.

class PageSectionReferences {
	// The page section that is currently drawn on top - this is either the latest
	// element rendered by the SDK, or the previous one that is acting as a
	// placeholder while the new one is being drawn. This is what the user sees.

	active: HTMLElement;

	// The page section created to hold the render. This is updated between calls
	// to zoom and the resulting pageComplete. It will eventually become the
	// the active element.

	pending: HTMLElement;

	// The scale at which the active element was originally rendered at.

	scale: number;

	constructor() {
		this.active = null;
		this.pending = null;
		this.scale = 1;
	}

	// Removes all sections and references - this should be called when the
	// document is unloaded/reloaded.

	reset() {
		if (this.active) {
			this.active.remove();
			this.active = null;
		}
		if (this.pending) {
			this.pending.remove();
			this.pending = null;
		}
	}
}

// Presents the Apryse viewer as a drawing viewer Component that can be
// integrated into the 2D Viewer.

export const DrawingViewerApryse = forwardRef<DrawingViewerApryseType, DrawingViewerImageProps>(({ onLoad, src }, ref) => {
	const viewer = useRef(null);
	const scrollView = useRef(null);
	const documentViewer = useRef(null);
	const pageContainerRef = useRef(null);
	const pageSectionReferences = useRef<PageSectionReferences>(new PageSectionReferences());
	const snapModes = useRef(null);
	const offset = useRef({ x: 0, y: 0 }); // Stores the offset of the document in the container. The scale should come from the documentviewer.
	const placeholder = useRef<HTMLElement>();

	// Gets the full image as a blob that can be loaded into another image
	// source, regardless of the current transformation.

	const getImageSrc = async () => {
		const p = new Promise((resolve) => {
			// The reason for building the response this way round is that the
			// document may be unloaded while canvas is rasterised, so we can't
			// guarantee we can get the width and height later.
			const response = getPageSize() as any;
			documentViewer.current.getDocument().loadCanvas({
				pageNumber: 1,
				zoom: 1,
				drawComplete: async (imageCanvas) => {
					imageCanvas.toBlob( (blob) => {
						response.src = URL.createObjectURL(blob);
						resolve(response);
					});
				},
			});
		});
		documentViewer.current.pendingTasks.push(p);
		return p;
	};

	const getPageSize = () => {
		return {
			width: documentViewer.current.getPageWidth(1),
			height: documentViewer.current.getPageHeight(1),
		};
	};

	// snap is the implementation for ISnapHandler.

	// For snapping, mousePos should be in viewer coordinates (i.e. coordinates
	// within the 2D overlay). https://docs.apryse.com/web/guides/coordinates.
	// Currently, this means we do not support rotating pages, which is a
	// feature of Apryse. To do this, we would need to introduce the concept of
	// document coordinates vs mouse coordinates to the viewer2D component.

	const snap = (mousePos: Vector2Like, radius: number): Promise<SnapResults> => {
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

	// Creates the HTML Elements that will hold the canvas and other nodes
	// built by Apryse to render the PDF. These elements must be parented
	// and identified as follows, but otherwise have flexibility in their
	// display.

	function createPageSection(docViewer: Core.DocumentViewer, pageNumber, pageHeight, pageWidth) {
		// We ignore the margin set in the document viewer, because it resets
		// when loading documents. If we start to use other transforms from the
		// document viewer that include it, then we may need to add it to the
		// pageSection and then take it into account in the window transforms.

		const pageSection = document.createElement('div');
		pageSection.id = `pageSection${pageNumber}`;
		pageSection.style.width = `${Math.floor(pageWidth * docViewer.getZoomLevel())}px`;
		pageSection.style.height = `${Math.floor(pageHeight * docViewer.getZoomLevel())}px`;
		pageSection.style.position = 'absolute';
		pageSection.style.transform = `translateX(${offset.current.x}px) translateY(${offset.current.y}px)`;

		pageSectionReferences.current.pending = pageSection;

		const pageContainer = document.createElement('div');
		pageContainer.id = `pageContainer${pageNumber}`;
		pageContainer.classList.add('pageContainer');
		pageContainer.style.zIndex = '1';
		pageContainer.style.width = `${Math.floor(pageWidth * docViewer.getZoomLevel())}px`;
		pageContainer.style.height = `${Math.floor(pageHeight * docViewer.getZoomLevel())}px`;

		pageSection.appendChild(pageContainer);

		pageContainerRef.current = pageContainer;

		const viewerElement = docViewer.getViewerElement();
		viewerElement.append(pageSection);
	}

	const getDrawingPositionInWindow = () => {
		const rect = scrollView.current.getBoundingClientRect();
		return {
			x: window.pageXOffset + rect.left + offset.current.x,
			y: window.pageYOffset + rect.top + offset.current.y,
		};
	};

	// In order to use our own navigation, we create a Custom Display Mode.
	// A Custom Display Mode allows fine control over where the rendered PDF
	// appears through a set of mapping functions & control over the page's
	// elements. With this display mode, we can introduce our own offsets into
	// these functions in order to set the position exactly.

	const createDisplayMode = (core: typeof Core, docViewer: Core.DocumentViewer) => {
		const displayMode = new core.DisplayMode(docViewer, core.DisplayModes.Custom, true);

		// @ts-ignore: setCustomFunctions type def doesn't currently have the argument
		displayMode.setCustomFunctions({
			pageToWindow: function (pagePt) {
				const zoom = docViewer.getZoomLevel();

				const scaledPt = {
					x: pagePt.x * zoom,
					y: pagePt.y * zoom,
				};

				const windowPosition = getDrawingPositionInWindow();

				const x = windowPosition.x + scaledPt.x;
				const y = windowPosition.y + scaledPt.y;

				return { x, y };
			},

			windowToPage: function (windowPt, pageNumber) {
				const windowPosition = getDrawingPositionInWindow();

				const scaledPt = {
					x: windowPt.x - windowPosition.x,
					y: windowPt.y - windowPosition.y,
				};

				const zoom = docViewer.getZoomLevel();

				return {
					pageNumber,
					x: scaledPt.x / zoom,
					y: scaledPt.y / zoom,
				};
			},

			getSelectedPages: function () {
				return 1;
			},

			getVisiblePages: function () {
				return [1];
			},

			getPageTransform: function (pageNumber) {
				const page = docViewer.getDocument().getPageInfo(pageNumber);
				return {
					x: 0,
					y: 0,
					width: page.width,
					height: page.height,
				};
			},

			createPageSections: function () {
				const doc = docViewer.getDocument();
				const pageCount = docViewer.getPageCount();
				for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
					const page = doc.getPageInfo(pageNum);
					createPageSection(docViewer, pageNum, page.height, page.width);
				}
			},
		});

		docViewer.getDisplayModeManager().setDisplayMode(displayMode);
	};

	const loadDocument = useCallback(()=>{
		if (documentViewer.current) {
			documentViewer.current.closeDocument();
			pageSectionReferences.current.reset();
			if (src) {
				// The pdf is loaded asynchronously. Apryse also has its own loading
				// indicator so we could immediately call onLoad if we wanted and show
				// that instead. However, this should not be done if using our own
				// navigation, as some other references may not be set up yet...

				documentViewer.current.loadDocument(src, { extension: 'pdf' }).then(onLoad);
			}
		}
	}, [src, onLoad]);

	// The Apryse viewer has a number of dependencies that are loaded globally.
	// These next functions take care of these and ensure they are only loaded
	// once.

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

	const startLibraries = async () => {
		const core = window.Core as typeof Core & { PDFNetRunning: boolean };
		if (!core.PDFNetRunning) {
			core.setWorkerPath('/lib/webviewer/core');

			// This next snippet is concerned with PDFNet initialises the
			// fullAPI, which is required for snapping...

			async function main() {
				const doc = await core.PDFNet.PDFDoc.create();
				doc.initSecurityHandler();
				doc.lock();
			}

			const { apryseLicense } = clientConfigService;
			if (!apryseLicense) {
				console.error('Invalid licence for Apryse WebViewer. Cannot load PDF viewer.');
				return;
			}

			await core.PDFNet.runWithCleanup(
				main,
				apryseLicense,
			);
			core.PDFNetRunning = true;
		}
	};

	const loadDependencies = async () => {
		// core defines a namespace that PDFNet depends on, so must be loaded first.
		await loadScript('/lib/webviewer/core/webviewer-core.min.js');
		await loadScript('/lib/webviewer/core/pdf/PDFNet.js');
		await startLibraries();
	};

	useEffect(() => {
		loadDependencies().then(async () => {
			const core = window.Core;

			// When using a custom UI, we must provide the DOM elements for the
			// (scrolling) container and the container of the document (which will
			// be transformed underneath the scroll view). These are the ones we
			// create for the Component.

			// The scroll view should be the ImageContainer of the viewer2D
			// component, so that the same container emits events for all viewers.

			scrollView.current = viewer.current.parentElement;

			// The scroll view must have the overflow mode set to hidden for the
			// viewer to work correctly - if the element is created outside this
			// component, ensure that this property is set...

			scrollView.current.style.overflow = 'hidden';

			documentViewer.current = new core.DocumentViewer();
			documentViewer.current.setScrollViewElement(scrollView.current);
			documentViewer.current.setViewerElement(viewer.current);

			// When the effect is cleaned up, disposing of the documentViewer
			// instance will wait on all the promises in this array. This allows
			// long running tasks to hold that viewer open until they are done.
			// It does not preserve documentViewer.current, or stop a new one
			// being created though, and so does not mean it is still safe to
			// call the exported methods.

			documentViewer.current.pendingTasks = [];

			// placeholder stores the element holding the page while the new one
			// is being prepared; it cannot be left under the viewer element,
			// because Apryse will delete everything under that at some point
			// between starting a render, and finalising the new elements. We
			// put the previous elements under this so they continue to be visible
			// until the new ones are ready.

			placeholder.current = document.createElement('div');
			placeholder.current.style.position = 'absolute';
			placeholder.current.style.width = '100%';
			placeholder.current.style.height = '100%';
			scrollView.current.appendChild(placeholder.current);

			createDisplayMode(core, documentViewer.current);

			// This fires when the rendering is complete. When rendering is
			// complete, the new canvases will be attached, so we can delete
			// the scaled elements from the previous render that are being used
			// as intermediates.

			documentViewer.current.addEventListener('pageComplete', () => {

				// If the page has only panned, we may not have a new canvas, in
				// which case nothing needs to happen as setTransform will have
				// updated the offset already...

				if (pageSectionReferences.current.active != pageSectionReferences.current.pending) {
					if (pageSectionReferences.current.active) {
						pageSectionReferences.current.active.remove();
					}
					pageSectionReferences.current.active = pageSectionReferences.current.pending;
					pageSectionReferences.current.scale = documentViewer.current.getZoomLevel();
				}
			});

			// This simply initialises an array of snap modes, which we do not expect
			// to change, but need the Core namespace to populate...

			snapModes.current = [
				documentViewer.current.SnapMode.PATH_ENDPOINT,
				documentViewer.current.SnapMode.LINE_INTERSECTION,
				documentViewer.current.SnapMode.POINT_ON_LINE,
			];

			loadDocument();
		});

		// Clean up function
		return () => {
			const docViewer = documentViewer.current;
			Promise.all(docViewer.pendingTasks).then(() => docViewer.closeDocument()).then(() => docViewer.dispose());
			documentViewer.current = null;
		};
	}, []);

	useEffect(loadDocument, [src]);

	(ref as any).current = {

		// This section implements ZoomableImage

		setTransform: (t: Transform) => {
			offset.current.x = t.x;
			offset.current.y = t.y;

			// Due to effects such as inertia, we may still get a few setTransform
			// events, after the viewer has been torn down...

			if (!documentViewer.current || !documentViewer.current.getDocument()) {
				return;
			}

			const shouldScale = documentViewer.current.getZoomLevel() != t.scale;

			if (shouldScale) {

				// Zooming is going to prompt a re-render, which will delete the
				// contents of viewer, so move the current page elements if
				// necessary.

				if (pageSectionReferences.current.active && pageSectionReferences.current.active.parentElement != placeholder.current) {
					placeholder.current.appendChild(pageSectionReferences.current.active);
					pageSectionReferences.current.active.style.transformOrigin = 'top left';
				}
			}

			if (pageSectionReferences.current.active) {
				const scaleChange = t.scale / pageSectionReferences.current.scale;
				pageSectionReferences.current.active.style.transform = `translateX(${offset.current.x}px) translateY(${offset.current.y}px) scale(${scaleChange})`;
			}

			if (shouldScale) {
				documentViewer.current.zoomTo(t.scale);
			} else {
				documentViewer.current.updateView();
			}
		},

		getEventsEmitter: () => {
			return scrollView.current;
		},

		getBoundingClientRect: () => {
			return pageContainerRef.current.getBoundingClientRect();
		},

		getNaturalSize: getPageSize,

		// This section implements ISnapHandler

		snap,

		// The following method is used to get the pdf as a blob for calibration
		// purposes

		getImageSrc,
	};

	 return (
		<div ref={viewer} style={{ width: '100%', height: '100%', position: 'absolute' }} />
	);
});