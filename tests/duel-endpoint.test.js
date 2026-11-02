import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveDuelEndpoint} from '../src/duel-endpoint.js';
test('permanent server overrides stale Codespaces and invitations; local development remains available',()=>{
 assert.equal(resolveDuelEndpoint({configured:'https://dojo.example.org/',saved:'https://old.app.github.dev',invited:'https://other.example.org'}),'https://dojo.example.org');
 assert.equal(resolveDuelEndpoint({saved:'https://saved.example.org',invited:'https://invite.example.org'}),'https://invite.example.org');
 assert.equal(resolveDuelEndpoint({configured:'http://127.0.0.1:3001',hostname:'localhost'}),'http://127.0.0.1:3001');
 for(const configured of ['http://example.org','https://user:pass@example.org','https://example.org/?token=secret','https://example.org/#foo'])assert.throws(()=>resolveDuelEndpoint({configured}));
 assert.equal(resolveDuelEndpoint(), '');
});
