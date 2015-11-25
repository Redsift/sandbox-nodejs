/*jslint node: true */
"use strict";

// Provides bootstrapping for the to be launched nodes
const Nano = require('nanomsg');
const FS = require('fs');

const sift = JSON.parse(FS.readFileSync('/run/dagger/sift/sift.json', 'utf8'));

if ((sift.dag === undefined) || (sift.dag.nodes === undefined)) {
	throw new Error('Sift does not contain any nodes');
}

sift.dag.nodes.forEach(function (n, i) {
	if (n.implementation === undefined || n.implementation.node === undefined) {
		return;
	}
	const node = require(n.implementation.node);
	const reply = Nano.socket('rep');
	reply.connect('ipc:///run/dagger/ipc/' + i + '.sock');
	reply.on('data', function (msg) {
		let req = JSON.parse(msg);
		console.log('REQ:', req);
		let rep = node(req);
		console.log('REP:', rep);
		// TODO: Check for return types and coerce into [ BucketedData, ... ]
		reply.send(JSON.stringify(rep));
	});
});




console.log('Hello World');