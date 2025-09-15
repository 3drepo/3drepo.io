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

import { forwardRef, useEffect, useRef, useState } from 'react';
import { ZoomableImage } from '../zoomableImage.types';
import { DrawingViewerImageProps } from '../drawingViewerImage/drawingViewerImage.component';
import { ViewBoxType } from '@/v5/ui/routes/dashboard/projects/calibration/calibration.types';
import { Core } from '@pdftron/webviewer'
import { DrawingViewerService } from '../drawingViewer.service';
import { ISnapHelper, SnapResults } from '../snapping/types';
import { Vector2Like } from 'three';

// (webviewer-core.min.js will load the Core library into window when it is
// added)
declare global {
  interface Window {
    Core: typeof Core;
  }
}

// Unlike the SVG & Image viewers, the Apryse viewer will handle navigation and
// publish the view box for the 2d overlays.
export type DrawingViewerApryseProps = DrawingViewerImageProps & {
	setViewBox: (ViewBoxType) => void,
};

export type DrawingViewerApryseType = ZoomableImage & ISnapHelper;

export const DrawingViewerApryse = forwardRef<DrawingViewerApryseType, DrawingViewerApryseProps>(({ onLoad, src, setViewBox }, ref) => {
  const viewer = useRef(null);
  const scrollView = useRef(null);
  const _documentViewer = useRef(null);
  const _pageContainer = useRef(null);
  const _snapModes = useRef(null);

  // Should be called from inside this Component whenever the Apryse navigation
  // updates the display of the PDF.

  const updateViewBox = () => {
      // When the document changes position in the viewer (including zooming),
      // update the viewbox for the 2d layer.
      // This is only required when using Apryse's navigation tools - if
      // setTransform is used then there is no need for this.

      const width = _documentViewer.current.getPageWidth(1);
      const height = _documentViewer.current.getPageHeight(1);

      const scale = _documentViewer.current.getZoomLevel();

      const container = scrollView.current.getBoundingClientRect();
      const rect = _pageContainer.current.getBoundingClientRect();
      const x = rect.left - container.left;
      const y = rect.top - container.top;

      setViewBox({
        width,
        height,
        scale,
        x,
        y
      });
  };

  //#5660: integrate snapping properly with the member in ref after we sort out events

  const onMouseMoveSnap = (e) => {
    
    // This snippet duplicates the logic inside viewerLayer2D, and is just for testing.

    const rect = _pageContainer.current.getBoundingClientRect();
    const scale = _documentViewer.current.getZoomLevel();
    const pagePoint = {
      x: (e.clientX - rect.left) / scale, 
      y: (e.clientY - rect.top) / scale
    };

    const radius = 10 * scale;

    _documentViewer.current.snapToNearest(1, pagePoint.x, pagePoint.y, _snapModes.current).then(snapPoint => {

      console.log(snapPoint);

      // Todo; hook this up to the snap method in the returned ref.

      const d = (snapPoint.x - pagePoint.x) * (snapPoint.x - pagePoint.x) + (snapPoint.y - pagePoint.y) * (snapPoint.y - pagePoint.y);
      if (d < (radius * radius)) {

      } else {
        
      }

      // The coordinates used by the snapping tool (Apryse 'viewer' coordinates)
      // are in the same space as the overlay.

      DrawingViewerService.setMousePosition([snapPoint.x, snapPoint.y]);
    });
  };

  const snap = (mousePos: Vector2Like, radius: number): SnapResults => {
    return new SnapResults();
  }

  const loadScript = async (src) => {
    const script = document.createElement('script');
    script.src = src;
    document.body.appendChild(script);
    return new Promise((resolve)=>{
      script.onload = resolve;
    });
  }

  const loadDependencies = async () => {
    return Promise.all([
      loadScript("/lib/webviewer/core/webviewer-core.min.js"),
      loadScript("/lib/webviewer/core/pdf/PDFNet.js"),
    ]);
  }

  useEffect(() => {
    loadDependencies().then(async () => {
      const Core = window.Core as typeof Core;
      Core.setWorkerPath("/lib/webviewer/core");

      // This next snippet concerned with PDFNet initialises the fullAPI, which
      // is required for snapping...

      async function main(){
        const doc = await Core.PDFNet.PDFDoc.create();
        doc.initSecurityHandler();
        // Locks all operations on the document
        doc.lock();
      }

      await Core.PDFNet.runWithCleanup(
        main,
        "licensekeyhere"
      );

      // When using a custom UI, we must provide the DOM elements for the
      // (scrolling) container and the container of the document (which will
      // be transformed underneath the scroll view). These are the ones we
      // create for the Component.

      const documentViewer = new Core.DocumentViewer();
      documentViewer.setScrollViewElement(scrollView.current);
      documentViewer.setViewerElement(viewer.current);

      // At the moment, we must use Apryse's inbuilt navigation. The following
      // snippet sets this up.

      const panTool = documentViewer.getTool(Core.Tools.ToolNames.PAN);
      documentViewer.setToolMode(Core.Tools.ToolNames.PAN);

      _documentViewer.current = documentViewer;

      // Forward events for the Pan Tool for Apryse's built in navigation
      // Todo: do we instead want to use an alternative or modified panzoomhandler
      // to send these events? and so have events handled elsewhere?

      scrollView.current.addEventListener('mousedown', e => {
        panTool.mouseLeftDown(e);
      });

      scrollView.current.addEventListener('mousemove', e => {
        panTool.mouseMove(e);
        onMouseMoveSnap(e);
      });

      scrollView.current.addEventListener('mouseup', e => {
        panTool.mouseLeftUp(e);
      });

      viewer.current.addEventListener('wheel',e => {
        let scale = _documentViewer.current.getZoomLevel();
        if (e.wheelDelta > 0) {
          scale = scale * 1.1;
        }
        else{
          scale = scale * 0.9;
        }
        const viewerRect = scrollView.current.getBoundingClientRect();
        documentViewer.zoomToMouse(scale, viewerRect.left, viewerRect.top);
      });

      // When using Apryse's navigation, we must tell our 2d overlay where the
      // viewBox is whenever it changes.

      documentViewer.addEventListener('zoomUpdated', updateViewBox);
      scrollView.current.addEventListener("scroll", updateViewBox);

      // When the drawing is zoomed, the DOM for the page may be recreated,
      // so update the reference we have for this.

      documentViewer.addEventListener('pageComplete', () => {
        _pageContainer.current = document.getElementById('pageContainer1');
        updateViewBox();
      });

      // This simply initialises an array of snap modes, which we do not expect
      // to change, but need the Core namespace to populate.

      _snapModes.current = [
       _documentViewer.current.SnapMode.PATH_ENDPOINT,
       _documentViewer.current.SnapMode.LINE_INTERSECTION,
       _documentViewer.current.SnapMode.POINT_ON_LINE
      ];

      // The pdf is loaded asynchronously. Apryse also has its own loading
      // indicator so we could immediately call onLoad if we wanted and show
      // that instead. However, this should not be done if using our own
      // navigation, as some other references may not be set up yet...

      documentViewer.loadDocument('/revit_house_floor2.pdf').then(()=>{
        onLoad();
      });
    });
  }, []);

  (ref as any).current = {
    setTransform: ({scale, x, y}) => {
        // Currently, there is no known way to set the transform of a document
        // in the Apryse WebSDK, so navigation must be controlled by the
        // Apryse viewer.
        // See: https://community.apryse.com/t/simplest-way-to-set-the-exact-position-offset-of-a-page-within-the-scroll-view/11932
    },

    getEventsEmitter: () => {
        return scrollView.current;
    },

    getBoundingClientRect: () => {
        return _pageContainer.current.getBoundingClientRect();
    },

    getNaturalSize: () => {
      const width = _documentViewer.current.getPageWidth(1);
      const height = _documentViewer.current.getPageHeight(1);
      return { width, height };
    },

    snap: (mousePos: Vector2Like, radius: number): SnapResults => {
      return new SnapResults();
    }
  }

  // The two script tags below should go into the head of the document on-demand,
  // and only be loaded once, since the async property is set.
  return (
    <div id='apryse-repo-scroll-view' ref={scrollView} className="webviewer" style={{height: "100%", overflow: "hidden"}}>
      <div id='apryse-repo-viewer' ref={viewer}></div>
    </div>
  );
});