require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');
const app = express();
const jsonParser = bodyParser.json();

// set key 
app.post('/object', jsonParser, function(req, res) {
	var key = Object.keys(req.body)[0];
	set_key_value_handler(res, key, req.body[key]);
});

// get key
app.get('/object/:key', function(req, res) {
	if (req.query.timestamp == undefined) {
		get_latest_value_handler(res, req.params.key);
	} else {
		get_latest_value_of_timestamp_handler(res, req.params.key, req.query.timestamp);
	}
});

// handlers
function set_key_value_handler(res, key, value) {
	db.tx(t => {
			return db.none('WITH key_insert AS (INSERT INTO keys (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2 RETURNING id) INSERT INTO history_values VALUES ((select id from key_insert), $2)', [key, value]);
		})
		.then(() => {
			res.end();
		})
		.catch(error => {
			server_error_handler(res, error);
		});
}

function get_latest_value_handler(res, key) {
	db.oneOrNone('SELECT value from keys where key = $1', key)
		.then(result => {
			if (result) {
				res.send(result.value);
			} else {
				not_found_handler(res);
			}
		})
		.catch(error => {
			server_error_handler(res, error);
		});
}

function get_latest_value_of_timestamp_handler(res, key, timestamp) {
	db.task(t => {
			return t.oneOrNone('SELECT id from keys where key = $1', key)
				.then(result => {
					if (result) {
						return t.oneOrNone('SELECT value from history_values where key_id = $1 and extract(epoch from timestamp) < $2 ORDER BY timestamp DESC limit 1', [result.id, timestamp]);
					} else {
						not_found_handler(res);
					}
				});
		})
		.then(result => {
			if (result) {
				res.send(result.value);
			} else {
				not_found_handler(res);
			}
		})
		.catch(error => {
			server_error_handler(res, error);
		});
}

function not_found_handler(res) {
	res.status(404).send({
		error: 'value not set yet!'
	});
}

function server_error_handler(res, error) {
	console.log(error);
	res.status(500).send({
		error: error.message
	});
}

var port = process.env.PORT || 3000;
var server = app.listen(port, () => {
	console.log('valut-kv start listening on port ' + port + '.....');
});

module.exports = server;
