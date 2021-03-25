'use strict';

const request = require('supertest');

const db = require('../db');
const app = require('../app');

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
} = require('./_testCommon');

let testJob;

beforeAll(commonBeforeAll);
beforeEach(async () => {
  commonBeforeEach();
  const result = await db.query(
    `SELECT id, title, salary, equity, company_handle AS "companyHandle" FROM jobs WHERE title = 'Job1'`
  );
  testJob = result.rows[0];
});
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe('POST /jobs', function () {
  const newJob = {
    title: 'New Jobby',
    salary: 115000,
    equity: 0.15,
    companyHandle: 'c2',
  };

  test('ok for admin users', async function () {
    const resp = await request(app)
      .post('/jobs')
      .send(newJob)
      .set('authorization', `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: { ...newJob, id: expect.any(Number), equity: '0.15' },
    });
  });

  test('not ok for non-admin users', async function () {
    const resp = await request(app)
      .post('/jobs')
      .send(newJob)
      .set('authorization', `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test('bad request with missing data', async function () {
    const resp = await request(app)
      .post('/jobs')
      .send({
        title: 'New Jobby',
        salary: 115000,
      })
      .set('authorization', `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test('bad request with invalid data', async function () {
    const resp = await request(app)
      .post('/jobs')
      .send({
        ...newJob,
        salary: -100,
        equity: 2.0,
      })
      .set('authorization', `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe('GET /jobs', function () {
  test('ok for anon', async function () {
    const resp = await request(app).get('/jobs');
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: 'Job1',
          salary: 100000,
          equity: '0',
          companyHandle: 'c1',
        },
        {
          id: expect.any(Number),
          title: 'Job2',
          salary: 80000,
          equity: '0.1',
          companyHandle: 'c1',
        },
        {
          id: expect.any(Number),
          title: 'Job3',
          salary: 120000,
          equity: '0',
          companyHandle: 'c2',
        },
      ],
    });
  });

  test('test filter title', async function () {
    const resp = await request(app).get('/jobs?title=b2');
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: 'Job2',
          salary: 80000,
          equity: '0.1',
          companyHandle: 'c1',
        },
      ],
    });
  });
  test('test filter minSalary', async function () {
    const resp = await request(app).get('/jobs?minSalary=100000');
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: 'Job1',
          salary: 100000,
          equity: '0',
          companyHandle: 'c1',
        },
        {
          id: expect.any(Number),
          title: 'Job3',
          salary: 120000,
          equity: '0',
          companyHandle: 'c2',
        },
      ],
    });
  });
  test('test filter hasEquity', async function () {
    const resp = await request(app).get('/jobs?hasEquity=true');
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: 'Job2',
          salary: 80000,
          equity: '0.1',
          companyHandle: 'c1',
        },
      ],
    });
  });

  test('fails: test next() handler', async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query('DROP TABLE jobs CASCADE');
    const resp = await request(app)
      .get('/jobs')
      .set('authorization', `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /jobs/:id */

describe('GET /jobs/:id', function () {
  test('works for anon', async function () {
    const resp = await request(app).get(`/jobs/${testJob.id}`);
    expect(resp.body).toEqual({
      job: {
        id: testJob.id,
        title: 'Job1',
        salary: 100000,
        equity: '0',
        companyHandle: 'c1',
      },
    });
  });

  test('not found for no such job', async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe('PATCH /jobs/:id', function () {
  test('works for admin users', async function () {
    const resp = await request(app)
      .patch(`/jobs/${testJob.id}`)
      .send({
        title: 'Job1-update',
        salary: 200000,
        equity: 0.1,
        companyHandle: 'c2',
      })
      .set('authorization', `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      job: {
        id: testJob.id,
        title: 'Job1-update',
        salary: 200000,
        equity: '0.1',
        companyHandle: 'c2',
      },
    });
  });

  test('not ok for non-admin users', async function () {
    const resp = await request(app)
      .patch(`/jobs/${testJob.id}`)
      .send({
        title: 'Job1-update',
      })
      .set('authorization', `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test('unauth for anon', async function () {
    const resp = await request(app).patch(`/jobs/${testJob.id}`).send({
      title: 'Job1-update',
    });
    expect(resp.statusCode).toEqual(401);
  });

  test('not found on no such job', async function () {
    const resp = await request(app)
      .patch(`/jobs/0`)
      .send({
        title: 'new nope',
      })
      .set('authorization', `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test('bad request on invalid data', async function () {
    const resp = await request(app)
      .patch(`/jobs/c1`)
      .send({
        salary: -100,
        equity: 2.0,
      })
      .set('authorization', `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:id */

describe('DELETE /jobs/:id', function () {
  test('works for users', async function () {
    const resp = await request(app)
      .delete(`/jobs/${testJob.id}`)
      .set('authorization', `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: `${testJob.id}` });
  });

  test('not ok for non-admin users', async function () {
    const resp = await request(app)
      .delete(`/jobs/${testJob.id}`)
      .set('authorization', `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test('unauth for anon', async function () {
    const resp = await request(app).delete(`/jobs/${testJob.id}`);
    expect(resp.statusCode).toEqual(401);
  });

  test('not found for no such job', async function () {
    const resp = await request(app)
      .delete(`/jobs/0`)
      .set('authorization', `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
