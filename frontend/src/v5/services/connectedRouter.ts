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

import { RouterActions } from '@/v4/modules/router/router.redux';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { RouterHooksSelectors } from './selectorsHooks';
import { useEffect } from 'react';

export const InitializeConnectedRouter = () => {
	const location = useLocation();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

	const navigationTarget = RouterHooksSelectors.selectNavigationTarget();
	const goBackRequested = RouterHooksSelectors.selectGoBackRequested();
	const searchParamsToRemove = RouterHooksSelectors.selectSearchParamsToRemove();

	useEffect(() => {
		if (!searchParamsToRemove?.length) return;
		searchParamsToRemove.forEach((searchParam) => searchParams.delete(searchParam));
		setSearchParams(searchParams);
		dispatch(RouterActions.resetSearchParamsToRemove());
	}, [searchParamsToRemove]);

	useEffect(() => {
		if (!navigationTarget) return;
		navigate(navigationTarget);
		dispatch(RouterActions.navigate(null));
	}, [navigationTarget]);

	useEffect(() => {
		if (goBackRequested) {
			navigate(-1);
			dispatch(RouterActions.clearNavigation());
		}
	}, [goBackRequested, navigate, dispatch]);
	
	useEffect(() => {
		dispatch(RouterActions.setLocation(location));
	}, [location]);

	return null;
};