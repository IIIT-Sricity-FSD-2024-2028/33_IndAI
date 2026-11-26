import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { createAppStore } from '../frontend/src/redux/store.js';
import { sessionReset } from '../frontend/src/redux/utilities/session.js';
import { prepareRequest } from '../frontend/src/redux/utilities/requests.js';
import { fetchCourses, createCourse, setCourses, addCourse, updateCourseRecord, removeCourse, courseActions } from '../frontend/src/redux/slices/courseSlice.js';
import { fetchCurrentUser, loginUser, logoutUser } from '../frontend/src/redux/slices/authSlice.js';
import { fetchMarketData } from '../frontend/src/redux/slices/marketSlice.js';
import { setWatchlists, setActiveWatchlist } from '../frontend/src/redux/slices/watchlistSlice.js';
import { selectActiveWatchlist, selectResource, makeSelectQuotes } from '../frontend/src/redux/selectors/index.js';
import { resourceKey, writerFor, affectedDomains } from '../frontend/src/redux/routes.js';
import { setTheme } from '../frontend/src/redux/slices/themeSlice.js';

let store;
const response = (data, status = 200) => ({ ok: status < 400, status, json: async () => data });
beforeEach(() => { store = createAppStore(); });
afterEach(() => { store.runtime.dispose(); vi.unstubAllGlobals(); vi.useRealTimers(); });

test('store initializes independent feature slices and permits only theme across session reset', () => {
  store.dispatch(setTheme('dark'));
  store.dispatch(setCourses({ path: '/courses', data: [{ id: 1, title: 'Private course' }] }));
  store.dispatch(sessionReset());
  expect(store.getState().theme.mode).toBe('dark');
  expect(store.getState().course.resources).toEqual({});
  expect(Object.keys(store.getState())).toHaveLength(18);
});
test('READ pending/fulfilled lives in Redux and URL parameters cannot overwrite another resource', async () => {
  const resolvers = {};
  vi.stubGlobal('fetch', vi.fn(path => new Promise(resolve => { resolvers[path] = resolve; })));
  const a = store.dispatch(fetchCourses({ path: '/courses/1' }));
  const b = store.dispatch(fetchCourses({ path: '/courses/2' }));
  expect(selectResource(store.getState(), '/courses/1').status).toBe('pending');
  resolvers['/api/courses/2'](response({ id: 2 })); await b;
  resolvers['/api/courses/1'](response({ id: 1 })); await a;
  expect(selectResource(store.getState(), '/courses/2').data.id).toBe(2);
  expect(selectResource(store.getState(), '/courses/1').data.id).toBe(1);
});
test('failed writes preserve backend validation and never change existing records', async () => {
  store.dispatch(setCourses({ path: '/courses', data: [{ id: 1 }] }));
  vi.stubGlobal('fetch', vi.fn(async () => response({ message: 'A title is required.', code: 'INVALID_INPUT', fields: { title: 'Required' } }, 422)));
  const promise = store.dispatch(createCourse(prepareRequest({ path: '/courses', body: {}, operationKey: 'editor' })));
  await expect(promise.unwrap()).rejects.toMatchObject({ status: 422, fields: { title: 'Required' } });
  expect(store.getState().course.operations.editor.status).toBe('rejected');
  expect(store.getState().course.resources['/courses'].data).toEqual([{ id: 1 }]);
});
test('synchronous course CRUD reducers act on existing authoritative collections', () => {
  store.dispatch(setCourses({ path: '/courses', data: [] }));
  store.dispatch(addCourse({ path: '/courses', item: { id: 4, title: 'Draft' } }));
  store.dispatch(updateCourseRecord({ path: '/courses', item: { id: 4, title: 'Edited' } }));
  expect(selectResource(store.getState(), '/courses').data[0].title).toBe('Edited');
  store.dispatch(removeCourse({ path: '/courses', id: 4 }));
  expect(selectResource(store.getState(), '/courses').data).toEqual([]);
});
test('invalidating an in-flight read discards its pre-mutation response', async () => {
  let resolve;
  vi.stubGlobal('fetch', vi.fn(() => new Promise(done => { resolve = done; })));
  const pending = store.dispatch(fetchCourses({ path: '/courses' }));
  store.dispatch(courseActions.invalidate());
  resolve(response([{ id: 1, title: 'Old snapshot' }])); await pending;
  expect(selectResource(store.getState(), '/courses').data).toBeUndefined();
  expect(selectResource(store.getState(), '/courses').invalidated).toBe(true);
});
test('login loads /me and credentials never appear in lifecycle arguments or store', async () => {
  vi.stubGlobal('fetch', vi.fn(async path => response(path.endsWith('/me') ? { id: 8, role: 'student' } : { id: 8 })));
  const prepared = prepareRequest({ path: '/auth/login', body: { email: 'test@indai.test', password: 'Secret-Password-2026' }, operationKey: 'login' });
  expect(JSON.stringify(prepared)).not.toContain('Secret-Password');
  const result = await store.dispatch(loginUser(prepared));
  expect(result.type).toBe('auth/loginUser/fulfilled');
  expect(store.getState().auth.resources['/me'].data.id).toBe(8);
  expect(JSON.stringify(store.getState())).not.toContain('Secret-Password');
  expect(result.meta.arg.body).toBeUndefined();
});
test('logout clears all account resources and late responses cannot repopulate them', async () => {
  let resolve;
  vi.stubGlobal('fetch', vi.fn(path => path.includes('/courses') ? new Promise(done => { resolve = done; }) : Promise.resolve(response({ ok: true }))));
  const old = store.dispatch(fetchCourses({ path: '/courses' }));
  await store.dispatch(logoutUser(prepareRequest({ path: '/auth/logout', operationKey: 'logout' })));
  resolve(response([{ id: 99 }])); await old;
  expect(store.getState().course.resources).toEqual({});
  expect(store.getState().auth.resources).toEqual({});
});
test('expired authenticated sessions clear other slices and retain a 401 for routing', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => response({ id: 1 })));
  await store.dispatch(fetchCurrentUser({ path: '/me' }));
  store.dispatch(setCourses({ path: '/courses', data: [{ id: 1 }] }));
  vi.stubGlobal('fetch', vi.fn(async () => response({ message: 'Sign in to continue.' }, 401)));
  await store.dispatch(fetchCurrentUser({ path: '/me', force: true }));
  expect(store.getState().course.resources).toEqual({});
  expect(store.getState().auth.resources['/me'].error.status).toBe(401);
});
test('account switching discovered by /me also removes the previous account resources', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => response({ id: 1 })));
  await store.dispatch(fetchCurrentUser({ path: '/me' }));
  store.dispatch(setCourses({ path: '/courses', data: [{ id: 1 }] }));
  vi.stubGlobal('fetch', vi.fn(async () => response({ id: 2 })));
  await store.dispatch(fetchCurrentUser({ path: '/me', force: true }));
  expect(store.getState().course.resources).toEqual({});
  expect(store.getState().auth.resources['/me'].data.id).toBe(2);
});
test('two consumers share one polling request and timers stop after unmount', async () => {
  vi.useFakeTimers();
  const fetch = vi.fn(async () => response([])); vi.stubGlobal('fetch', fetch);
  const releaseA = store.runtime.subscribe('/courses', 'A', { interval: 2000 });
  const releaseB = store.runtime.subscribe('/courses', 'B', { interval: 5000 });
  await vi.advanceTimersByTimeAsync(0);
  expect(fetch).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(2000);
  expect(fetch).toHaveBeenCalledTimes(2);
  releaseA(); releaseB();
  await vi.advanceTimersByTimeAsync(20000);
  expect(fetch).toHaveBeenCalledTimes(2);
});
test('a slow polling request never overlaps itself', async () => {
  vi.useFakeTimers();
  let resolve;
  const fetch = vi.fn(() => new Promise(done => { resolve = done; })); vi.stubGlobal('fetch', fetch);
  const release = store.runtime.subscribe('/courses', 'slow', { interval: 1000 });
  await vi.advanceTimersByTimeAsync(5000);
  expect(fetch).toHaveBeenCalledTimes(1);
  resolve(response([])); await vi.advanceTimersByTimeAsync(0); release();
});
test('stale quote selectors disable execution, including during a failed feed retry', async () => {
  const path = '/trading/quotes?symbols=RELIANCE';
  vi.stubGlobal('fetch', vi.fn(async () => response([{ symbol: 'RELIANCE', quote: { status: 'demo', executable: true } }])));
  await store.dispatch(fetchMarketData({ path }));
  const selector = makeSelectQuotes();
  expect(selector(store.getState(), path, Date.now() + 11000)[0].quote.executable).toBe(false);
  vi.stubGlobal('fetch', vi.fn(async () => response({ message: 'Unavailable' }, 503)));
  await store.dispatch(fetchMarketData({ path, force: true }));
  expect(selector(store.getState(), path, Date.now())[0].quote.executable).toBe(false);
  let resolve;
  vi.stubGlobal('fetch', vi.fn(() => new Promise(done => { resolve = done; })));
  const retry = store.dispatch(fetchMarketData({ path, force: true }));
  expect(selector(store.getState(), path, Date.now())[0].quote.executable).toBe(false);
  resolve(response([])); await retry;
});
test('watchlist selectors share the selected list and gracefully fall back after deletion', () => {
  store.dispatch(setWatchlists({ path: '/trading/watchlists', data: [{ id: 1, symbols: [] }, { id: 2, symbols: ['INFY'] }] }));
  store.dispatch(setActiveWatchlist(2));
  expect(selectActiveWatchlist(store.getState()).symbols).toEqual(['INFY']);
  store.dispatch(setWatchlists({ path: '/trading/watchlists', data: [{ id: 1, symbols: [] }] }));
  expect(selectActiveWatchlist(store.getState()).id).toBe(1);
});
test('route mapping distinguishes commerce, admin payments, uploads and supported methods', () => {
  expect(writerFor('/courses/1/terms').typePrefix).toBe('commerce/submitProposal');
  expect(writerFor('/admin/payments/1/refund').typePrefix).toBe('payment/requestRefund');
  expect(writerFor('/resources/lesson/1/upload').typePrefix).toBe('resource/uploadResource');
  expect(() => writerFor('/payments/1', 'DELETE')).toThrow('Unmapped');
  expect(affectedDomains('/trading/watchlists/1')).not.toContain('course');
  expect(resourceKey('/members?search=Hello%20World&page=0&role=all')).toBe('/members?role=all&search=Hello+World');
});
test('application source has no alternate cache or component-level domain transport', () => {
  const source = new URL('../frontend/src/', import.meta.url);
  for (const relative of readdirSync(source, { recursive: true }).filter(name => /\.(jsx?|tsx?)$/.test(name))) {
    const text = readFileSync(new URL(relative.replaceAll('\\', '/'), source), 'utf8');
    expect(text, relative).not.toMatch(/@tanstack\/react-query|QueryClientProvider|useQueryClient|invalidateQueries/);
    if (/^(components|pages)[\\/]/.test(relative)) expect(text, relative).not.toMatch(/\bfetch\s*\(|\bapi\s*\(/);
  }
});
