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

import {forwardRef, useEffect, useRef} from 'react';
import { ZoomableImage } from '../zoomableImage.types';
import { DrawingViewerImageProps } from '../drawingViewerImage/drawingViewerImage.component';
import WebViewer from '@pdftron/webviewer'

export const DrawingViewerApryse = forwardRef<ZoomableImage, DrawingViewerImageProps>(({ onLoad, src }, ref ) => {
  const viewer = useRef(null);
  const inst = useRef(null);

  useEffect(() => {
    WebViewer(
      {
        path: '/lib/webviewer',
        licenseKey: 'demo:1757427582012:604c0cc30300000000cf0d5be766e4ae6bca26a884f10b9738735103dc',
        initialDoc: '/WebviewerDemoDoc.pdf',
      },
      viewer.current,
    ).then((instance) => {
        const { documentViewer } = instance.Core;
        // you can now call WebViewer APIs here...
        inst.current = documentViewer;
        onLoad();
      });
  }, []);

  (ref as any).current = {
    setTransform: ({scale, x, y}) => {
        if(inst.current){
            inst.current.zoomTo(scale,x,y);
        }
    },

    getEventsEmitter: () => {
        return viewer.current.parentElement;
    },

    getBoundingClientRect: () => {
        return viewer.current.getBoundingClientRect();
    },

    getNaturalSize: () => {
        return {width: 1000, height: 1000};
    },
  }

  return (
    <div className="webviewer" ref={viewer} style={{height: "100%", overflow: "hidden"}} />
  );
});