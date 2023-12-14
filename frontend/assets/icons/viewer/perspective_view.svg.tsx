/**
 *  Copyright (C) 2023 3D Repo Ltd
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
type IProps = {
	className?: any;
};

export default ({ className }: IProps) => (
	<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<g className="perspective-o">
			<g className="highlight">
				<rect x="0.632812" y="4.42969" width="12.9375" height="12.9375" fill="currentColor" />
			</g>
			<g className="primary">
				<path d="M8.42322 10.3487L10.1576 8.60553L9.2604 7.71286L7.52602 9.45602L8.42322 10.3487Z" fill="currentColor" />
				<path d="M5.82165 12.9634L7.55603 11.2203L6.65884 10.3276L4.92446 12.0708L5.82165 12.9634Z" fill="currentColor" />
				<path d="M3.22009 15.5782L4.95446 13.835L4.05727 12.9424L2.3229 14.6855L3.22009 15.5782Z" fill="currentColor" />
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M0.491516 3.81271L10.9161 0.0424683C10.987 0.0150415 11.064 0 11.1445 0H17.3672C17.7167 0 18 0.28332 18 0.632812V6.85547C18 6.89193 17.9969 6.92768 17.991 6.96245L17.9975 6.96482L17.9804 7.01227C17.9703 7.05195 17.9564 7.09014 17.9392 7.12642L14.1709 17.5671C14.0872 17.8186 13.85 18 13.5703 18H0.632812C0.28332 18 0 17.7167 0 17.3672V4.42969C0 4.12877 0.210042 3.8769 0.491516 3.81271ZM4.25656 3.79688L10.5117 1.53459V3.79688H4.25656ZM14.2031 13.7498L16.4631 7.48828H14.2031V13.7498ZM14.2031 6.22266H16.7344V2.16556L14.2031 4.70853V6.22266ZM13.3248 3.79688L15.8444 1.26562H11.7773V3.79688H13.3248ZM11.7773 5.0625H12.9375V6.22266H11.7773V5.0625ZM10.5117 5.0625V6.4552L10.1276 6.84128L11.0248 7.73394L11.2692 7.48828H12.9375V16.7344H2.06973L2.3529 16.4498L1.45571 15.5571L1.26562 15.7481V5.0625H10.5117Z"
					fill="currentColor"
				/>
			</g>
		</g>
	</svg>
);
