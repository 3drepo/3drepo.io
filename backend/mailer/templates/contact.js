var html = data => `
	Name: ${data.name}
	<br><br>
	Email: ${data.email}
	<br><br>
	Information:
	<br>
	${data.information}
`;

module.exports =  {
	html: html,
	subject: data => `[Message from 3drepo contact form] - ${data.email}`
};