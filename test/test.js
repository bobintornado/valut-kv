process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var app = require('../index');
var should = chai.should();
chai.use(chaiHttp);

const db = require('../database')

beforeEach(function() {
	return db.any('TRUNCATE keys CASCADE')
});

afterEach(function() {
	return db.any('TRUNCATE keys CASCADE')
});

describe('Set value', function() {
	it('should return value on post', function(done) {
		chai.request(app)
			.post('/object')
			.set('content-type', 'application/json')
			.send({
				'k': 'v'
			})
			.end(function(err, res) {
				res.status.should.equal(200);
				done();
			});
	});
});


describe('Get value', function() {
	it('should return value on get', function(done) {
		var agent = chai.request(app);

		agent.post('/object')
			.set('content-type', 'application/json')
			.send({
				'k': 'v'
			})
			.end(() => {
				agent.get('/object/k')
					.end(function(err, res) {
						res.status.should.equal(200);
						res.text.should.equal('v');
						done();
					});
			})
	});
});

describe('Get value with timestamp', function() {
	it('should return value on get', function(done) {
		var agent = chai.request(app);

		agent.post('/object')
			.set('content-type', 'application/json')
			.send({
				'k': 'v1'
			})
			.end(() => {
				sleep(1000).then(() => {
					var timestamp = new Date().getTime() / 1000 | 0;
					agent.post('/object')
						.set('content-type', 'application/json')
						.send({
							'k': 'v2'
						})
						.end(() => {
							agent.get('/object/k')
								.query({
									timestamp: timestamp
								})
								.end(function(err, res) {
									res.status.should.equal(200);
									res.text.should.equal('v1');
									done();
								});
						});
				});
			});
	});
});

// sleep time expects milliseconds
function sleep(time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}
