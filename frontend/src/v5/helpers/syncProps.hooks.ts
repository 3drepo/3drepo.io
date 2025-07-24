/**
 *  Copyright (C) 2024 3D Repo Ltd
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
import { useEffect, useState, useRef } from 'react';
import { EventEmitter } from 'eventemitter3';

const UPDATE_EVENT = 'propsUpdate';


/**
 * This hook returns a ref to be passed to modal dispatcher
 * example: 
 * const MyComponent = (someprops) => {
 *   const syncProps = useSyncProps(someProps);
 * 
 *   const onClickShowModal = () => DialogsActionsDispatchers.open(SomeModal, syncProps) // now everytime someProps changes SomeModal with get those props
 *   
 *   return (
 *     <div>
 *      <h1> My component </h1>
 *      <button onClick={onClickShowModal} > Dispatch a modal!</button>
 *      </div>
 *    );
 * }
 * 
 * 
 * DialogsActionsDispatchers.open(EditProfileModal, { initialTab: 'authentication' });
 * @param props the props to be passed to the modal.
 * @returns a ref that wil emit the changes
 */
export const useSyncProps = (props) => {
	const ref = useRef<any>(undefined);

	if (!ref.current) {
		ref.current = new EventEmitter();
	} 
	
	ref.current.props = props;

	useEffect(() => { 
		ref.current.emit(UPDATE_EVENT, props);
	}, [props]);

	return ref;
};


/**
 * This hook returns synched props each time syncProps emit a change and generate a redraw in the component  
 * @param syncProps the syncProps ref that will emit the changes
 * @returns the synched props
 */
export const useSyncPropsEffect = (syncProps) => {
	const [synchedProps, setSynchedProps] = useState(syncProps?.current?.props || syncProps);
	useEffect(() => {
		if (syncProps?.current?.emit) {
			syncProps.current.on(UPDATE_EVENT, setSynchedProps);
			return () => {
				syncProps.current.removeListener(UPDATE_EVENT, setSynchedProps);
			};
		}
	}, []);

	return synchedProps;
};
	

