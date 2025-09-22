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

// When a document zooms, the Apryse SDK will build a new canvas at the native
// zoom level, append it to the page section created in createPageSections and
// then call pageComplete. The following type tracks the page section(s) across
// this process.

class PageSectionReferences {
	// The page section that is currently drawn on top - this is either the latest
	// element rendered by the SDK, or the previous one that is acting as a
	// placeholder while the new one is being drawn.

	active: HTMLElement;

	// The page section created to hold the render. This is updated between calls
	// to zoom and the resulting pageComplete. It will eventually become the
	// the active element.

	pending: HTMLElement;

	// The scale at which the active element was rendered at.

	scale: number;

	constructor() {
		this.active = null;
		this.pending = null;
		this.scale = 1;
	}

	// Removes all sections and references - this should be called when the
	// document is reloaded.

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

export const DrawingViewerApryse = forwardRef<DrawingViewerApryseType, DrawingViewerImageProps>(({ onLoad, src }, ref) => {
	const viewer = useRef(null);
	const scrollView = useRef(null);
	const documentViewer = useRef(null);
	const pageContainerRef = useRef(null);
	const pageSectionReferences = useRef<PageSectionReferences>(new PageSectionReferences());
	const snapModes = useRef(null);
	const offset = useRef({x: 0, y: 0}); // Stores the offset of the document in the container. The scale should come from the documentviewer.
	const placeholder = useRef<HTMLElement>();

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

	function createPageSection(docViewer: Core.DocumentViewer, pageNumber, pageHeight, pageWidth) {
		const pageSection = document.createElement('div');
		pageSection.id = `pageSection${pageNumber}`;
		pageSection.style.width = `${Math.floor(pageWidth * docViewer.getZoomLevel())}px`;
		pageSection.style.height = `${Math.floor(pageHeight * docViewer.getZoomLevel())}px`;
		pageSection.style.margin = `${docViewer.getMargin()}px`;
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
	}

	const createDisplayMode = (core: typeof Core, docViewer: Core.DocumentViewer) => {
		const displayMode = new core.DisplayMode(docViewer, core.DisplayModes.Custom, true);

		docViewer.setMargin(0);

		// @ts-ignore: setCustomFunctions type def doesn't currently have the argument
		displayMode.setCustomFunctions({
			pageToWindow: function(pagePt, pageNumber) {
				const zoom = docViewer.getZoomLevel();

				const scaledPt = {
					x: pagePt.x * zoom,
					y: pagePt.y * zoom,
				};

				const offset = getDrawingPositionInWindow();

				const x = offset.x + scaledPt.x;
				const y = offset.y + scaledPt.y;

				return { x, y };
			},

			windowToPage: function(windowPt, pageNumber) {
				const offset = getDrawingPositionInWindow();

				const scaledPt = {
					x: windowPt.x - offset.x,
					y: windowPt.y - offset.y,
				};

				const zoom = docViewer.getZoomLevel();

				return {
					pageNumber,
					x: scaledPt.x / zoom,
					y: scaledPt.y / zoom,
				};
			},

			getSelectedPages: function(mousePt1, mousePt2) {
				return 1;
			},

			getVisiblePages: function() {
				return [1];
			},

			getPageTransform: function(pageNumber) {
				const page = docViewer.getDocument().getPageInfo(pageNumber);
				return {
					x: 0,
					y: 0,
					width: page.width,
					height: page.height,
				};
			},

			createPageSections: function() {
				const doc = docViewer.getDocument();
				const pageCount = docViewer.getPageCount();
				for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
					const page = doc.getPageInfo(pageNum);
					createPageSection(docViewer, pageNum, page.height, page.width);
				}
			},
		});

		docViewer.getDisplayModeManager().setDisplayMode(displayMode);
	}

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
		await startLibraries();
	};

	const startLibraries = async () => {
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
	}

	useEffect(() => {
		loadDependencies().then(async () => {
			const Core = window.Core as typeof Core;

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

			// placeholder stores the page section while the new canvases are
			// being prepared. It cannot be left under the viewer element,
			// because Apryse will delete everything under that at some point
			// between the call to zoom and createPageSections.

			placeholder.current = document.createElement('div');
			placeholder.current.style = `position: absolute; width: 100%; height: 100%`;
			scrollView.current.appendChild(placeholder.current);

			createDisplayMode(Core, documentViewer.current);

		/*	
			scrollView.current.addEventListener('wheel', (e) => {

				let scale = documentViewer.current.getZoomLevel();
				if (e.wheelDelta > 0) {
					scale = scale * 1.1;
				} else {
					scale = scale / 1.1;
				}
				const viewerRect = scrollView.current.getBoundingClientRect();
				documentViewer.current.zoomTo(scale, viewerRect.left, viewerRect.top);
			});
		*/

			// This fires when the rendering is complete. When rendering is
			// complete the new canvases will be attached, so we can delete
			// the intermediate scaled elements.

			documentViewer.current.addEventListener('pageComplete', () => {

				// If the page has only panned, we may not have a new canvas, in
				// which case nothing needs to happen.

				if (pageSectionReferences.current.active != pageSectionReferences.current.pending) {
					if(pageSectionReferences.current.active){
						pageSectionReferences.current.active.remove();
					}
					pageSectionReferences.current.active = pageSectionReferences.current.pending;
					pageSectionReferences.current.scale = documentViewer.current.getZoomLevel();
				}
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

		setTransform: (t: Transform) => {
			offset.current.x = t.x;
			offset.current.y = t.y;

			// Due to effects such as inertia, we may still get a few setTransform
			// events, after the viewer has been torn down...

			if (!documentViewer.current.getDocument()) {
				return;
			}

			const shouldScale = documentViewer.current.getZoomLevel() != t.scale;

			if (shouldScale) {

				// Zooming is going to prompt a re-render, which will delete the
				// contents of viewer, so move the current page section if
				// necessary.

				if (pageSectionReferences.current.active && pageSectionReferences.current.active.parentElement != placeholder.current) {
					placeholder.current.appendChild(pageSectionReferences.current.active);
					pageSectionReferences.current.active.style.transformOrigin = `top left`;
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

		getImageBlob,
	};

	 return (
		<div ref={viewer} style={{ width: '100%', height: '100%', position: 'absolute' }} />
	);
});