'use strict';

function signUpAndLogin(params){

	let server = params.server;
	let request = params.request;
	let User = params.User;
	let systemLogger = params.systemLogger;
	let username = params.username;
	let password = params.password;
	let email = params.email;
	let done = params.done;
	let agent = params.agent;
	let expect = params.expect;
	let noBasicPlan = params.noBasicPlan;

	//hack: by starting the server earlier all the mongoose models like User will be connected to db without any configuration
	request(server).get('/info').end(() => {

		agent = request.agent(server);

		// create a user
		return User.createUser(systemLogger, username, password, {
			email: email
		}, 200000).then(emailVerifyToken => {
			return User.verify(username, emailVerifyToken.token, {skipImportToyModel : true, skipCreateBasicPlan: noBasicPlan});
		}).then(user => {
			
			//login
			agent.post('/login')
			.send({ username, password })
			.expect(200, function(err, res){
				expect(res.body.username).to.equal(username);
				console.log(typeof done)
				done(err, agent);

			});

		}).catch(err => {
			done(err, agent);
		});

	});

}

function signUpAndLoginAndCreateModel(params){

	let server = params.server;
	let request = params.request;
	let User = params.User;
	let systemLogger = params.systemLogger;
	let username = params.username;
	let password = params.password;
	let email = params.email;
	let done = params.done;
	let agent = params.agent;
	let type = params.type;
	let desc = params.desc;
	let expect = params.expect;
	let model = params.model;
	let noBasicPlan = params.noBasicPlan;
	let unit = params.unit;

	signUpAndLogin({
		server, request, agent, expect, User, systemLogger,
		username, password, email, noBasicPlan, 
		done: function(err, _agent){

			agent = _agent;

			if(err){
				return done(err, agent);
			}

			//create a model
			agent.post(`/${username}/${model}`)
			.send({ type, desc, unit })
			.expect(200, function(err, res){
				done(err, agent);
			});
		}
	});

}

module.exports = {
	signUpAndLogin,
	signUpAndLoginAndCreateModel
}