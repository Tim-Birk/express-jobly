'use strict';

const db = require('../db.js');
const { BadRequestError, NotFoundError } = require('../expressError');
const Job = require('./job.js');

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
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

/************************************** create */

describe('create', function () {
  const newjob = {
    title: 'New Jobby',
    salary: 115000,
    equity: 0.15,
    companyHandle: 'c2',
  };

  test('works', async function () {
    let job = await Job.create(newjob);
    expect(job).toEqual({ ...newjob, id: job.id, equity: '0.15' });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
       FROM jobs
       WHERE id = ${job.id}`
    );
    expect(result.rows).toEqual([
      {
        id: job.id,
        title: 'New Jobby',
        salary: 115000,
        equity: '0.15',
        companyHandle: 'c2',
      },
    ]);
  });
});

/************************************** findAll */

describe('findAll', function () {
  test('works: no filter', async function () {
    const jobs = await Job.findAll();
    expect(jobs).toEqual([
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
    ]);
  });

  test('works:  filter title', async function () {
    let jobs = await Job.findAll({ title: 'b2' });
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: 'Job2',
        salary: 80000,
        equity: '0.1',
        companyHandle: 'c1',
      },
    ]);
  });
  test('works:  filter minSalary', async function () {
    let jobs = await Job.findAll({ minSalary: 100000 });
    expect(jobs).toEqual([
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
    ]);
  });
  test('works:  filter hasEquity', async function () {
    let jobs = await Job.findAll({ hasEquity: true });
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: 'Job2',
        salary: 80000,
        equity: '0.1',
        companyHandle: 'c1',
      },
    ]);
  });
});

/************************************** get */

describe('get', function () {
  test('works', async function () {
    let job = await Job.get(testJob.id);
    expect(job).toEqual({
      id: testJob.id,
      title: 'Job1',
      salary: 100000,
      equity: '0',
      companyHandle: 'c1',
    });
  });

  test('not found if no such job', async function () {
    try {
      await Job.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe('update', function () {
  const updateData = {
    title: 'Job1-update',
    salary: 200000,
    equity: 0.1,
    companyHandle: 'c2',
  };

  test('works', async function () {
    let job = await Job.update(testJob.id, updateData);
    expect(job).toEqual({
      id: testJob.id,
      title: 'Job1-update',
      salary: 200000,
      equity: '0.1',
      companyHandle: 'c2',
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = ${testJob.id}`
    );
    expect(result.rows).toEqual([
      {
        id: testJob.id,
        title: 'Job1-update',
        salary: 200000,
        equity: '0.1',
        companyHandle: 'c2',
      },
    ]);
  });

  test('works: null fields', async function () {
    const updateDataSetNulls = {
      salary: null,
      equity: null,
    };

    let job = await Job.update(testJob.id, updateDataSetNulls);
    expect(job).toEqual({
      id: testJob.id,
      title: testJob.title,
      companyHandle: testJob.companyHandle,
      ...updateDataSetNulls,
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
       FROM jobs
       WHERE id = ${testJob.id}`
    );
    expect(result.rows).toEqual([
      {
        id: testJob.id,
        title: 'Job1',
        salary: null,
        equity: null,
        companyHandle: 'c1',
      },
    ]);
  });

  test('not found if no such job', async function () {
    try {
      await Job.update(0, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test('bad request with no data', async function () {
    try {
      await Job.update(testJob.id, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe('remove', function () {
  test('works', async function () {
    await Job.remove(testJob.id);
    const res = await db.query(`SELECT id FROM jobs WHERE id=${testJob.id}`);
    expect(res.rows.length).toEqual(0);
  });

  test('not found if no such job', async function () {
    try {
      await Job.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
