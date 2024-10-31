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
import { COOKIES_ROUTE, PRIVACY_ROUTE } from '../../routes/routes.constants';
import { Indent, Clause, ClauseNo, PaperTitle, SupportEmail, TermsForm } from './LegalLayout/legalLayout.styles';

export const TermsLegalPaper = () => (
	<>
		<PaperTitle>Asite 3D Repo Ltd Terms Of Use</PaperTitle>
		<h1>Please read these terms carefully before accessing 3D Repo</h1>
		<ol>
			<li>
				<h2>Introduction</h2>
			</li>
		</ol>
		<Clause><ClauseNo id="1.1.">1.1.</ClauseNo>
			<p>These terms of use (together with the other documents referred to in them,
				which are collectively referred to here as the <strong>Terms of Use</strong>) tell you the terms
				on which you may access the 3D Repo platform
				and associated services (together the <strong>Service</strong>, as further described in clause 4 below).
			</p>
		</Clause>
		<Clause><ClauseNo id="1.2.">1.2.</ClauseNo>
			<p>The Service is provided by Asite 3D Repo Limited (<strong>3D Repo</strong>,
				<strong> us</strong> or <strong>we</strong>). We are a limited company registered in England and Wales
				under company number 14772861, whose registered
				office is at, <strong>7th Floor, Leconfield House, Curzon Street, London, England, W1J 5JA.</strong> Our registered
				<strong> VAT number is GB 882 0009 44</strong>
			</p>
		</Clause>
		<Clause><ClauseNo id="1.3.">1.3.</ClauseNo>
			<p>These Terms of Use constitute a legal agreement between 3D Repo and you as
				a User (as defined below) of the Service. By accessing the Service using any means, you agree to
				be bound by these Terms of Use. If you do not agree to abide
				by these Terms of Use, you may not access the Service.
			</p>
		</Clause>
		<ol start={2}>
			<li>
				<h2>Becoming a registered User and access to the Service</h2>
			</li>
		</ol>
		<Clause><ClauseNo id="2.1.">2.1.</ClauseNo>
			<p>In order to access the Service, you must first register with 3D Repo as
				a registered user (a <strong>User</strong>). Users may hold a Subscription (as defined below) or
				be invited by a paid Subscriber as a Collaborator
				(as defined below).
			</p>
		</Clause>
		<Clause>
			<ClauseNo id="2.1.">2.1.</ClauseNo>
			<p>Users may use the Service in a business capacity or in a private capacity
				as a consumer (for example for domestic, academic purposes or for leisure or hobby interests). When
				you register with us you must confirm whether you are operating
				as a consumer, an individual sole trader or through an incorporated entity such as a private
				limited company, an LLP, or a partnership.
			</p>
		</Clause>
		<Clause><ClauseNo id="2.3.">2.3.</ClauseNo>
			<p>If you are acting in a business capacity, you represent to us that you are
				duly authorised to access the Service on behalf of your business and that you have the power and
				authority to bind the business as a User in accordance with these Terms of Use.
			</p>
		</Clause>
		<Clause><ClauseNo id="2.4.">2.4.</ClauseNo>
			<p>To become a User, you must complete all of the required fields set out in
				the registration process. You confirm to us that any registration information provided to us is
				complete, accurate and not misleading. Fake User profiles are not permitted.
			</p>
		</Clause>
		<Clause><ClauseNo id="2.5.">2.5.</ClauseNo>
			<p>If you are subscribing to the Service as a paid User (even if we are
				offering you an initial period of free subscription) (a <strong>Subscription</strong>) we may
				request that you provide payment card details to our payment processing provider. We do not store
				credit card details ourselves; they will be encrypted and stored securely by our payment
				processing provider. We reserve the right to suspend provision of the Service until such time
				as we have confirmed that you have provided valid payment card details.
			</p>
		</Clause>
		<Clause><ClauseNo id="2.6.">2.6.</ClauseNo>
			<p>If you have been invited by a paid User of 3D Repo, you may also
				register to be a User as a <strong>Collaborator</strong>. These Terms of Use apply to use as a
				collaborator, except that we may not charge a Fee for access to
				the Service.
			</p>
		</Clause>
		<Clause><ClauseNo id="2.7.">2.7.</ClauseNo>
			<p>The contract between us will only be formed (and your Subscription will
				only begin) when we confirm our acceptance of your registration. If we are unable to accept your
				registration request, we will inform you of this during the
				registration process.
			</p>
		</Clause>
		<Clause><ClauseNo id="2.8.">2.8.</ClauseNo>
			<p>Your Subscription with 3D Repo will be for the period notified in the
				registration process. Your Subscription will automatically renew for additional periods of equal
				duration unless it is ended in accordance with these Terms of
				Use, in particular clause 8.
			</p>
		</Clause>
		<Clause><ClauseNo id="2.9.">2.9.</ClauseNo>
			<p>The Service is intended for use worldwide, as long as it is legal for us
				to provide it and for you to receive it. Wherever you access and use the Service from, you agree
				that you will only use the Service in a manner consistent
				with these Terms of Use and any and all applicable local, national and international laws and
				regulations. To the extent that your use of the Service is not legal in your territory, you may not
				use the Service. Although we cannot provide
				you with legal advice, please contact us at <SupportEmail /> if you require further information about
				our Service and we will try to help you to make this assessment.
			</p>
		</Clause>
		<Clause><ClauseNo id="2.10.">2.10.</ClauseNo>
			<p>
				You are responsible for making all arrangements necessary for you to have access to the Service.
			</p>
		</Clause>
		<ol start={3}>
			<li>
				<h2>Protection of User accounts and passwords</h2>
			</li>
		</ol>
		<Clause><ClauseNo id="3.1.">3.1.</ClauseNo>
			<p>You must treat any User account log ins, User identification codes, passwords
				or any other pieces of information forming part of our security procedures, as confidential. You must
				not disclose them to any third party or authorise others to use your User account.
			</p>
		</Clause>
		<Clause><ClauseNo id="3.2.">3.2.</ClauseNo>
			<p>You may not transfer your User account to any other person or entity. If you
				know or suspect that anyone other than you has obtained your User identification code or password
				and/or has accessed your User account,
				you must immediately notify us at <SupportEmail /> and change your password.
			</p>
		</Clause>
		<Clause><ClauseNo id="3.3.">3.3.</ClauseNo>
			<p>You are responsible for the acts and omissions of any third parties who use
				your User identification code or password to access your User account, whether fraudulent or not,
				and you agree to reimburse us on demand for any loss we may suffer as a result of such use.
			</p>
		</Clause>
		<Clause><ClauseNo id="3.4.">3.4.</ClauseNo>
			<p>We will inform the User prior to user access being disabled. This will be
				made 24 hours before any user account changes are administered.
			</p>
		</Clause>
		<Clause><ClauseNo id="3.5.">3.5.</ClauseNo>
			<p>We will inform the User prior to any action taken on their users. Users
				inactive for more than 12 months are classed as dormant accounts. These accounts will be given a
				notification and action is taken to delete them after a 3
				month grace period.
			</p>
		</Clause>
		<ol start={4}>
			<li>
				<h2>The Service</h2>
			</li>
		</ol>
		<Clause><ClauseNo id="4.1.">4.1.</ClauseNo>
			<p><strong>The Service</strong> Associated documentation means: our
				[<a href={PRIVACY_ROUTE} target="_blank" rel="noopener noreferrer">Privacy Policy</a>], [<Link to={COOKIES_ROUTE}>Cookies Policy</Link>]
				and [<a href="http://3drepo.com/pricing/">Pricing Information</a>].
				The use of the Service is subject to the Associated Documentation. If you give us personal
				data about anyone else in order to collaborate with them on a particular project, you must
				ensure that you have the relevant authorisation to do so
				and for 3D Repo to use that information as set out in our Privacy Policy.
			</p>
		</Clause>
		<Clause><ClauseNo id="4.2.">4.2.</ClauseNo>
			<p>On condition of you agreeing to abide by these Terms of Use, we hereby grant you a
				non-transferable, non-exclusive licence while you remain a User to access the Service in accordance with
				these Terms of Use.
			</p>
		</Clause>
		<Clause><ClauseNo id="4.3.">4.3.</ClauseNo>
			<p>If your receipt of the Service is subject to third party terms, we will notify
				these to you either within these Terms of Use or by obtaining your express acknowledgement of them
				when you access the relevant part of the Service.
			</p>
		</Clause>
		<Clause><ClauseNo id="4.4.">4.4.</ClauseNo>
			<p>If our supply of the Service is delayed, suspended or prevented by an event outside
				our control then we will take steps to minimise the effect of the event. If there is a substantial delay
				you may contact us to
				end your Subscription and receive a refund for Services you have paid for but not received.
			</p>
		</Clause>
		<ol start={5}>
			<li>
				<h2>Charges</h2>
			</li>
		</ol>
		<Clause><ClauseNo id="5.1.">5.1.</ClauseNo>
			<p>The Charges payable by the User for accessing the Service
				(the <strong>Charges</strong>) are as notified to you (including as set out on the 3drepo.io website)
				from time to time. Access to certain functionality may be granted
				by us free of charge at our discretion to Users.
			</p>
		</Clause>
		<Clause><ClauseNo id="5.2.">5.2.</ClauseNo>
			<p>Unless indicated otherwise by us, the Charges are payable monthly in advance via
				our chosen payment processor using the payment card details provided by the User.
				3D Repo does not store any payment card details.
			</p>
		</Clause>
		<Clause><ClauseNo id="5.3.">5.3.</ClauseNo>
			<p>We reserve the right to suspend the provision of the Service in the event that
				Charges are not paid when due.
			</p>
		</Clause>
		<Clause><ClauseNo id="5.4.">5.4.</ClauseNo>
			<p>Unless expressly stated otherwise, Charges are exclusive of all VAT or equivalent
				tax, which will be charged where appropriate.
			</p>
		</Clause>
		<Clause><ClauseNo id="5.5.">5.5.</ClauseNo>
			<p>We reserve the right to change the Charges at any time on written notice to you
				(including by email). If you do not wish to continue with your Subscription under the new Charges, you
				may end it in accordance with clause 10.
			</p>
		</Clause>
		<ol start={6}>
			<li>
				<h2>Submitted Content</h2>
			</li>
		</ol>
		<Clause><ClauseNo id="6.1.">6.1.</ClauseNo>
			<p>As part of your use of the Service, you may submit or upload information, files,
				designs, models, data sets, images, photographs, documents, or other content, whether in a format
				recommended by us or otherwise (together <strong>Submitted Content</strong>).
			</p>
		</Clause>
		<Clause><ClauseNo id="6.2.">6.2.</ClauseNo>
			<p>Except where you have agreed otherwise, we will only use Submitted Content for the
				purposes of providing the Service to you. You acknowledge that provision of the Service necessarily
				involves technical access, processing and transmission of Submitted Content and information relating
				to your use of the Service in accordance with our Data and Privacy Policy.
			</p>
		</Clause>
		<Clause><ClauseNo id="6.3.">6.3.</ClauseNo>
			<p>We do not control, verify, or otherwise check Submitted Content and we take no
				responsibility for it whatsoever, including for its accuracy, completeness, or suitability for use
				in the Service. However, we reserve the right to refuse to process and to remove Submitted Content
				if, in our sole opinion, it does not comply with these Terms of Use or any applicable law, or
				upon the reasonable request of any third party.
			</p>
		</Clause>
		<Clause><ClauseNo id="6.4.">6.4.</ClauseNo>
			<p>
				Whilst we do our best to provide a reliable and accurate Service, you acknowledge that:
			</p>
		</Clause>
		<Indent>
			<Clause>
				<ClauseNo id="6.4.1.">6.4.1.</ClauseNo>
				<p>We take no liability whatsoever in relation to Submitted Content or content submitted by
					other users.
				</p>
			</Clause>
			<Clause>
				<ClauseNo id="6.4.2.">6.4.2.</ClauseNo>
				<p>any use of or reliance by you on any Submitted Content or content submitted by other users
					is entirely at your own risk, we take no responsibility for the consequences of such actions and
					in particular no guarantee is made by us that such actions
					will benefit you or your business in any way; and
				</p>
			</Clause>
			<Clause>
				<ClauseNo id="6.4.3.">6.4.3.</ClauseNo>
				<p>We are a version control and visualisation tool and are not a provider of professional or
					other services of any kind. You are responsible for ensuring that your use of the Service including
					any Submitted Content is sufficient or appropriate for
					any particular use or circumstances including taking separate professional advice as necessary.
				</p>
			</Clause>
		</Indent>
		<Clause><ClauseNo id="6.5.">6.5.</ClauseNo>
			<p>As part of the Service, you may share Submitted Content with Collaborators
				and other third parties by setting permissions on your User account or otherwise using the functionality
				provided by the Service. Such third parties may be able to copy or transfer or save Submitted Content
				outside the Service. You acknowledge that you are solely responsible for ensuring that Submitted Content
				is shared with the appropriate people who are authorised to access it, and for using
				the Service in the appropriate way in that regard and that any such sharing is entirely at your own
				risk. You acknowledge that we have no control over the use made of Submitted Content by Collaborators
				or other third parties to which access has been granted. We have no liability whatsoever to you in
				relation to any loss or damage caused resulting from the sharing of Submitted Content, either through
				the Service or otherwise.
			</p>
		</Clause>
		<Clause><ClauseNo id="6.6.">6.6.</ClauseNo>
			<p>You acknowledge that, if you choose to delete Submitted Content from the Service,
				it may nevertheless persist in backup copies accessible by us. We shall have no liability to you in
				relation to deletion of (or failure to delete) Submitted Content.
			</p>
		</Clause>
		<ol start={7}>
			<li>
				<h2>Intellectual property rights</h2>
			</li>
		</ol>
		<Clause><ClauseNo id="7.1.">7.1.</ClauseNo>
			<p>Whilst the User (or your relevant licensors) will retain ownership of the copyright
				and all other intellectual property rights whatsoever (and wherever existing in the world,
				together <strong> IP Rights</strong>) subsisting in Submitted Content, the User hereby:
			</p>
		</Clause>
		<Indent>
			<Clause><ClauseNo id="7.1.1.">7.1.1.</ClauseNo>
				<p>grants to us (or, as relevant, agrees to procure the grant to us of) a
					licence to use such Submitted Content in accordance with these Terms of Use including in order to
					provide the Service. In particular, if you choose (by selecting the appropriate setting on your
					account) to make Submitted Content publicly available, you thereby authorise us to use that
					Submitted Content in marketing and other publicity materials.
				</p>
			</Clause>
			<Clause><ClauseNo id="7.1.2.">7.1.2.</ClauseNo>
				<p>confirms that the User is duly licensed to submit the Submitted Content to
					us and that the use of Submitted Content in accordance with these Terms of Use will not breach
					a third party&apos;s rights including without limitation any IP
					Rights or rights in confidential information and agrees to indemnify us in respect of any loss or
					damage (including legal fees) incurred by us in the event of a breach of this clause 7.1.2 and
				</p>
			</Clause>
			<Clause><ClauseNo id="7.1.3.">7.1.3.</ClauseNo>
				<p>agrees that we may run data analytics on the Submitted Content for the
					purposes of improving the Service and that we are entitled to disclose such derived data analytics
					relating to Submitted Content to third party contractors
					for such purpose. For the avoidance of doubt, only the derived data analytics, and not the Submitted
					Content itself (including but not limited to models, Project details, Customer or User
					information and associated metadata), will be disclosed under
					this clause 7.1.3; and
				</p>
			</Clause>
			<Clause><ClauseNo id="7.1.4.">7.1.4.</ClauseNo>
				<p>agrees that Submitted Content may become part of a database and that we will
					own the rights in that database.
				</p>
			</Clause>
		</Indent>
		<Clause><ClauseNo id="7.2.">7.2.</ClauseNo>
			<p>Except for Submitted Content, we are the owner or the licensee of all IP Rights
				subsisting in the Service including any software and content used in the provision of the Service or
				provided by the Service. All such rights are reserved, and you have no rights in, or to, the Service
				other than the rights to use it in accordance with these Terms of Use.
			</p>
		</Clause>
		<Clause><ClauseNo id="7.3.">7.3.</ClauseNo>
			<p>You are under no obligation to provide feedback, improvements, or other
				suggestions (<strong>Feedback</strong>) that might improve the Service, however if you do so, you
				acknowledge that 3D Repo is free to use such Feedback in any way and that 3D Repo shall own any and
				all intellectual property rights subsisting in or arising in relation to such Feedback as it may be
				incorporated into the Service.
			</p>
		</Clause>
		<ol start={8}>
			<li>
				<h2>Limitation of our liability</h2>
			</li>
		</ol>
		<Clause><ClauseNo id="8.1.">8.1.</ClauseNo>
			<p>We do not guarantee that the Service will always be available or that
				access to it will be uninterrupted. Access to the Service is permitted on a temporary basis. We may
				suspend, withdraw, or discontinue all or any part of the Service without notice. We will not be
				liable to you if, for any reason, the Service is unavailable at any time or for any period.
			</p>
		</Clause>
		<Clause><ClauseNo id="8.2.">8.2.</ClauseNo>
			<p>In relation to the use of the Service:
			</p>
		</Clause>
		<Indent>
			<Clause><ClauseNo id="8.2.1.">8.2.1.</ClauseNo>
				<p>to the extent permitted by law, we exclude all conditions, warranties,
					representations, or other terms which may apply to the Service, whether express or implied.
				</p>
			</Clause>
			<Clause><ClauseNo id="8.2.2.">8.2.2.</ClauseNo>
				<p>we will have no responsibility or liability to any party other than
					the User; and
				</p>
			</Clause>
			<Clause><ClauseNo id="8.2.3.">8.2.3.</ClauseNo>
				<p>We use reasonable endeavours to remove bugs, viruses, or other malware
					but we do not guarantee that the Service will be secure or free from bugs or viruses. You should
					use your own virus protection software. We will not be liable for any loss or damage caused by a
					virus, distributed denial-of-service attack or other technologically harmful material that may
					infect your computer equipment, computer programs, data, or other proprietary material due to
					your use of the Service.
				</p>
			</Clause>
		</Indent>
		<Clause><ClauseNo id="8.3.">8.3.</ClauseNo>
			<p>We use reasonable endeavours to remove bugs, viruses, or other malware but we do
				not guarantee that the Service will be secure or free from bugs or viruses. You should use
				your own virus protection software. We will not be liable for any loss or damage caused
				by a virus, distributed denial-of-service attack or other technologically harmful material
				that may infect your computer equipment, computer programs, data, or other proprietary
				material due to your use of the Service.
			</p>
		</Clause>
		<Clause><ClauseNo id="8.4.">8.4.</ClauseNo>
			<p>Subject to clauses 9.1 to 9.4, our total liability, whether in contract, tort
				(including negligence), for breach of statutory duty, or otherwise, arising under or in connection with
				these Terms of Use including the receipt of the Service shall be limited to the Charges paid for
				the Service in the 12-month period prior to the date on which the claim arose.
			</p>
		</Clause>
		<Clause><ClauseNo id="8.5.">8.5.</ClauseNo>
			<p>You agree to indemnify us in respect of all loss or damage whatsoever arising from
				your breach of these Terms of Use.
			</p>
		</Clause>
		<ol start={9}>
			<li>
				<h2>Prohibited uses of the Service</h2>
			</li>
		</ol>
		<Clause><ClauseNo id="9.1.">9.1.</ClauseNo>
			<p>You may use the Service only for lawful purposes. You may not use the Service:
			</p>
		</Clause>
		<Indent>
			<Clause><ClauseNo id="9.1.1.">9.1.1.</ClauseNo>
				<p>in any way that breaches any applicable local, national, or international
					law or regulation; or
				</p>
			</Clause>
			<Clause><ClauseNo id="9.1.2.">9.1.2.</ClauseNo>
				<p>in any way that is unlawful or fraudulent or has any unlawful or fraudulent
					purpose or effect.
				</p>
			</Clause>
		</Indent>
		<Clause><ClauseNo id="9.2.">9.2.</ClauseNo>
			<p>You agree:
			</p>
		</Clause>
		<Indent>
			<Clause><ClauseNo id="9.2.1.">9.2.1.</ClauseNo>
				<p>not to (and not to attempt to) modify, copy, disclose, distribute, or
					re-sell any part of the Service (including other users&apos; submitted content and any
					software used in the provision of the Service). In this regard you agree not
					to use crawlers, bots, or other automated means to copy or otherwise access content available
					through the Service.
				</p>
			</Clause>
			<Clause><ClauseNo id="9.2.2.">9.2.2.</ClauseNo>
				<p>not to impersonate any other Users; and
				</p>
			</Clause>
			<Clause><ClauseNo id="9.2.3.">9.2.3.</ClauseNo>
				<p>
					not to access without authority, penetrate, interfere with, damage, or disrupt
					(or attempt to do any of the same): (i) the accounts of other users; (ii) any part of the
					Service or its security measures; (iii) any equipment or network on which the Service is
					stored; or (iv) the Service or any software used in the provision of the Service.
				</p>
			</Clause>
		</Indent>
		<Clause><ClauseNo id="9.3.">9.3.</ClauseNo>
			<p>You also agree to comply with the content standards set out in clause 9.4 below,
				including in relation to all Submitted Content (as defined in clause 7.1 above), and to any interactive
				services associated with the Service. You agree to comply with the spirit of the following standards, as
				well as the letter. The standards apply to each part of any Submitted Content as well as to its whole.
				We reserve the right in our sole discretion to refuse to display, or to remove, Submitted
				Content that we feel does not comply with the standards below.
			</p>
		</Clause>
		<Clause><ClauseNo id="9.4.">9.4.</ClauseNo>
			<p>Your use of the Service (including all Submitted Content) must not:
			</p>
		</Clause>
		<Indent>
			<Clause><ClauseNo id="9.4.1.">9.4.1.</ClauseNo>
				<p>contain any material which is defamatory or inaccurate of any person.
				</p>
			</Clause>
			<Clause><ClauseNo id="9.4.2.">9.4.2.</ClauseNo>
				<p>contain any material which is obscene, offensive, hateful, or
					inflammatory or otherwise be likely to harass, upset, embarrass, alarm, or annoy any other person.
				</p>
			</Clause>
			<Clause><ClauseNo id="9.4.3.">9.4.3.</ClauseNo>
				<p>promote indecent or sexually explicit material or violence.
				</p>
			</Clause>
			<Clause><ClauseNo id="9.4.4.">9.4.4.</ClauseNo>
				<p>promote discrimination based on race, sex, religion, nationality,
					disability, sexual orientation, or age.
				</p>
			</Clause>
			<Clause><ClauseNo id="9.4.5.">9.4.5.</ClauseNo>
				<p>infringe any copyright, database right, trademark, or other intellectual
					property rights of any other person.
				</p>
			</Clause>
			<Clause><ClauseNo id="9.4.6.">9.4.6.</ClauseNo>
				<p>contain photographs, images, or other representations of another person
					without his or her permission (or in the case of a minor, the minor&apos;s legal guardian).
				</p>
			</Clause>
			<Clause><ClauseNo id="9.4.7.">9.4.7.</ClauseNo>
				<p>impersonate any person or to misrepresent your identity or affiliation
					with any person or otherwise be likely to deceive or mislead any person.
				</p>
			</Clause>
			<Clause><ClauseNo id="9.4.8.">9.4.8.</ClauseNo>
				<p>be in breach of any legal duty owed to a third party, such as a
					contractual duty or a duty of confidence.
				</p>
			</Clause>
			<Clause><ClauseNo id="9.4.9.">9.4.9.</ClauseNo>
				<p>advocate, promote, assist, or enable any illegal or unlawful activities
					(including, without limitation, copyright infringement or computer misuse) or intend to defraud,
					swindle, or deceive other users of 3D Repo.
				</p>
			</Clause>
			<Clause><ClauseNo id="9.4.10.">9.4.10.</ClauseNo>
				<p>give the impression that it emanates from us, if this is not the case; or
				</p>
			</Clause>
			<Clause><ClauseNo id="9.4.11.">9.4.11.</ClauseNo>
				<p>disseminate or otherwise disclose another person&apos;s personal
					information without his or her prior permission or collect or solicit another person&apos;s personal
					information for commercial or unlawful purposes.
				</p>
			</Clause>
		</Indent>
		<ol start={10}>
			<li>
				<h2>Ceasing to be a User of 3D Repo</h2>
			</li>
		</ol>
		<Clause><ClauseNo id="10.1.">10.1.</ClauseNo>
			<p><strong>Consumer cancellation right:</strong> If you are registered to use the
				Service as a consumer, you have up to 14 days from the date on which we confirm our acceptance of
				your registration (the &quot;cancellation period&quot;), to cancel your Subscription with us and your
				receipt of the Services, without giving any reason.You may do this by completing the model cancellation
				form set out at the end of these Terms of Use and sending it to us at <SupportEmail />. We will
				reimburse payments received from you no later than 14 days after receipt of your cancellation
				notification. However, you acknowledge that, by logging in to use the Service within the cancellation
				period, you are expressly requesting that we begin the provision of the Service to you. In that case,
				you agree that you will pay for the Service received during the period up to your cancellation.
			</p>
		</Clause>
		<Clause><ClauseNo id="10.2.">10.2.</ClauseNo>
			<p>All Users may end their Subscription (or other access as a User) at any time by
				notifying us using the relevant section of the Service (please note that the terms of any contract
				between us and your business will determine your business&apos; access to the Service, irrespective
				of your status as a User). Your Subscription and any other right to receive the Service will end at
				the end of the your Subscription without cause, you will not receive any refund of Charges already
				paid in advance in relation to the remainder of the relevant Subscription period. Furthermore, if for
				any reason at the date of termination you owe us any Charges, we will take payment for such sums via
				our chosen payment processor or issue an invoice to you for payment.
			</p>
		</Clause>
		<Clause><ClauseNo id="10.3.">10.3.</ClauseNo>
			<p>Should there be any malicious or other activity in breach of these Terms of Use,
				we still reserve the right to temporarily suspend an account until such time as the issue is
				resolved with the User. This is for security reasons.
				During a breach we would not want to keep the system vulnerable by waiting for the User to respond. The
				responses described above are not limited and we may take any other action we reasonably deem
				appropriate.
			</p>
		</Clause>
		<Clause><ClauseNo id="10.4.">10.4.</ClauseNo>
			<p>The User acknowledges that, we will preserve your Submitted Content for a month
				after the date on which the Subscription ends. Therefore, we advise that any Submitted Content required
				after the Subscription ceases is exported prior
				to that date.
			</p>
		</Clause>
		<ol start={11}>
			<li>
				<h2>Changes to these Terms of Use and the Service</h2>
			</li>
		</ol>
		<Clause><ClauseNo id="11.1.">11.1.</ClauseNo>
			<p>You will be asked to read and accept these Terms of Use at the time you first
				access the Service.
			</p>
		</Clause>
		<Clause><ClauseNo id="11.2.">11.2.</ClauseNo>
			<p>We may update the Service from time to time and may change the content and/or
				functionality provided through the Service at any time. If you do not wish to continue with the Service
				after that date, you may end your Subscription in accordance with clause 8 above.
			</p>
		</Clause>
		<Clause><ClauseNo id="11.3.">11.3.</ClauseNo>
			<p>No variation to these Terms of Use may be made save by a variation notified by
				us as described above, or else in writing signed by you and/or the User and us.
			</p>
		</Clause>
		<ol start={12}>
			<li>
				<h2>Trademarks</h2>
			</li>
		</ol>
		<Clause><ClauseNo id="12.1.">12.1.</ClauseNo>
			<p>&quot;3D Repo&quot;, &quot;3D Diff&quot;, &quot;3D Send&quot;,
				&quot;BIM Forensics&quot;, &quot;PlanBase&quot;, &quot;SafetiBase&quot; and &quot;British
				Information Modelling&quot; are trademarks of Asite 3D Repo Limited and are registered or pending trade marks
				in certain territories. All our rights are reserved.
			</p>
		</Clause>
		<ol start={13}>
			<li>
				<h2>Contact us and complaints</h2>
			</li>
		</ol>
		<Clause><ClauseNo id="13.1.">13.1.</ClauseNo>
			<p>To contact us, including with any comments or complaints regarding the
				Service, or if you are concerned that any content accessed through the Service breaches intellectual
				property or other rights, please contact us using the &quot;Contact Us&quot; section of the Service or
				email at <SupportEmail />
			</p>
		</Clause>
		<p><strong>VERSION DATED 30th MARCH 2022</strong></p>
		<TermsForm>
			<p><em>MODEL CANCELLATION FORM FOR CONSUMERS (see clause 11.2):</em></p>
			<p>
				<em>
					To: Asite 3D Repo Limited of 7th Floor, Leconfield House, Curzon Street, London, England, W1J 5JA; <SupportEmail />
				</em>
			</p>
			<p><em>I hereby give notice that I cancel my contract for the supply of the 3D Repo service.</em></p>
			<p><em>I registered as a User on: [DATE]</em></p>
			<p><em>Name of consumer: [NAME]</em></p>
			<p><em>Address of consumer: [ADDRESS and email address]</em></p>
			<p><em>Registered username: [USERNAME]</em></p>
			<p><em>Registered email: [EMAIL]</em></p>
			<p><em>Signature of consumer (only if this form is notified on paper): ..........................</em></p>
			<p><em><br />Date: [DATE]</em></p>
		</TermsForm>
	</>
);
