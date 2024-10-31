/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import { PaperTitle } from './LegalLayout/legalLayout.styles';

export const CookiesLegalPaper = () => (
	<>
		<PaperTitle>Asite 3D Repo Ltd Cookies Policy</PaperTitle>
		<h1>Information about our use of cookies</h1>
		<p>Our website and the 3D Repo platform (together the <strong>Service</strong>) uses cookies to distinguish
			you from other users of our Service. This helps us to provide you with a good experience when you browse
			our Service and also allows us to improve the Service. By continuing to browse the Service, you are agreeing
			to our use of cookies.
		</p>
		<p>A cookie is a small file of letters and numbers that we store on your browser or the hard drive of your
			computer if you agree. Cookies contain information that is transferred to your computer&apos;s hard drive.
		</p>
		<p>We may use the following cookies:</p>
		<ul>
			<li>
				<p><strong>Strictly necessary cookies.</strong> These are cookies that are required for the operation of
					our Service. They include, for example, cookies that enable you to log into secure areas of our
					Service, use a shopping cart or make use of e-billing services.
				</p>
			</li>
			<li>
				<p><strong>Analytical/performance cookies.</strong> They allow us to recognise and count the number of
					visitors and to see how visitors move around our Service when they are using it. This helps us to
					improve the way our Service works, for example, by ensuring that users are finding what they are
					looking for easily.
				</p>
			</li>
			<li>
				<p><strong>Functionality cookies.</strong> These are used to recognise you when you return to our
					Service.This enables us to personalise our content for you, greet you by name and remember your
					preferences (for example, your choice of language or region).
				</p>
				<p>We do not use Targeting cookies.</p>
			</li>
		</ul>
		<p>
			You can find more information about the individual cookies we use and the purposes for which we use them
			in the table below:
		</p>
		<table>
			<tbody>
				<tr>
					<td width="55">
						<p><strong>Cookie</strong></p>
					</td>
					<td width="55">
						<p><strong>Name</strong></p>
					</td>
					<td width="219">
						<p><strong>Purpose</strong></p>
					</td>
					<td width="55">
						<p><strong>More information</strong></p>
					</td>
				</tr>
				<tr>
					<td width="55">
						<p>connect.sid</p>
					</td>
					<td width="55">
						<p>connect.sid</p>
					</td>
					<td width="119">
						<p>
							The connect.sid cookie is used to allow you to login to 3drepo.io. It will be removed when
							you close your browser.
						</p>
					</td>
					<td width="55" />
				</tr>
				<tr>
					<td width="55">
						<p>Google Analytics</p>
					</td>
					<td width="55">
						<p>utma</p>
						<p>utmb</p>
						<p>utmc</p>
						<p>utmz</p>
					</td>
					<td width="119">
						<p>
							These cookies are used to collect information about how visitors use our site. We use the
							information to compile reports and to help us improve the site.
						</p>
						<p>The cookies collect information in an anonymous form, including the number of visitors to the
							site, where visitors have come to the site from and the pages they visited.
						</p>
					</td>
					<td width="55">
						<p>
							<a href="https://support.google.com/analytics/answer/6004245">
								Read Google&apos;s overview of privacy and safeguarding data
							</a>
						</p>
					</td>
				</tr>
			</tbody>
		</table>
		<p>Please note that third parties (including, for example, providers of external services like web traffic
			analysis services) may also use cookies, over which we have no control. These cookies are likely to be
			analytical/performance cookies or targeting cookies.
		</p>
		<p>You can block cookies by activating the setting on your browser that allows you to refuse the setting of
			all or some cookies. However, if you use your browser settings to block all cookies (including essential
			cookies) you may not be able to access all or parts of the Service.
		</p>
	</>
);
