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

import * as React from 'react';
import { isEqual, isEmpty } from 'lodash';
import {
	CustomTable,
	CELL_TYPES,
	TableButton
} from '../components/customTable/customTable.component';
import { Loader } from '../components/loader/loader.component';
import { LoaderContainer } from '../billing/billing.styles';
import { Container } from './history.styles';

const INVOICES_TABLE_CELLS = [
	{
		name: 'Number',
		HeadingProps: { root: { flex: 10 } },
		CellProps: { root: { flex: 10 } }
	},
	{
		name: 'Date',
		HeadingProps: { root: { flex: 15 } },
		CellProps: { root: { flex: 15 } }
	},
	{
		name: 'Status',
		HeadingProps: { root: { flex: 10 } },
		CellProps: { root: { flex: 10 } }
	},
	{
		name: 'Description',
		HeadingProps: { root: { flex: 25 } },
		CellProps: { root: { flex: 25 } }
	},
	{
		name: 'Payment',
		HeadingProps: { root: { flex: 10 } },
		CellProps: { root: { flex: 10 } }
	},
	{
		name: 'Amount (£)',
		HeadingProps: { root: { flex: 15 } },
		CellProps: { root: { flex: 15 } }
	},
	{
		HeadingProps: { root: { flex: 7 } },
		CellProps: { root: { flex: 7 } },
		type: CELL_TYPES.ICON_BUTTON,
		CellComponent: TableButton
	}
];

interface IProps {
	teamspace: any;
	invoices: any[];
	fetchInvoices: (teamspace) => void;
	downloadInvoice: (teamspace, index) => void;
}

interface IState {
	invoices: any[];
	rows: any[];
}

export class History extends React.PureComponent<IProps, IState> {
	public state = { invoices: [], rows: [] };

	public componentDidMount() {
		this.props.fetchInvoices(this.props.teamspace);

		this.setState({
			rows: this.getInvoicesTableRows(this.props.invoices)
		});
	}

	public componentDidUpdate(prevProps) {
		const changes = {} as any;
		const { invoices } = this.props;

		const invoicesChanged = !isEqual(prevProps.invoices, invoices);

		if (invoicesChanged) {
			changes.invoices = invoices;
			changes.rows = this.getInvoicesTableRows(invoices);
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public onDownload = (teamspace, invoiceNo) =>
		this.props.downloadInvoice(teamspace, invoiceNo)

	public getInvoicesTableRows = (invoices = []): any[] => {
		return invoices.map((invoice) => {
			const data = [
				{ value: invoice.invoiceNo },
				{ value: invoice.createdAtDate },
				{
					value:
						invoice.type === 'refund'
							? 'Completed'
							: invoice.pending
								? 'Pending'
								: 'Paid'
				},
				{
					value:
						invoice.type === 'refund' ? 'Refund' : invoice.items[0].description
				},
				{ value: invoice.gateway },
				{ value: invoice.nextPaymentAmount.toFixed(1) },
				{
					icon: 'cloud_download',
					onClick: this.onDownload.bind(
						null,
						this.props.teamspace,
						invoice.invoiceNo
					)
				}
			];

			return { ...invoice, data };
		});
	}

	public render() {
		const { rows } = this.state;

		if (this.props.isLoadingBilling) {
			const content = `Loading history data...`;

			return (
				<LoaderContainer>
					<Loader content={content} />
				</LoaderContainer>
			);
		}

		return (
			<Container>
				<CustomTable cells={INVOICES_TABLE_CELLS} rows={rows} />
			</Container>
		);
	}
}
