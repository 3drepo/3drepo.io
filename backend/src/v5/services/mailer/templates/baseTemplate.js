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

const BaseTemplate = {};

BaseTemplate.html = (data) => ` 
 <!doctype html>
 <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
   <head>
      <!-- NAME: FOLLOW UP -->
      <!--[if gte mso 15]>
      <xml>
         <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
         </o:OfficeDocumentSettings>
      </xml>
      <![endif]-->
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>3D Repo Password Reset</title>
      <style type="text/css">
         p{
         margin:10px 0;
         padding:0;
         }
         table{
         border-collapse:collapse;
         }
         h1,h2,h3,h4,h5,h6{
         display:block;
         margin:0;
         padding:0;
         }
         img,a img{
         border:0;
         height:auto;
         outline:none;
         text-decoration:none;
         }
         body,#bodyTable,#bodyCell{
         height:100%;
         margin:0;
         padding:0;
         width:100%;
         }
         .mcnPreviewText{
         display:none !important;
         }
         #outlook a{
         padding:0;
         }
         img{
         -ms-interpolation-mode:bicubic;
         }
         table{
         mso-table-lspace:0pt;
         mso-table-rspace:0pt;
         }
         .ReadMsgBody{
         width:100%;
         }
         .ExternalClass{
         width:100%;
         }
         p,a,li,td,blockquote{
         mso-line-height-rule:exactly;
         }
         a[href^=tel],a[href^=sms]{
         color:inherit;
         cursor:default;
         text-decoration:none;
         }
         p,a,li,td,body,table,blockquote{
         -ms-text-size-adjust:100%;
         -webkit-text-size-adjust:100%;
         }
         .ExternalClass,.ExternalClass p,.ExternalClass td,.ExternalClass div,.ExternalClass span,.ExternalClass font{
         line-height:100%;
         }
         a[x-apple-data-detectors]{
         color:inherit !important;
         text-decoration:none !important;
         font-size:inherit !important;
         font-family:inherit !important;
         font-weight:inherit !important;
         line-height:inherit !important;
         }
         .templateContainer{
         max-width:600px !important;
         }
         a.mcnButton{
         display:block;
         }
         .mcnImage,.mcnRetinaImage{
         vertical-align:bottom;
         }
         .mcnTextContent{
         word-break:break-word;
         }
         .mcnTextContent img{
         height:auto !important;
         }
         .mcnDividerBlock{
         table-layout:fixed !important;
         }
         /*
         @tab Page
         @section Heading 1
         @style heading 1
         */
         h1{
         /*@editable*/color:#222222;
         /*@editable*/font-family:Helvetica;
         /*@editable*/font-size:40px;
         /*@editable*/font-style:normal;
         /*@editable*/font-weight:bold;
         /*@editable*/line-height:150%;
         /*@editable*/letter-spacing:normal;
         /*@editable*/text-align:center;
         }
         /*
         @tab Page
         @section Heading 2
         @style heading 2
         */
         h2{
         /*@editable*/color:#222222;
         /*@editable*/font-family:Helvetica;
         /*@editable*/font-size:34px;
         /*@editable*/font-style:normal;
         /*@editable*/font-weight:bold;
         /*@editable*/line-height:150%;
         /*@editable*/letter-spacing:normal;
         /*@editable*/text-align:left;
         }
         /*
         @tab Page
         @section Heading 3
         @style heading 3
         */
         h3{
         /*@editable*/color:#444444;
         /*@editable*/font-family:Helvetica;
         /*@editable*/font-size:22px;
         /*@editable*/font-style:normal;
         /*@editable*/font-weight:bold;
         /*@editable*/line-height:150%;
         /*@editable*/letter-spacing:normal;
         /*@editable*/text-align:center;
         }
         /*
         @tab Page
         @section Heading 4
         @style heading 4
         */
         h4{
         /*@editable*/color:#eeeeee;
         /*@editable*/font-family:Georgia;
         /*@editable*/font-size:20px;
         /*@editable*/font-style:italic;
         /*@editable*/font-weight:normal;
         /*@editable*/line-height:125%;
         /*@editable*/letter-spacing:normal;
         /*@editable*/text-align:left;
         }
         /*
         @tab Header
         @section Header Container Style
         */
         #templateHeader{
         /*@editable*/background-color:#f0f0f0;
         /*@editable*/background-image:none;
         /*@editable*/background-repeat:no-repeat;
         /*@editable*/background-position:50% 0%;
         /*@editable*/background-size:cover;
         /*@editable*/border-top:0;
         /*@editable*/border-bottom:0;
         /*@editable*/padding-top:0px;
         /*@editable*/padding-bottom:0px;
         }
         /*
         @tab Header
         @section Header Interior Style
         */
         .headerContainer{
         /*@editable*/background-color:#transparent;
         /*@editable*/background-image:none;
         /*@editable*/background-repeat:no-repeat;
         /*@editable*/background-position:center;
         /*@editable*/background-size:cover;
         /*@editable*/border-top:0;
         /*@editable*/border-bottom:0;
         /*@editable*/padding-top:0;
         /*@editable*/padding-bottom:0;
         }
         /*
         @tab Header
         @section Header Text
         */
         .headerContainer .mcnTextContent,.headerContainer .mcnTextContent p{
         /*@editable*/color:#757575;
         /*@editable*/font-family:Helvetica;
         /*@editable*/font-size:16px;
         /*@editable*/line-height:150%;
         /*@editable*/text-align:left;
         }
         /*
         @tab Header
         @section Header Link
         */
         .headerContainer .mcnTextContent a,.headerContainer .mcnTextContent p a{
         /*@editable*/color:#007C89;
         /*@editable*/font-weight:normal;
         /*@editable*/text-decoration:underline;
         }
         /*
         @tab Body
         @section Body Container Style
         */
         #templateBody{
         /*@editable*/background-color:#f0f0f0;
         /*@editable*/background-image:none;
         /*@editable*/background-repeat:no-repeat;
         /*@editable*/background-position:50% 50%;
         /*@editable*/background-size:cover;
         /*@editable*/border-top:0;
         /*@editable*/border-bottom:0;
         /*@editable*/padding-top:50px;
         /*@editable*/padding-bottom:50px;
         }
         /*
         @tab Body
         @section Body Interior Style
         */
         .bodyContainer{
         /*@editable*/background-color:#ffffff;
         /*@editable*/background-image:none;
         /*@editable*/background-repeat:no-repeat;
         /*@editable*/background-position:center;
         /*@editable*/background-size:cover;
         /*@editable*/border-top:0;
         /*@editable*/border-bottom:0;
         /*@editable*/padding-top:25px;
         /*@editable*/padding-bottom:25px;
         }
         /*
         @tab Body
         @section Body Text
         */
         .bodyContainer .mcnTextContent,.bodyContainer .mcnTextContent p{
         /*@editable*/color:#757575;
         /*@editable*/font-family:Helvetica;
         /*@editable*/font-size:16px;
         /*@editable*/line-height:150%;
         /*@editable*/text-align:left;
         }
         /*
         @tab Body
         @section Body Link
         */
         .bodyContainer .mcnTextContent a,.bodyContainer .mcnTextContent p a{
         /*@editable*/color:#007C89;
         /*@editable*/font-weight:normal;
         /*@editable*/text-decoration:underline;
         }
         /*
         @tab Footer
         @section Footer Style
         */
         #templateFooter{
         /*@editable*/background-color:#f0f0f0;
         /*@editable*/background-image:none;
         /*@editable*/background-repeat:no-repeat;
         /*@editable*/background-position:center;
         /*@editable*/background-size:cover;
         /*@editable*/border-top:0;
         /*@editable*/border-bottom:1px none ;
         /*@editable*/padding-top:0px;
         /*@editable*/padding-bottom:0px;
         }
         /*
         @tab Footer
         @section Footer Interior Style
         */
         .footerContainer{
         /*@editable*/background-color:#transparent;
         /*@editable*/background-image:none;
         /*@editable*/background-repeat:no-repeat;
         /*@editable*/background-position:center;
         /*@editable*/background-size:cover;
         /*@editable*/border-top:0;
         /*@editable*/border-bottom:0;
         /*@editable*/padding-top:0;
         /*@editable*/padding-bottom:0;
         }
         /*
         @tab Footer
         @section Footer Text
         */
         .footerContainer .mcnTextContent,.footerContainer .mcnTextContent p{
         /*@editable*/color:#FFFFFF;
         /*@editable*/font-family:Helvetica;
         /*@editable*/font-size:12px;
         /*@editable*/line-height:150%;
         /*@editable*/text-align:center;
         }
         /*
         @tab Footer
         @section Footer Link
         */
         .footerContainer .mcnTextContent a,.footerContainer .mcnTextContent p a{
         /*@editable*/color:#FFFFFF;
         /*@editable*/font-weight:normal;
         /*@editable*/text-decoration:underline;
         }
         @media only screen and (min-width:768px){
         .templateContainer{
         width:600px !important;
         }
         } @media only screen and (max-width: 480px){
         body,table,td,p,a,li,blockquote{
         -webkit-text-size-adjust:none !important;
         }
         } @media only screen and (max-width: 480px){
         body{
         width:100% !important;
         min-width:100% !important;
         }
         } @media only screen and (max-width: 480px){
         .mcnRetinaImage{
         max-width:100% !important;
         }
         } @media only screen and (max-width: 480px){
         .mcnImage{
         width:100% !important;
         }
         } @media only screen and (max-width: 480px){
         .mcnCartContainer,.mcnCaptionTopContent,.mcnRecContentContainer,.mcnCaptionBottomContent,.mcnTextContentContainer,.mcnBoxedTextContentContainer,.mcnImageGroupContentContainer,.mcnCaptionLeftTextContentContainer,.mcnCaptionRightTextContentContainer,.mcnCaptionLeftImageContentContainer,.mcnCaptionRightImageContentContainer,.mcnImageCardLeftTextContentContainer,.mcnImageCardRightTextContentContainer,.mcnImageCardLeftImageContentContainer,.mcnImageCardRightImageContentContainer{
         max-width:100% !important;
         width:100% !important;
         }
         } @media only screen and (max-width: 480px){
         .mcnBoxedTextContentContainer{
         min-width:100% !important;
         }
         } @media only screen and (max-width: 480px){
         .mcnImageGroupContent{
         padding:9px !important;
         }
         } @media only screen and (max-width: 480px){
         .mcnCaptionLeftContentOuter .mcnTextContent,.mcnCaptionRightContentOuter .mcnTextContent{
         padding-top:9px !important;
         }
         } @media only screen and (max-width: 480px){
         .mcnImageCardTopImageContent,.mcnCaptionBottomContent:last-child .mcnCaptionBottomImageContent,.mcnCaptionBlockInner .mcnCaptionTopContent:last-child .mcnTextContent{
         padding-top:18px !important;
         }
         } @media only screen and (max-width: 480px){
         .mcnImageCardBottomImageContent{
         padding-bottom:9px !important;
         }
         } @media only screen and (max-width: 480px){
         .mcnImageGroupBlockInner{
         padding-top:0 !important;
         padding-bottom:0 !important;
         }
         } @media only screen and (max-width: 480px){
         .mcnImageGroupBlockOuter{
         padding-top:9px !important;
         padding-bottom:9px !important;
         }
         } @media only screen and (max-width: 480px){
         .mcnTextContent,.mcnBoxedTextContentColumn{
         padding-right:18px !important;
         padding-left:18px !important;
         }
         } @media only screen and (max-width: 480px){
         .mcnImageCardLeftImageContent,.mcnImageCardRightImageContent{
         padding-right:18px !important;
         padding-bottom:0 !important;
         padding-left:18px !important;
         }
         } @media only screen and (max-width: 480px){
         .mcpreview-image-uploader{
         display:none !important;
         width:100% !important;
         }
         } @media only screen and (max-width: 480px){
         /*
         @tab Mobile Styles
         @section Heading 1
         @tip Make the first-level headings larger in size for better readability on small screens.
         */
         h1{
         /*@editable*/font-size:30px !important;
         /*@editable*/line-height:125% !important;
         }
         } @media only screen and (max-width: 480px){
         /*
         @tab Mobile Styles
         @section Heading 2
         @tip Make the second-level headings larger in size for better readability on small screens.
         */
         h2{
         /*@editable*/font-size:26px !important;
         /*@editable*/line-height:125% !important;
         }
         } @media only screen and (max-width: 480px){
         /*
         @tab Mobile Styles
         @section Heading 3
         @tip Make the third-level headings larger in size for better readability on small screens.
         */
         h3{
         /*@editable*/font-size:20px !important;
         /*@editable*/line-height:150% !important;
         }
         } @media only screen and (max-width: 480px){
         /*
         @tab Mobile Styles
         @section Heading 4
         @tip Make the fourth-level headings larger in size for better readability on small screens.
         */
         h4{
         /*@editable*/font-size:18px !important;
         /*@editable*/line-height:150% !important;
         }
         } @media only screen and (max-width: 480px){
         /*
         @tab Mobile Styles
         @section Boxed Text
         @tip Make the boxed text larger in size for better readability on small screens. We recommend a font size of at least 16px.
         */
         .mcnBoxedTextContentContainer .mcnTextContent,.mcnBoxedTextContentContainer .mcnTextContent p{
         /*@editable*/font-size:14px !important;
         /*@editable*/line-height:150% !important;
         }
         } @media only screen and (max-width: 480px){
         /*
         @tab Mobile Styles
         @section Header Text
         @tip Make the header text larger in size for better readability on small screens.
         */
         .headerContainer .mcnTextContent,.headerContainer .mcnTextContent p{
         /*@editable*/font-size:16px !important;
         /*@editable*/line-height:150% !important;
         }
         } @media only screen and (max-width: 480px){
         /*
         @tab Mobile Styles
         @section Body Text
         @tip Make the body text larger in size for better readability on small screens. We recommend a font size of at least 16px.
         */
         .bodyContainer .mcnTextContent,.bodyContainer .mcnTextContent p{
         /*@editable*/font-size:16px !important;
         /*@editable*/line-height:150% !important;
         }
         } @media only screen and (max-width: 480px){
         /*
         @tab Mobile Styles
         @section Footer Text
         @tip Make the footer content text larger in size for better readability on small screens.
         */
         .footerContainer .mcnTextContent,.footerContainer .mcnTextContent p{
         /*@editable*/font-size:14px !important;
         /*@editable*/line-height:150% !important;
         }
         }
      </style>
   </head>
   <body>
      <center>
         <table align="center" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable">
            <tr>
               <td align="center" valign="top" id="bodyCell">
                  <!-- BEGIN TEMPLATE // -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                     <tr>
                        <td align="center" valign="top" id="templateHeader" data-template-container>
                           <!--[if (gte mso 9)|(IE)]>
                           <table align="center" border="0" cellspacing="0" cellpadding="0" width="600" style="width:600px;">
                              <tr>
                                 <td align="center" valign="top" width="600" style="width:600px;">
                                    <![endif]-->
                                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" class="templateContainer">
                                       <tr>
                                          <td valign="top" class="headerContainer">
                                             <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnImageBlock" style="min-width:100%;">
                                                <tbody class="mcnImageBlockOuter">
                                                   <tr>
                                                      <td valign="top" style="padding:9px" class="mcnImageBlockInner">
                                                         <table align="left" width="100%" border="0" cellpadding="0" cellspacing="0" class="mcnImageContentContainer" style="min-width:100%;">
                                                            <tbody>
                                                               <tr>
                                                                  <td class="mcnImageContent" valign="top" style="padding-right: 9px; padding-left: 9px; padding-top: 0; padding-bottom: 0; text-align:center;">
                                                                     <a href="https://www.3drepo.io">
                                                                     <img align="center" alt="" src="https://3drepo.com/wp-content/uploads/email/3D%20Repo%20Logo.png"
                                                                        width="300" style="max-width: 300px; padding-bottom: 0px; vertical-align: bottom; display: inline !important; border-radius: 0%;" class="mcnImage">
                                                                     </a>
                                                                  </td>
                                                               </tr>
                                                            </tbody>
                                                         </table>
                                                      </td>
                                                   </tr>
                                                </tbody>
                                             </table>
                                          </td>
                                       </tr>
                                    </table>
                                    <!--[if (gte mso 9)|(IE)]>
                                 </td>
                              </tr>
                           </table>
                           <![endif]-->
                        </td>
                     </tr>
                     <tr>
                        <td align="center" valign="top" id="templateBody" data-template-container>
                           <!--[if (gte mso 9)|(IE)]>
                           <table align="center" border="0" cellspacing="0" cellpadding="0" width="600" style="width:600px;">
                              <tr>
                                 <td align="center" valign="top" width="600" style="width:600px;">
                                    <![endif]-->
                                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" class="templateContainer">
                                       <tr>
                                          <td valign="top" class="bodyContainer">
                                             <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width:100%;">
                                                <tbody class="mcnTextBlockOuter">
                                                   <tr>
                                                      <td valign="top" class="mcnTextBlockInner" style="padding-top:9px;">
                                                         <!--[if mso]>
                                                         <table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;">
                                                            <tr>
                                                               <![endif]-->
                                                               <!--[if mso]>
                                                               <td valign="top" width="600" style="width:600px;">
                                                                  <![endif]-->
                                                                  <table align="left" border="0" cellpadding="0" cellspacing="0" style="max-width:100%; min-width:100%;" width="100%" class="mcnTextContentContainer">
                                                                     <tbody>
                                                                        <tr>
                                                                           <td valign="top" class="mcnTextContent" style="padding-top:0; padding-right:18px; padding-bottom:9px; padding-left:18px;">
                                                                              <span style="font-size:18px"><strong><span style="color:#808080"><span style="font-family:roboto,helvetica neue,helvetica,arial,sans-serif">Hello ${data.firstName},</span></span></strong></span>
                                                                           </td>
                                                                        </tr>
                                                                     </tbody>
                                                                  </table>
                                                                  <!--[if mso]>
                                                               </td>
                                                               <![endif]-->
                                                               <!--[if mso]>
                                                            </tr>
                                                         </table>
                                                         <![endif]-->
                                                      </td>
                                                   </tr>
                                                </tbody>
                                             </table>
                                             ${data.emailContent}
                                             <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width:100%;">
                                                <tbody class="mcnTextBlockOuter">
                                                   <tr>
                                                      <td valign="top" class="mcnTextBlockInner" style="padding-top:9px;">
                                                         <!--[if mso]>
                                                         <table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;">
                                                            <tr>
                                                               <![endif]-->
                                                               <!--[if mso]>
                                                               <td valign="top" width="600" style="width:600px;">
                                                                  <![endif]-->
                                                                  <table align="left" border="0" cellpadding="0" cellspacing="0" style="max-width:100%; min-width:100%;" width="100%" class="mcnTextContentContainer">
                                                                     <tbody>
                                                                        <tr>
                                                                           <td valign="top" class="mcnTextContent" style="padding: 0px 18px 9px; line-height: 200%; text-align: left;">
                                                                              <span style="font-size:15px"><span style="font-family:roboto,helvetica neue,helvetica,arial,sans-serif">All the best,</span></span>
                                                                           </td>
                                                                        </tr>
                                                                     </tbody>
                                                                  </table>
                                                                  <!--[if mso]>
                                                               </td>
                                                               <![endif]-->
                                                               <!--[if mso]>
                                                            </tr>
                                                         </table>
                                                         <![endif]-->
                                                      </td>
                                                   </tr>
                                                </tbody>
                                             </table>
                                             <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width:100%;">
                                                <tbody class="mcnTextBlockOuter">
                                                   <tr>
                                                      <td valign="top" class="mcnTextBlockInner" style="padding-top:9px;">
                                                         <!--[if mso]>
                                                         <table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;">
                                                            <tr>
                                                               <![endif]-->
                                                               <!--[if mso]>
                                                               <td valign="top" width="600" style="width:600px;">
                                                                  <![endif]-->
                                                                  <table align="left" border="0" cellpadding="0" cellspacing="0" style="max-width:100%; min-width:100%;" width="100%" class="mcnTextContentContainer">
                                                                     <tbody>
                                                                        <tr>
                                                                           <td valign="top" class="mcnTextContent" style="padding: 0px 18px 9px; line-height: 200%; text-align: left;">
                                                                              <span style="font-size:15px">3D Repo Team</span>
                                                                           </td>
                                                                        </tr>
                                                                     </tbody>
                                                                  </table>
                                                                  <!--[if mso]>
                                                               </td>
                                                               <![endif]-->
                                                               <!--[if mso]>
                                                            </tr>
                                                         </table>
                                                         <![endif]-->
                                                      </td>
                                                   </tr>
                                                </tbody>
                                             </table>
                                          </td>
                                       </tr>
                                    </table>
                                    <!--[if (gte mso 9)|(IE)]>
                                 </td>
                              </tr>
                           </table>
                           <![endif]-->
                        </td>
                     </tr>
                     <tr>
                        <td align="center" valign="top" id="templateFooter" data-template-container>
                           <!--[if (gte mso 9)|(IE)]>
                           <table align="center" border="0" cellspacing="0" cellpadding="0" width="600" style="width:600px;">
                              <tr>
                                 <td align="center" valign="top" width="600" style="width:600px;">
                                    <![endif]-->
                                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" class="templateContainer">
                                       <tr>
                                          <td valign="top" class="footerContainer">
                                             <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnFollowBlock" style="min-width:100%;">
                                                <tbody class="mcnFollowBlockOuter">
                                                   <tr>
                                                      <td align="center" valign="top" style="padding:9px" class="mcnFollowBlockInner">
                                                         <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnFollowContentContainer" style="min-width:100%;">
                                                            <tbody>
                                                               <tr>
                                                                  <td align="center" style="padding-left:9px;padding-right:9px;">
                                                                     <table border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%; border: 1px none;" class="mcnFollowContent">
                                                                        <tbody>
                                                                           <tr>
                                                                              <td align="center" valign="top" style="padding-top:9px; padding-right:9px; padding-left:9px;">
                                                                                 <table align="center" border="0" cellpadding="0" cellspacing="0">
                                                                                    <tbody>
                                                                                       <tr>
                                                                                          <td align="center" valign="top">
                                                                                             <!--[if mso]>
                                                                                             <table align="center" border="0" cellspacing="0" cellpadding="0">
                                                                                                <tr>
                                                                                                   <![endif]-->
                                                                                                   <!--[if mso]>
                                                                                                   <td align="center" valign="top">
                                                                                                      <![endif]-->
                                                                                                      <table align="left" border="0" cellpadding="0" cellspacing="0" style="display:inline;">
                                                                                                         <tbody>
                                                                                                            <tr>
                                                                                                               <td valign="top" style="padding-right:10px; padding-bottom:9px;" class="mcnFollowContentItemContainer">
                                                                                                                  <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnFollowContentItem">
                                                                                                                     <tbody>
                                                                                                                        <tr>
                                                                                                                           <td align="left" valign="middle" style="padding-top:5px; padding-right:10px; padding-bottom:5px; padding-left:9px;">
                                                                                                                              <table align="left" border="0" cellpadding="0" cellspacing="0" width="">
                                                                                                                                 <tbody>
                                                                                                                                    <tr>
                                                                                                                                       <td align="center" valign="middle" width="24" class="mcnFollowIconContent">
                                                                                                                                          <a href="https://twitter.com/3drepo" target="_blank"><img src="https://cdn-images.mailchimp.com/icons/social-block-v2/gray-twitter-48.png" style="display:block;" height="24" width="24" class=""></a>
                                                                                                                                       </td>
                                                                                                                                    </tr>
                                                                                                                                 </tbody>
                                                                                                                              </table>
                                                                                                                           </td>
                                                                                                                        </tr>
                                                                                                                     </tbody>
                                                                                                                  </table>
                                                                                                               </td>
                                                                                                            </tr>
                                                                                                         </tbody>
                                                                                                      </table>
                                                                                                      <!--[if mso]>
                                                                                                   </td>
                                                                                                   <![endif]-->
                                                                                                   <!--[if mso]>
                                                                                                   <td align="center" valign="top">
                                                                                                      <![endif]-->
                                                                                                      <table align="left" border="0" cellpadding="0" cellspacing="0" style="display:inline;">
                                                                                                         <tbody>
                                                                                                            <tr>
                                                                                                               <td valign="top" style="padding-right:10px; padding-bottom:9px;" class="mcnFollowContentItemContainer">
                                                                                                                  <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnFollowContentItem">
                                                                                                                     <tbody>
                                                                                                                        <tr>
                                                                                                                           <td align="left" valign="middle" style="padding-top:5px; padding-right:10px; padding-bottom:5px; padding-left:9px;">
                                                                                                                              <table align="left" border="0" cellpadding="0" cellspacing="0" width="">
                                                                                                                                 <tbody>
                                                                                                                                    <tr>
                                                                                                                                       <td align="center" valign="middle" width="24" class="mcnFollowIconContent">
                                                                                                                                          <a href="https://en-gb.facebook.com/3DRepo/" target="_blank"><img src="https://cdn-images.mailchimp.com/icons/social-block-v2/gray-facebook-48.png" style="display:block;" height="24" width="24" class=""></a>
                                                                                                                                       </td>
                                                                                                                                    </tr>
                                                                                                                                 </tbody>
                                                                                                                              </table>
                                                                                                                           </td>
                                                                                                                        </tr>
                                                                                                                     </tbody>
                                                                                                                  </table>
                                                                                                               </td>
                                                                                                            </tr>
                                                                                                         </tbody>
                                                                                                      </table>
                                                                                                      <!--[if mso]>
                                                                                                   </td>
                                                                                                   <![endif]-->
                                                                                                   <!--[if mso]>
                                                                                                   <td align="center" valign="top">
                                                                                                      <![endif]-->
                                                                                                      <table align="left" border="0" cellpadding="0" cellspacing="0" style="display:inline;">
                                                                                                         <tbody>
                                                                                                            <tr>
                                                                                                               <td valign="top" style="padding-right:10px; padding-bottom:9px;" class="mcnFollowContentItemContainer">
                                                                                                                  <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnFollowContentItem">
                                                                                                                     <tbody>
                                                                                                                        <tr>
                                                                                                                           <td align="left" valign="middle" style="padding-top:5px; padding-right:10px; padding-bottom:5px; padding-left:9px;">
                                                                                                                              <table align="left" border="0" cellpadding="0" cellspacing="0" width="">
                                                                                                                                 <tbody>
                                                                                                                                    <tr>
                                                                                                                                       <td align="center" valign="middle" width="24" class="mcnFollowIconContent">
                                                                                                                                          <a href="https://www.linkedin.com/company/3d-repo" target="_blank"><img src="https://cdn-images.mailchimp.com/icons/social-block-v2/gray-linkedin-48.png" style="display:block;" height="24" width="24" class=""></a>
                                                                                                                                       </td>
                                                                                                                                    </tr>
                                                                                                                                 </tbody>
                                                                                                                              </table>
                                                                                                                           </td>
                                                                                                                        </tr>
                                                                                                                     </tbody>
                                                                                                                  </table>
                                                                                                               </td>
                                                                                                            </tr>
                                                                                                         </tbody>
                                                                                                      </table>
                                                                                                      <!--[if mso]>
                                                                                                   </td>
                                                                                                   <![endif]-->
                                                                                                   <!--[if mso]>
                                                                                                   <td align="center" valign="top">
                                                                                                      <![endif]-->
                                                                                                      <table align="left" border="0" cellpadding="0" cellspacing="0" style="display:inline;">
                                                                                                         <tbody>
                                                                                                            <tr>
                                                                                                               <td valign="top" style="padding-right:10px; padding-bottom:9px;" class="mcnFollowContentItemContainer">
                                                                                                                  <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnFollowContentItem">
                                                                                                                     <tbody>
                                                                                                                        <tr>
                                                                                                                           <td align="left" valign="middle" style="padding-top:5px; padding-right:10px; padding-bottom:5px; padding-left:9px;">
                                                                                                                              <table align="left" border="0" cellpadding="0" cellspacing="0" width="">
                                                                                                                                 <tbody>
                                                                                                                                    <tr>
                                                                                                                                       <td align="center" valign="middle" width="24" class="mcnFollowIconContent">
                                                                                                                                          <a href="https://github.com/3drepo" target="_blank"><img src="https://cdn-images.mailchimp.com/icons/social-block-v2/gray-github-48.png" style="display:block;" height="24" width="24" class=""></a>
                                                                                                                                       </td>
                                                                                                                                    </tr>
                                                                                                                                 </tbody>
                                                                                                                              </table>
                                                                                                                           </td>
                                                                                                                        </tr>
                                                                                                                     </tbody>
                                                                                                                  </table>
                                                                                                               </td>
                                                                                                            </tr>
                                                                                                         </tbody>
                                                                                                      </table>
                                                                                                      <!--[if mso]>
                                                                                                   </td>
                                                                                                   <![endif]-->
                                                                                                   <!--[if mso]>
                                                                                                   <td align="center" valign="top">
                                                                                                      <![endif]-->
                                                                                                      <table align="left" border="0" cellpadding="0" cellspacing="0" style="display:inline;">
                                                                                                         <tbody>
                                                                                                            <tr>
                                                                                                               <td valign="top" style="padding-right:10px; padding-bottom:9px;" class="mcnFollowContentItemContainer">
                                                                                                                  <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnFollowContentItem">
                                                                                                                     <tbody>
                                                                                                                        <tr>
                                                                                                                           <td align="left" valign="middle" style="padding-top:5px; padding-right:10px; padding-bottom:5px; padding-left:9px;">
                                                                                                                              <table align="left" border="0" cellpadding="0" cellspacing="0" width="">
                                                                                                                                 <tbody>
                                                                                                                                    <tr>
                                                                                                                                       <td align="center" valign="middle" width="24" class="mcnFollowIconContent">
                                                                                                                                          <a href="https://www.youtube.com/channel/UC9ofPaxxyQy0jPEB9YlNpuA" target="_blank"><img src="https://cdn-images.mailchimp.com/icons/social-block-v2/gray-youtube-48.png" style="display:block;" height="24" width="24" class=""></a>
                                                                                                                                       </td>
                                                                                                                                    </tr>
                                                                                                                                 </tbody>
                                                                                                                              </table>
                                                                                                                           </td>
                                                                                                                        </tr>
                                                                                                                     </tbody>
                                                                                                                  </table>
                                                                                                               </td>
                                                                                                            </tr>
                                                                                                         </tbody>
                                                                                                      </table>
                                                                                                      <!--[if mso]>
                                                                                                   </td>
                                                                                                   <![endif]-->
                                                                                                   <!--[if mso]>
                                                                                                   <td align="center" valign="top">
                                                                                                      <![endif]-->
                                                                                                      <table align="left" border="0" cellpadding="0" cellspacing="0" style="display:inline;">
                                                                                                         <tbody>
                                                                                                            <tr>
                                                                                                               <td valign="top" style="padding-right:0; padding-bottom:9px;" class="mcnFollowContentItemContainer">
                                                                                                                  <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnFollowContentItem">
                                                                                                                     <tbody>
                                                                                                                        <tr>
                                                                                                                           <td align="left" valign="middle" style="padding-top:5px; padding-right:10px; padding-bottom:5px; padding-left:9px;">
                                                                                                                              <table align="left" border="0" cellpadding="0" cellspacing="0" width="">
                                                                                                                                 <tbody>
                                                                                                                                    <tr>
                                                                                                                                       <td align="center" valign="middle" width="24" class="mcnFollowIconContent">
                                                                                                                                          <a href="http://www.3drepo.org" target="_blank"><img src="https://cdn-images.mailchimp.com/icons/social-block-v2/gray-link-48.png" style="display:block;" height="24" width="24" class=""></a>
                                                                                                                                       </td>
                                                                                                                                    </tr>
                                                                                                                                 </tbody>
                                                                                                                              </table>
                                                                                                                           </td>
                                                                                                                        </tr>
                                                                                                                     </tbody>
                                                                                                                  </table>
                                                                                                               </td>
                                                                                                            </tr>
                                                                                                         </tbody>
                                                                                                      </table>
                                                                                                      <!--[if mso]>
                                                                                                   </td>
                                                                                                   <![endif]-->
                                                                                                   <!--[if mso]>
                                                                                                </tr>
                                                                                             </table>
                                                                                             <![endif]-->
                                                                                          </td>
                                                                                       </tr>
                                                                                    </tbody>
                                                                                 </table>
                                                                              </td>
                                                                           </tr>
                                                                        </tbody>
                                                                     </table>
                                                                  </td>
                                                               </tr>
                                                            </tbody>
                                                         </table>
                                                      </td>
                                                   </tr>
                                                </tbody>
                                             </table>
                                             <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width:100%;">
                                                <tbody class="mcnTextBlockOuter">
                                                   <tr>
                                                      <td valign="top" class="mcnTextBlockInner" style="padding-top:9px;">
                                                         <!--[if mso]>
                                                         <table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;">
                                                            <tr>
                                                               <![endif]-->
                                                               <!--[if mso]>
                                                               <td valign="top" width="600" style="width:600px;">
                                                                  <![endif]-->
                                                                  <table align="left" border="0" cellpadding="0" cellspacing="0" style="max-width:100%; min-width:100%;" width="100%" class="mcnTextContentContainer">
                                                                     <tbody>
                                                                        <tr>
                                                                           <td valign="top" class="mcnTextContent" style="padding-top:0; padding-right:18px; padding-bottom:9px; padding-left:18px;">
                                                                              <span style="font-family:roboto,helvetica neue,helvetica,arial,sans-serif"><span style="color:#696969"><em>Copyright © 2019 3D Repo, All rights reserved.</em><br>
                                                                              <br>
                                                                              <strong>Our mailing address is:</strong><br>
                                                                              3D Repo<br>
                                                                              307 Euston Road<br>
                                                                              Bloomsbury<br>
                                                                              London, NW1 3AD<br>
                                                                              United Kingdom</span></span>
                                                                           </td>
                                                                        </tr>
                                                                     </tbody>
                                                                  </table>
                                                                  <!--[if mso]>
                                                               </td>
                                                               <![endif]-->
                                                               <!--[if mso]>
                                                            </tr>
                                                         </table>
                                                         <![endif]-->
                                                      </td>
                                                   </tr>
                                                </tbody>
                                             </table>
                                          </td>
                                       </tr>
                                    </table>
                                    <!--[if (gte mso 9)|(IE)]>
                                 </td>
                              </tr>
                           </table>
                           <![endif]-->
                        </td>
                     </tr>
                  </table>
                  <!-- // END TEMPLATE -->
               </td>
            </tr>
         </table>
      </center>
   </body>
</html>`;

module.exports = BaseTemplate;
