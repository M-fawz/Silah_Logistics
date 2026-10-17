/**
 * Regression tests for the ADAM support-chat client (adam/ADAM-client.html).
 *
 * Zero dependencies — run from the repo root with:  node --test
 *
 * The client is a standalone HTML document with one inline <script>, outside any
 * module graph, so these tests run that exact script in a Node `vm` sandbox
 * against a minimal fake DOM and a scripted `fetch`. They pin the backend
 * contract that broke production (every send must carry site_id: 'silah') and
 * the delivery handling added with it (an empty-body HTTP 200 is NOT delivery).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const html = readFileSync(fileURLToPath(new URL('../adam/ADAM-client.html', import.meta.url)), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

const SEND = '/webhook/adam/v0/send';
const FETCH = '/webhook/adam/v0/fetch';
const UPLOAD = '/webhook/adam/v1/upload-attachment';
const SESSION = '171026120000_1234';
const PROFILE = { group_id: '30', group_name: 'other', name: 'QA Test', mobile: '+1 555 010 0000', email: 'qa@example.com' };

/* ── Minimal fake DOM: just what the client touches ───────────────────────── */
function detach(node) {
  if (!node.parent) return;
  const siblings = node.parent.children;
  siblings.splice(siblings.indexOf(node), 1);
  node.parent = null;
}

class FakeText {
  constructor(text) { this.textContent = String(text); this.parent = null; }
  remove() { detach(this); }
}

class FakeElement {
  constructor(tagName = 'div', id = '') {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.children = [];
    this.parent = null;
    this.classSet = new Set();
    this.classList = {
      add: (...c) => c.forEach(x => this.classSet.add(x)),
      remove: (...c) => c.forEach(x => this.classSet.delete(x)),
      contains: c => this.classSet.has(c),
    };
    this.dataset = {};
    this.style = {};
    this.attrs = {};
    this.listeners = {};
    this.value = '';
    this.disabled = false;
    this.scrollTop = 0;
    this.scrollHeight = 0;
    this.ownText = '';
    this.html = '';
  }
  get className() { return [...this.classSet].join(' '); }
  set className(v) { this.classSet = new Set(String(v).split(/\s+/).filter(Boolean)); }
  get innerHTML() { return this.html; }
  set innerHTML(v) {
    this.html = String(v);
    this.ownText = '';
    this.children.forEach(c => { c.parent = null; });
    this.children = [];
  }
  get textContent() { return this.ownText + this.children.map(c => c.textContent).join(''); }
  set textContent(v) { this.innerHTML = ''; this.ownText = String(v); }
  appendChild(child) { detach(child); child.parent = this; this.children.push(child); return child; }
  after(node) {
    detach(node);
    const siblings = this.parent.children;
    node.parent = this.parent;
    siblings.splice(siblings.indexOf(this) + 1, 0, node);
  }
  remove() { detach(this); }
  get previousElementSibling() {
    if (!this.parent) return null;
    const siblings = this.parent.children;
    for (let i = siblings.indexOf(this) - 1; i >= 0; i--) if (siblings[i] instanceof FakeElement) return siblings[i];
    return null;
  }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  removeAttribute(k) { delete this.attrs[k]; }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  focus() {}
  click() {}
  *descendants() {
    for (const c of this.children) if (c instanceof FakeElement) { yield c; yield* c.descendants(); }
  }
  // Supports the compound form the client uses: `.a.b[data-some-key="value"]`.
  querySelector(selector) {
    const attr = selector.match(/\[data-([\w-]+)="((?:[^"\\]|\\.)*)"\]/);
    const classes = [...selector.replace(/\[.*\]/, '').matchAll(/\.([\w-]+)/g)].map(m => m[1]);
    for (const el of this.descendants()) {
      if (!classes.every(c => el.classList.contains(c))) continue;
      if (attr) {
        const key = attr[1].replace(/-(\w)/g, (_, ch) => ch.toUpperCase());
        if (el.dataset[key] !== attr[2].replace(/\\(.)/g, '$1')) continue;
      }
      return el;
    }
    return null;
  }
}

class FakeFormData {
  constructor() { this.entries = []; }
  append(k, v) { this.entries.push([k, v]); }
  getAll(k) { return this.entries.filter(([key]) => key === k).map(([, v]) => v); }
}

const settle = async () => { for (let i = 0; i < 10; i++) await new Promise(r => setImmediate(r)); };

/* ── Boot the real client script with a saved profile (skips the intake) ──── */
async function bootClient({ routes = {} } = {}) {
  const calls = [];
  const routeTable = {
    '/webhook/adam/admin/list-groups': () => ({ body: JSON.stringify([{ id: 30, name: 'other' }]) }),
    '/webhook/adam/admin/get-settings': () => ({ body: '[]' }),
    [FETCH]: () => ({ body: '' }),
    [SEND]: () => ({ body: '{"status":"ok"}' }),
    [UPLOAD]: () => ({ body: '{"ok":true}' }),
    '/webhook/adam/v1/close-session': () => ({ body: '{"ok":true}' }),
    ...routes,
  };

  const fetch = async (url, init = {}) => {
    const path = String(url).replace(/^https:\/\/[^/]+/, '');
    calls.push({ path, init });
    const key = Object.keys(routeTable).find(k => path.startsWith(k));
    const out = await (key ? routeTable[key](init) : { status: 404, body: '' });
    if (out instanceof Error) throw out;
    const status = out.status ?? 200;
    return { status, ok: status >= 200 && status < 300, text: async () => out.body ?? '', json: async () => JSON.parse(out.body ?? '') };
  };

  const store = new Map([['adam_active_session', SESSION], [`adam_client_profile_${SESSION}`, JSON.stringify(PROFILE)]]);
  const byId = new Map();
  const docListeners = {};
  const document = {
    hidden: false,
    getElementById(id) { if (!byId.has(id)) byId.set(id, new FakeElement('div', id)); return byId.get(id); },
    createElement: tag => new FakeElement(tag),
    createTextNode: text => new FakeText(text),
    addEventListener(type, fn) { (docListeners[type] ||= []).push(fn); },
  };

  const sandbox = {
    document,
    fetch,
    console: { warn() {}, log() {}, error() {} },
    localStorage: { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) },
    history: { replaceState() {} },
    location: { search: '', pathname: '/adam/ADAM-client.html' },
    URLSearchParams,
    FormData: FakeFormData,
    CSS: { escape: s => String(s).replace(/["\\]/g, '\\$&') },
    setInterval: () => 0, clearInterval() {}, setTimeout: () => 0, clearTimeout() {},
    alert() {},
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox, { filename: 'ADAM-client.html' });
  await settle();

  const el = id => document.getElementById(id);
  const chatChildren = () => el('chat').children;
  return {
    routes: routeTable,
    calls,
    el,
    sends: () => calls.filter(c => c.path === SEND).map(c => ({ raw: c.init.body, body: JSON.parse(c.init.body) })),
    fetches: () => calls.filter(c => c.path === FETCH).map(c => JSON.parse(c.init.body)),
    visitorBubbles: () => chatChildren().filter(c => c.classList.contains('me')),
    agentBubbles: () => chatChildren().filter(c => c.classList.contains('other') && !c.classList.contains('typing-wrap')),
    typingVisible: () => chatChildren().some(c => c.classList.contains('typing-wrap')),
    failedRows: () => chatChildren().filter(c => c.classList.contains('msg-failed-row')),
    async type(text, via = 'button') {
      el('message').value = text;
      if (via === 'enter') el('message').listeners.keydown.forEach(fn => fn({ key: 'Enter', shiftKey: false, preventDefault() {} }));
      else el('sendBtn').onclick();
      await settle();
    },
    async poll() { (docListeners.visibilitychange || []).forEach(fn => fn()); await settle(); },
  };
}

/** Strip block and line comments so a prose mention is not read as code. */
function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

/* ── site_id contract ─────────────────────────────────────────────────────── */
test("site_id is defined once, as 'silah'", () => {
  const code = stripComments(script);
  assert.match(code, /const SITE_ID\s*=\s*'silah';/);
  assert.equal((code.match(/'silah'/g) || []).length, 1, "the literal 'silah' must live only in SITE_ID");
});

test('send carries site_id exactly once and keeps every existing field', async () => {
  const client = await bootClient();
  await client.type('hi');

  const [send] = client.sends();
  assert.equal(client.sends().length, 1);
  assert.equal((send.raw.match(/"site_id"/g) || []).length, 1);
  assert.deepEqual(Object.keys(send.body).sort(), [
    'client_email', 'client_mobile', 'client_name', 'group_id', 'group_name',
    'message', 'message_id', 'sender', 'session_id', 'site_id',
  ]);
  assert.equal(send.body.site_id, 'silah');
  assert.equal(send.body.session_id, SESSION);
  assert.equal(send.body.sender, 'client');
  assert.equal(send.body.message, 'hi');
  assert.match(send.body.message_id, /^[a-z0-9]+$/);
  assert.equal(send.body.group_id, PROFILE.group_id);
  assert.equal(send.body.group_name, PROFILE.group_name);
  assert.equal(send.body.client_name, PROFILE.name);
  assert.equal(send.body.client_mobile, PROFILE.mobile);
  assert.equal(send.body.client_email, PROFILE.email);

  assert.equal(client.visitorBubbles().length, 1);
  assert.equal(client.failedRows().length, 0, 'an accepted send must not be flagged');
  assert.ok(client.typingVisible(), 'typing indicator stays up until the reply arrives');
});

test('the Enter key sends the same payload as the Send button', async () => {
  const client = await bootClient();
  await client.type('How can I contact Silah Logistics?', 'enter');
  const [send] = client.sends();
  assert.equal(send.body.site_id, 'silah');
  assert.equal(send.body.message, 'How can I contact Silah Logistics?');
  assert.equal(client.el('message').value, '', 'the composer clears after sending');
});

test('upload carries site_id exactly once alongside the session fields', async () => {
  const client = await bootClient({
    routes: { '/webhook/adam/admin/get-settings': () => ({ body: '[{"key":"allow_attachments","value":"1"}]' }) },
  });
  client.el('fileInput').files = [{ name: 'note.txt', type: 'text/plain', size: 12 }];
  await client.type('');

  const upload = client.calls.find(c => c.path === UPLOAD);
  assert.ok(upload, 'upload request was sent');
  assert.deepEqual(upload.init.body.getAll('site_id'), ['silah']);
  assert.deepEqual(upload.init.body.getAll('session_id'), [SESSION]);
  assert.equal(upload.init.body.getAll('message_id').length, 1);
});

/* ── delivery handling ────────────────────────────────────────────────────── */
test('an empty-body HTTP 200 is "Not delivered": typing stops and Retry is offered', async () => {
  const client = await bootClient({ routes: { [SEND]: () => ({ status: 200, body: '' }) } });
  await client.type('hi');

  assert.equal(client.typingVisible(), false);
  const [row] = client.failedRows();
  assert.ok(row, 'a failure row is shown');
  assert.match(row.textContent, /Not delivered\./);
  assert.ok(client.visitorBubbles()[0].classList.contains('msg-failed'));
});

test('a network error or an error status is also "Not delivered"', async () => {
  for (const outcome of [new TypeError('Failed to fetch'), { status: 500, body: 'error' }]) {
    const client = await bootClient({ routes: { [SEND]: () => outcome } });
    await client.type('hi');
    assert.equal(client.failedRows().length, 1);
    assert.equal(client.typingVisible(), false);
  }
});

test('Retry resends the same message id and does not add a second bubble', async () => {
  const client = await bootClient({ routes: { [SEND]: () => ({ body: '' }) } });
  await client.type('Tell me about Silah Logistics.');
  client.routes[SEND] = () => ({ body: '{"status":"ok"}' });

  const retry = client.failedRows()[0].children.find(c => c.tagName === 'BUTTON');
  retry.onclick();
  await new Promise(r => setImmediate(r));
  assert.equal(client.failedRows().length, 0, 'the row is removed as soon as Retry is pressed');
  await client.poll();

  const [first, second] = client.sends();
  assert.equal(client.sends().length, 2);
  assert.equal(second.body.message_id, first.body.message_id);
  assert.equal(second.body.message, first.body.message);
  assert.equal(second.body.site_id, 'silah');
  assert.equal(client.visitorBubbles().length, 1);
  assert.equal(client.visitorBubbles()[0].classList.contains('msg-failed'), false);
  assert.equal(client.failedRows().length, 0);
});

test('403 still closes the session instead of offering a retry', async () => {
  const client = await bootClient({ routes: { [SEND]: () => ({ status: 403, body: '' }) } });
  await client.type('hi');
  assert.equal(client.el('message').disabled, true);
  assert.equal(client.el('sendBtn').disabled, true);
  assert.equal(client.failedRows().length, 0);
  assert.equal(client.typingVisible(), false);
});

test('a send that resolves after End Session does not flag the new session', async () => {
  let release;
  const client = await bootClient({ routes: { [SEND]: () => new Promise(r => { release = r; }) } });
  await client.type('hi');
  client.el('endSession').onclick();
  release({ status: 200, body: '' });
  await settle();
  assert.equal(client.failedRows().length, 0);
  assert.equal(client.visitorBubbles().length, 0);
});

test("a poll that returns the visitor's message clears a stale Not delivered mark", async () => {
  const client = await bootClient({ routes: { [SEND]: () => ({ body: '' }) } });
  await client.type('hi');
  const messageId = client.sends()[0].body.message_id;
  client.routes[FETCH] = () => ({ body: JSON.stringify([{ id: 5, message_id: messageId, sender: 'client', message: 'hi' }]) });

  await client.poll();
  assert.equal(client.failedRows().length, 0);
  assert.equal(client.visitorBubbles().length, 1, 'the polled copy is de-duplicated by message_id');
  assert.equal(client.visitorBubbles()[0].classList.contains('msg-failed'), false);
});

/* ── polling is unchanged ─────────────────────────────────────────────────── */
test('the polled reply renders once, clears typing, and the fetch payload is unchanged', async () => {
  const client = await bootClient();
  await client.type('hi');
  const messageId = client.sends()[0].body.message_id;
  client.routes[FETCH] = () => ({
    body: JSON.stringify([
      { id: 11, message_id: messageId, sender: 'client', message: 'hi' },
      { id: 12, message_id: 'reply-1', sender: 'operator', message: 'Hello. How can I help you today?' },
    ]),
  });

  await client.poll();
  await client.poll();   // same rows again: must not duplicate

  assert.equal(client.typingVisible(), false);
  assert.equal(client.visitorBubbles().length, 1);
  assert.equal(client.agentBubbles().length, 1);
  const last = client.fetches().at(-1);
  assert.deepEqual(Object.keys(last).sort(), ['session_id', 'since_id']);
  assert.equal(last.session_id, SESSION);
  assert.equal(last.since_id, 12, 'the since_id cursor advances past rendered messages');
});
