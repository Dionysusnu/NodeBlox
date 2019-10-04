const assert = require('assert');
const { Client } = require('..');

const client = new Client();

async function doSomething() {
	client.debug = true;
	await require('./getGroup')(client, assert);
	await require('./getRoles')(client, assert);
	await require('./shout')(client, assert);
}

doSomething();