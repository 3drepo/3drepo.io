/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import api from './';

/**
 * Get plans
 */
export const getPlans = () => {
	return api.get('plans');
};

/**
 * Get subscriptions
 * @param teamspace
 */
export const getBillingInfo = (teamspace) => {
	return api.get(`${teamspace}/billingInfo`);
};

/**
 * Get subscriptions
 * @param teamspace
 */
export const getSubscriptions = (teamspace) => {
	return api.get(`${teamspace}/subscriptions`);
};

/**
 * Get invoices
 * @param teamspace
 */
export const getInvoices = (teamspace) => {
	return api.get(`${teamspace}/invoices`);
};

/**
 * Post subscription
 * @param teamspace
 * @param subscriptionData
 */
export const changeSubscription = (teamspace, subscriptionData) => {
	return api.post(`${teamspace}/subscriptions`, subscriptionData);
};

/**
 * Get invoice
 * @param teamspace
 * @param billingId
 */
export const getInvoiceDocument = (teamspace, billingId) => {
	return api.get(`${teamspace}/invoices/${billingId}.pdf`);
};
