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

import { Link } from 'react-router-dom';
import { COOKIES_ROUTE } from '../../routes/routes.constants';
import { PaperTitle, SupportEmail } from './LegalLayout/legalLayout.styles';

export const PrivacyLegalPaper = () => (
	<>
		<PaperTitle>Asite 3D Repo Ltd Privacy Policy</PaperTitle>
		<p>At 3D Repo, we respect your privacy and we are committed to protecting your personal data.
			This privacy notice informs you about how we look after your personal data when you visit our website,
			use our services or otherwise conduct business with us, and
			it explains your privacy rights and how the law protects you.
		</p>
		<h1>Important information and who we are</h1>
		<ol>
			<li>
				<h2>Purpose of this privacy notice</h2>
			</li>
			<p>
				This privacy notice aims to give you information on how we collect and process your personal data
				through your use of this website, use of service or other business you may conduct with us including
				any data you may provide through this website when you create an account
			</p>
			<p>This website is not intended for children and we do not knowingly collect data relating to children.</p>
			<h3>Controller</h3>
			<p>We are Asite 3D Repo Limited and Asite 3D Repo Limited is the controller and is responsible for your personal data.
				Our address is 7th Floor, Leconfield House, Curzon Street, London, England, W1J 5JA . We are registered with the Information Commissioner
				as a data controller and our registration number is ZB538538.
			</p>
			<p>If you have any questions about this policy or about your rights regarding your personal data, you can
				contact us by emailing <SupportEmail />.
			</p>
			<h3>Changes to the privacy notice and your duty to inform us of changes</h3>
			<p>This version of our privacy policy was last updated on 19 April 2023.</p>
			<p>It is important that the personal data we hold about you is accurate and current. Please keep us informed
				if your personal data changes during your relationship with us.
			</p>
			<li>
				<h2>The data we collect about you</h2>
				<p>Personal data, or personal information, means any information about an individual from which that
					person can be identified. It does not include data where the identity has been removed (anonymous
					data). We collect only that personal data from you that we need in order to provide you with the
					products you request through our website and otherwise, in order to operate our business in the
					way that you would anticipate.
				</p>
				<p>We may collect, use, store and transfer different kinds of personal data about you which we have
					grouped together follows:
				</p>
				<table>
					<tbody>
						<tr>
							<td width="100">
								Contact Data
							</td>
							<td width="400">
								<p>includes first name, last name and email address.</p>
							</td>
						</tr>
						<tr>
							<td>
								Other Identifier Data
							</td>
							<td>
								<p>Other Identifier Data includes role, username, company name.</p>
							</td>
						</tr>
						<tr>
							<td>
								Financial Data
							</td>
							<td>
								<p>includes business bank account and business payment card details, VAT number, billing
									address (unless you use Paypal to process any payment in which case we do not
									process or store that financial data).
								</p>
							</td>
						</tr>
						<tr>
							<td>
								Transaction Data
							</td>
							<td>
								<p>includes details about payments to and from you and other details of products you
									have purchased from us (including details of any payment you have made to us via
									Paypal).
								</p>
							</td>
						</tr>
						<tr>
							<td>
								Technical Data
							</td>
							<td>
								<p>includes internet protocol (IP) address, your login data, browser type and version,
									time zone setting and location, browser plug-in types and versions, operating system
									and platform and other technology on the devices you use to access this website.
								</p>
							</td>
						</tr>
						<tr>
							<td>
								Connection Data
							</td>
							<td>
								<p>includes the type of device you use (<strong>Device</strong>), a unique device
									identifier (for example, your Device&apos;s IMEI number, the MAC address of the
									Device&apos;s wireless network interface, or the mobile phone number used by the
									Device), network information, your mobile operating system, screen type and
									resolution, the type of web browser you use, the time zone setting.
								</p>
							</td>
						</tr>
						<tr>
							<td>
								Location Data
							</td>
							<td>
								<p>includes details of your use of our service including, but not limited to, traffic
									data, statistics of content uploaded, downloaded and viewed. We may make use of
									location data sent from Devices. You can turn off this functionality at any time
									by turning off the location services settings for the mobile application on the
									Device. If you use these location services, you consent to us and our
									affiliates&apos; and licensees&apos; transmission, collection, maintenance,
									processing and use of your location data and queries to provide and improve
									location-based products and services. We may also use other technology (e.g. your
									time zone and IP address) to determine information regarding your
									current location. Some of our location-enabled services require your personal data
									for the feature to work.
								</p>
							</td>
						</tr>
						<tr>
							<td>
								Usage Data
							</td>
							<td>
								<p>includes information about your use of our service, including the full Uniform
									Resource Locators (URL) clickstream to, through and from our website (including
									date and time); elements you viewed or words you searched for; page
									response times; download errors; length of visits; interaction information
									(such as scrolling, clicks, and mouse-overs).
								</p>
							</td>
						</tr>
						<tr>
							<td>
								Communications Data
							</td>
							<td>
								<p>includes emails, note of conversations, and records of online chats through
									3drepo.io.
								</p>
							</td>
						</tr>
					</tbody>
				</table>

				<p>We also collect, use and share <strong>Aggregated Data </strong> such as statistical or
					demographic data for any purpose. Aggregated Data may be derived from your personal data but
					is not considered personal data in law as this data does <strong>not </strong>
					directly or indirectly reveal your identity. For example, we may aggregate your Usage Data
					to calculate the percentage of users accessing a specific website feature. However, if we
					combine or connect Aggregated Data with your personal data so that it can directly or indirectly
					identify you, we treat the combined data as personal data which will be used in accordance
					with this privacy notice.
				</p>
			</li>
			<li>
				<h2>How is your personal data collected?</h2>
				<p>We use different methods to collect data from and about you including through:</p>
				<ul>
					<li>
						<h3>Direct interactions.</h3>
						<p>
							You may give us your Identity, Contact, Financial and Communications Data by submitting
							information on our website or by corresponding with us or other users by phone, email
							on our platform or otherwise (including when you use our support service). This includes
							personal data you provide when you:
						</p>
						<ul>
							<li>
								<p>enquire about our services;</p>
							</li>
							<li>
								<p>create or use your account on with us;</p>
							</li>
							<li>
								<p>collaborate and interact with other users of our services;</p>
							</li>
							<li>
								<p>otherwise use our services</p>
							</li>
						</ul>
					</li>
					<li>
						<h3>Automated technologies or interactions.</h3>
						<p>
							As you interact with our website, we may automatically collect Technical, Usage, Connection
							and Location Data about your equipment, browsing actions and patterns. We collect this
							personal data by using cookies and other similar technologies.
						</p>
					</li>
					<li>
						<h3>Third parties or publicly available sources.</h3>
						<p> We may receive personal data about you from various third parties as set out below:</p>
					</li>
					<ul>
						<li>
							<p>Technical Data from the following parties:</p>
							<ol type="a">
								<li>
									<p>analytics providers such as Google based outside the EU who provide server
										monitoring tools to monitor the status of our APIs and the type and volume of
										queries being made to them.
									</p>
								</li>
								<li>
									<p>advertising networks such as Twitter, Google, Adwords and Linkedin which may have
										servers based outside the EU; and
									</p>
									<ul>
										<li>
											<p>Contact, Financial and Transaction Data from providers of technical,
												payment and delivery services such as Paypal which may have servers
												outside the EU.
											</p>
										</li>
									</ul>
								</li>
							</ol>
						</li>
					</ul>
				</ul>
			</li>
			<li>
				<h2>How we use your personal data</h2>
				<p>We will only use your personal data when the law allows us to. Most commonly, we will use your
					personal data in the following circumstances:
				</p>
				<ul>
					<li>
						<p>Where we need to perform the contract we are about to enter into or have entered into
							with you.
						</p>
					</li>
					<li>
						<p>Where it is necessary for our legitimate interests (or those of a third party) and your
							interests and fundamental rights do not override those interests.
						</p>
					</li>
					<li>
						<p>Where we need to comply with a legal or regulatory obligation.</p>
					</li>
				</ul>
			</li>
			<p>From time to time, we will send you marketing communications by email about the products we offer
				and how they are being updated and can offer new features and functionalities. We offer you the
				chance to opt out of receiving such emails at the point that you register your contact details with
				us and whenever we send such a communication, we include an option for you to unsubscribe from
				receiving further such communications.
			</p>
			<h3>Purposes for which we will use your personal data</h3>
			<p>We have set out below, in a table format, a description of all the ways we plan to use your personal
				data, and which of the legal bases we rely on to do so. We have also identified what our legitimate
				interests are where appropriate.
			</p>
			<p>Note that we may process your personal data for more than one
				lawful ground depending on the specific purpose for which we are using your data. Please contact
				us at <SupportEmail /> if you need details about the specific legal ground we are relying
				on to process your personal data where more than one ground has been set out in the table below.
			</p>
			<table>
				<tbody>
					<tr>
						<td width="300">
							<h3>Purpose/Activity</h3>
						</td>
						<td width="200">
							<h3>Type of data</h3>
						</td>
						<td width="300">
							<h3>Lawful basis for processing</h3>
						</td>
					</tr>
					<tr>
						<td width="300">
							<p>To register you as a new user and maintain your account</p>
						</td>
						<td width="200">
							<ol type="a">
								<li>Contact</li>
								<li>Other Identifier</li>
							</ol>
						</td>
						<td width="300">
							<p>Performance of a contract with you</p>
						</td>
					</tr>
					<tr>
						<td width="300">
							<p>To share your details with other users or collaborators who are involved on the same
								project (where you have opted in to this on your user account)
							</p>
						</td>
						<td width="200">
							<ol type="a">
								<li>Contact</li>
								<li>Other Identifier</li>
							</ol>
						</td>
						<td width="300">
							<ol type="a">
								<li>Performance of a contract with you</li>
								<li>Necessary for our legitimate interests (providing the means of collaboration
									between users on our platform)
								</li>
							</ol>
						</td>
					</tr>
					<tr>
						<td width="300">
							<p>To process and deliver your order including:</p>
							<ol type="a">
								<li>Manage payments, fees and charges</li>
								<li>Collect and recover money owed to us</li>
							</ol>
						</td>
						<td width="200">
							<ol type="a">
								<li>Contact</li>
								<li>Financial</li>
								<li>Transaction</li>
								<li>Communications</li>
							</ol>
						</td>
						<td width="300">
							<ol type="a">
								<li>Performance of a contract with you</li>
								<li>Necessary for our legitimate interests (to recover debts due to us)</li>
							</ol>
						</td>
					</tr>
					<tr>
						<td width="300">
							<p>To manage our relationship with you which may include notifying you about changes to our
								terms of working or relevant updates
							</p>
						</td>
						<td width="200">
							<ol type="a">
								<li>Contact</li>
								<li>Financial</li>
								<li>Communications</li>
							</ol>
						</td>
						<td width="300">
							<ol type="a">
								<li>Performance of a contract with you</li>
								<li>Necessary for our legitimate interests (to keep our records updated and to study
									how users use our products)
								</li>
							</ol>
						</td>
					</tr>
					<tr>
						<td width="300">
							<p>To administer and protect our business and this website (including troubleshooting, data
								analysis, testing, system maintenance, support, reporting and hosting of data)
							</p>
						</td>
						<td width="200">
							<ol type="a">
								<li>Contact</li>
								<li>Financial</li>
								<li>Technical</li>
								<li>Communications</li>
							</ol>
						</td>
						<td width="300">
							<p>Necessary for our legitimate interests (for running our business, provision of
								administration and IT services, network security, to prevent fraud and in the context
								of a business reorganisation or group restructuring exercise)
							</p>
						</td>
					</tr>
					<tr>
						<td width="300">
							<p>To deliver relevant website content and marketing messages to you</p>
						</td>
						<td width="200">
							<ol type="a">
								<li>Contact</li>
								<li>Other Identifier</li>
								<li>Usage</li>
								<li>Communications</li>
								<li>Technical</li>
							</ol>
						</td>
						<td width="300">
							<p>Necessary for our legitimate interests (to study how customers use our products, to
								develop them, to grow our business and to inform our marketing strategy)
							</p>
						</td>
					</tr>
					<tr>
						<td width="300">
							<p>To use data analytics to improve our website, products/services, marketing, customer
								relationships and experiences
							</p>
						</td>
						<td width="200">
							<ol type="a">
								<li>Technical</li>
								<li>Usage</li>
								<li>Location</li>
								<li>Connection</li>
							</ol>
						</td>
						<td width="300">
							<p>Necessary for our legitimate interests (to define types of customers for our products, to
								keep our website updated and relevant, to develop our business and to inform our
								marketing strategy)
							</p>
						</td>
					</tr>
				</tbody>
			</table>
			<h3>Cookies</h3>
			<p>
				You can set your browser to refuse all or some browser cookies, or to alert you when websites set or
				access cookies. If you disable or refuse cookies, please note that some parts of this website may
				become inaccessible or not function properly. For more information about the cookies we use, please
				see <Link to={COOKIES_ROUTE}>Cookies Policy</Link>.
			</p>
			<li>
				<h2>How is your personal data shared?</h2>
				<p>We may have to share your personal data with the parties set out below for the purposes set out
					in the table in paragraph 4 above.
				</p>
				<ul>
					<li>
						<p>Amazon servers in London or Canada, depending on your user specified preference.</p>
					</li>
					<li>
						<p>Paypal, Google Cloud and Dropbox or other similar support service provider.</p>
					</li>
					<li>
						<p>Third parties to whom we may choose to sell, transfer, or merge parts of our business or
							our assets. Alternatively, we may seek to acquire other businesses or merge with them. If
							a change happens to our business, then the new owners may use your personal data in the
							same way as set out in this privacy notice.
						</p>
					</li>
				</ul>
				<p>We require all third parties to respect the security of your personal data and to treat it in
					accordance with the law. We do not allow our third-party service providers to use your personal data
					for their own purposes and only permit them to process your personal data for specified purposes
					and in accordance with our instructions.
				</p>
			</li>
			<li>
				<h2>International transfers</h2>
				<p>To support our business functions, we need to send your personal data to companies that may have
					servers based outside the EEA.
				</p>
				<p>One of our hosting companies is located in Canada which you can opt to use for your account. This
					hosting company is based in a country that has been deemed to provide an adequate level of
					protection for personal data by the European Commission. You do not have to choose this Canada
					hosting option and you are free to choose another UK hosting company if you prefer.
				</p>
				<p>Where we use certain other service providers (such as Google Cloud, Paypal and Dropbox), we may use
					specific contracts approved by the European Commission, which give personal data the same
					protection it has in Europe.
				</p>
				<p>Please contact us at <SupportEmail /> if you want further information on the specific mechanism used
					by us when transferring your personal data out of the EEA.
				</p>
			</li>
			<li>
				<h2>Data security</h2>
				<p>We have put in place appropriate security measures to prevent your personal data from being
					accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition,
					we limit access to your personal data to those employees, agents, contractors and other third
					parties who have a business need to know. They will only process your personal data on our
					instructions and they are subject to a duty of confidentiality.
				</p>
				<p>We have put in place procedures to deal with any suspected personal data breach and will notify you
					and any applicable regulator of a breach where we are legally required to do so.
				</p>
			</li>
			<li>
				<h2>Data retention</h2>
				<h3>How long will you use my personal data for?</h3>
				<p>We will only retain your personal data for as long as necessary to fulfil the purposes we
					collected it for, including for the purposes of satisfying any legal, accounting, or
					reporting requirements.
				</p>
				<p>As regards all personal data, we aim to hold this for no longer than 10 years and in respect
					of the personal data obtained through our consumer accounts, we delete all such personal
					data from our records 7 days following the closure of your account
					with us.
				</p>
			</li>
			<li>
				<h2>Your legal rights</h2>
				<p>You have the right to make a complaint at any time to the Information Commissioner&apos;s
					Office (ICO), the UK supervisory authority for data protection issues (www.ico.org.uk).
					We would, however, appreciate the chance to deal with your concerns about
					data protection before you approach the ICO so please contact us in the first instance.
				</p>
				<h3>You also have the right in certain circumstances to:</h3>
				<table>
					<tbody>
						<tr>
							<td width="400">
								Request access to your personal data (commonly known as a &quot;data subject
								access request&quot;).
							</td>
							<td width="413">
								<p>This enables you to receive a copy of the personal data we hold about you and to
									check that we are lawfully processing it.
								</p>
							</td>
						</tr>
						<tr>
							<td width="400">
								Request correction of the personal data that we hold about you.
							</td>
							<td width="413">
								<p>This enables you to have any incomplete or inaccurate data we hold about you
									corrected, though we may need to verify the accuracy of the new data you
									provide to us.
								</p>
							</td>
						</tr>
						<tr>
							<td width="400">
								Request erasure of your personal data.
							</td>
							<td width="413">
								<p>This enables you to ask us to delete or remove personal data where there is no good
									reason for us continuing to process it. You also have the right to ask us to delete
									or remove your personal data where you have successfully exercised
									your right to object to processing (see below), where we may have processed your
									information unlawfully or where we are required to erase your personal data to
									comply with local law. Note, however, that we may not always be
									able to comply with your request of erasure for specific legal reasons which will
									be notified to you, if applicable, at the time of your request.
								</p>
							</td>
						</tr>
						<tr>
							<td width="400">
								Object to processing of your personal data where we are relying on a legitimate interest
								(or those of a third party) and there is something about your particular situation which
								makes you want to object to processing on this ground as you feel it impacts on your
								fundamental rights and freedoms.
							</td>
							<td width="413">
								<p>You also have the right to object where we are processing your personal data for
									direct marketing purposes. In some cases, we may demonstrate that we have compelling
									legitimate grounds to process your information which override
									your rights and freedoms.
								</p>
							</td>
						</tr>
						<tr>
							<td width="400">
								Request restriction of processing of your personal data.
							</td>
							<td width="413">
								<p>This enables you to ask us to suspend the processing of your personal data in the
									following scenarios: (a) if you want us to establish the data&apos;s accuracy; (b)
									where our use of the data is unlawful but you do not want us to erase
									it; (c) where you need us to hold the data even if we no longer require it as you
									need it to establish, exercise or defend legal claims; or (d) you have objected to
									our use of your data but we need to verify whether we have
									overriding legitimate grounds to use it.
								</p>
							</td>
						</tr>
						<tr>
							<td width="400">
								Request the transfer of your personal data to you or to a third party.
							</td>
							<td width="413">
								<p>We will provide to you, or a third party you have chosen, your personal data in a
									structured, commonly used, machine-readable format. Note that this right only
									applies to automated information which you initially provided consent
									for us to use or where we used the information to perform a contract with you.
								</p>
							</td>
						</tr>
					</tbody>
				</table>
				<h3>No fee usually required</h3>
				<p>
					You will not have to pay a fee to access your personal data (or to exercise any of the other
					rights).
				</p>
				<h3>What we may need from you</h3>
				<p>We may need to request specific information from you to help us confirm your identity and
					ensure your right to access your personal data (or to exercise any of your other rights).
					This is a security measure to ensure that personal data is not
					disclosed to any person who has no right to receive it. We may also contact you to ask
					you for further information in relation to your request to speed up our response.
				</p>
				<h3>Time limit to respond</h3>
				<p>We try to respond to all legitimate requests within one month. Occasionally it may take us
					longer than a month if your request is particularly complex or you have made a number of
					requests. In this case, we will notify you and keep you updated.
				</p>
			</li>
		</ol>
	</>
);
