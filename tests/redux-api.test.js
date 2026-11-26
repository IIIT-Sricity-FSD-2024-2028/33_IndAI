import { afterAll, beforeAll, expect, test, vi } from 'vitest';
import request from 'supertest';
import { openDatabase } from '../back-end/db.js';
import { seed } from '../back-end/seed.js';
import { createApp } from '../back-end/app.js';
import { createAppStore } from '../frontend/src/redux/store.js';
import { readerFor, resourceKey, writerFor } from '../frontend/src/redux/routes.js';
import { prepareRequest } from '../frontend/src/redux/utilities/requests.js';
import { selectResource } from '../frontend/src/redux/selectors/index.js';

// Real Express + SQLite exercised through the frontend transport and Redux thunks.
const db = openDatabase(':memory:');
const app = createApp(db);
const actors = {};
let activeAgent;
async function read(actor, path) {
  activeAgent = actors[actor].client;
  const key = resourceKey(path);
  await actors[actor].store.dispatch(readerFor(key)({ path: key, force: true })).unwrap();
  return selectResource(actors[actor].store.getState(), key).data;
}
async function write(actor, path, body, method = 'POST', file) {
  activeAgent = actors[actor].client;
  const result = await actors[actor].store.dispatch(writerFor(path, method)(prepareRequest({ path, body, method, file, operationKey: path }))).unwrap();
  return result.data;
}
beforeAll(async () => {
  await seed(db);
  vi.stubGlobal('fetch', async (path, options = {}) => {
    if (options.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    const pending = activeAgent[(options.method || 'GET').toLowerCase()](path).set(options.headers || {});
    if (options.body instanceof Blob) pending.send(Buffer.from(await options.body.arrayBuffer()));
    else if (options.body) pending.send(options.body);
    const result = await pending;
    return { ok: result.status < 400, status: result.status, json: async () => result.body };
  });
  for (const [actor, email] of Object.entries({ learner: 'student261@indai.test', free: 'student1@indai.test', instructor: 'instructor1@indai.test', provider: 'provider1@indai.test', admin: 'users@indai.test', super: 'super@indai.test' })) {
    actors[actor] = { client: request.agent(app), store: createAppStore() };
    await write(actor, '/auth/login', { email, password: 'IndAI-Demo-2026' });
    expect((await read(actor, '/me')).email).toBe(email);
  }
}, 30000);
afterAll(() => { for (const actor of Object.values(actors)) actor.store.runtime.dispose(); vi.unstubAllGlobals(); db.close(); });

test('course create/read/update/delete and optional resource upload run through named thunks', async () => {
  const body = { title: 'Redux course integration', description: 'A full course written through the Redux frontend transport.', outcomes: 'Explain authoritative backend data.', difficulty: 'introductory', prerequisites: '', policy: 'basic' };
  const created = await write('instructor', '/courses', body);
  expect((await read('instructor', '/courses/' + created.id)).title).toBe(body.title);
  await write('instructor', '/courses/' + created.id, { ...body, title: 'Updated Redux integration' }, 'PUT');
  expect((await read('instructor', '/courses/' + created.id)).title).toBe('Updated Redux integration');
  await write('instructor', '/resources/course/' + created.id + '/upload', undefined, 'POST', new File(['%PDF-1.7\nRedux fixture'], 'fixture.pdf', { type: 'application/pdf' }));
  const resources = await read('instructor', '/resources/course/' + created.id);
  expect(resources[0].name).toBe('fixture.pdf');
  await write('instructor', '/resource-files/' + resources[0].id, undefined, 'DELETE');
  expect(await read('instructor', '/resources/course/' + created.id)).toEqual([]);
  expect(await write('instructor', '/courses/' + created.id, undefined, 'DELETE')).toEqual({ outcome: 'deleted' });
});
test('watchlist CRUD, order idempotency, portfolio and journal use server-authoritative Redux responses', async () => {
  const created = await write('learner', '/trading/watchlists', { name: 'Redux integration list' });
  await write('learner', '/trading/watchlists/' + created.id, { name: 'Updated Redux list', symbols: ['INFY', 'RELIANCE'] }, 'PUT');
  expect((await read('learner', '/trading/watchlists')).find(row => row.id === created.id).symbols).toEqual(['INFY', 'RELIANCE']);
  await write('learner', '/trading/watchlists/' + created.id, undefined, 'DELETE');
  expect((await read('learner', '/trading/watchlists')).some(row => row.id === created.id)).toBe(false);
  const body = { symbol: 'INFY', clientKey: crypto.randomUUID(), side: 'buy', type: 'market', qty: 1, validity: 'DAY' };
  const first = await write('learner', '/trading/orders', body);
  const again = await write('learner', '/trading/orders', body);
  expect(again.id).toBe(first.id);
  expect((await read('learner', '/trading/account')).positions.some(row => row.symbol === 'INFY')).toBe(true);
  const limit = await write('learner', '/trading/orders', { ...body, clientKey: crypto.randomUUID(), type: 'limit', price: 1 });
  await write('learner', '/trading/orders/' + limit.id + '/cancel');
  expect((await read('learner', '/trading/orders?working=true')).some(row => row.id === limit.id)).toBe(false);
  await write('learner', '/trading/journal', { tag: 'Redux practice', body: 'Reviewed the order lifecycle through Redux.', order: first.id });
  expect((await read('learner', '/trading/journal'))[0].order_id).toBe(first.id);
});
test('instructor assignments, learner quiz draft/submit and manual grading refresh their own slices', async () => {
  const learner = await read('learner', '/me');
  const relation = (await read('instructor', '/guidance/active')).find(row => row.student === learner.id);
  const assignment = await write('instructor', '/assignments', { relationship: relation.id, title: 'Redux assignment', body: 'Explain what happens when an async thunk succeeds.', due: Date.now() + 86400000 });
  await write('learner', '/assignments/' + assignment.id + '/submit', { body: 'A fulfilled action reaches the reducer and selectors rerender.' });
  const work = (await read('instructor', '/tasks')).assignments.find(row => row.id === assignment.id);
  await write('instructor', '/submissions/' + work.submissions[0].id + '/review', { feedback: 'Correct explanation of the fulfilled lifecycle.' });
  const quiz = await write('instructor', '/quizzes', { title: 'Redux lifecycle quiz', description: 'One written response.', recipients: [learner.id], questions: [{ kind: 'short', prompt: 'What does a thunk do?', points: 5, required: true }] });
  await write('instructor', '/quizzes/' + quiz.id + '/publish');
  const detail = await read('learner', '/quizzes/' + quiz.id);
  const answers = { [detail.questions[0].id]: 'It performs asynchronous work and dispatches lifecycle actions.' };
  await write('learner', '/quizzes/' + quiz.id + '/draft', { answers }, 'PUT');
  expect((await read('learner', '/quizzes/' + quiz.id)).draft).toEqual(answers);
  const attempt = await write('learner', '/quizzes/' + quiz.id + '/submit', { answers });
  await write('instructor', '/quiz-attempts/' + attempt.id + '/grade', { grades: [{ question: detail.questions[0].id, score: 5, feedback: 'Correct.' }] });
  expect((await read('learner', '/quizzes/' + quiz.id)).attempt.score).toBe(5);
});
test('demo checkout, provider proposals, publication, earnings and external settlement records use supported thunks', async () => {
  const payment = await write('free', '/payments', { plan: 'pro', provider: 'demo' });
  await write('free', '/payments/' + payment.id + '/demo');
  expect((await read('free', '/plans')).current.plan).toBe('pro');
  const course = await write('provider', '/courses', { title: 'Redux licensing course', description: 'A provider course for isolated licensing verification.', outcomes: 'Understand the complete commercial workflow.', difficulty: 'introductory', prerequisites: '', policy: 'pro' });
  await write('provider', '/courses/' + course.id + '/lessons', { module: 'Redux', title: 'Licensing state', body: 'Licensing remains controlled by the existing backend.' });
  await write('provider', '/courses/' + course.id + '/terms', { amount: 100000, note: 'Isolated licensing proposal for Redux verification.' });
  await write('admin', '/commerce/' + course.id + '/decision', { action: 'counter', amount: 90000, note: 'A counteroffer in the isolated test database.' });
  await write('provider', '/courses/' + course.id + '/terms/respond', { accept: true });
  await write('provider', '/courses/' + course.id + '/submit');
  await write('super', '/courses/' + course.id + '/review', { action: 'publish' });
  await write('admin', '/commerce/' + course.id + '/earning');
  const settlement = (await read('admin', '/commerce')).settlements.find(row => row.course === course.id);
  await write('admin', '/settlements/' + settlement.id + '/paid', { reference: 'ISOLATED-TEST-TRANSFER-REFERENCE' });
  expect((await read('provider', '/provider')).settlements.find(row => row.id === settlement.id).state).toBe('paid');
});
test('member search, support and notifications keep backend authorization and serializable errors', async () => {
  const found = await read('admin', '/members?search=student261%40indai.test&role=student');
  expect(found.total).toBe(1);
  const ticket = await write('learner', '/support', { subject: 'Redux transport help', body: 'Please explain the pending request state.' });
  await write('admin', '/support/' + ticket.id + '/reply', { body: 'Pending means the server request has started.' });
  expect((await read('learner', '/support/' + ticket.id)).replies).toHaveLength(2);
  await write('learner', '/support/' + ticket.id + '/close');
  await write('learner', '/notifications/read-all');
  expect((await read('learner', '/notifications/unread')).count).toBe(0);
  await expect(read('learner', '/members')).rejects.toMatchObject({ status: 403 });
  expect(actors.learner.store.getState().user.resources['/members'].error).not.toBeInstanceOf(Error);
});
