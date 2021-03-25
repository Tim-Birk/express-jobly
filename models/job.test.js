'use strict';

const db = require('../db.js');
const Job = require('./job.js');

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
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

  // test('works:  filter title', async function () {
  //   let jobs = await Job.findAll({ title: 'b2' });
  //   expect(jobs).toEqual([
  //     {
  //       id: expect.any(Number),
  //       title: 'Job2',
  //       salary: 80000,
  //       equity: '0.1',
  //       companyHandle: 'c1',
  //     },
  //   ]);
  // });
  // test('works:  filter minSalary', async function () {
  //   let jobs = await Job.findAll({ minSalary: 100000 });
  //   expect(jobs).toEqual([
  //     {
  //       id: expect.any(Number),
  //       title: 'Job1',
  //       salary: 100000,
  //       equity: '0',
  //       companyHandle: 'c1',
  //     },
  //     {
  //       id: expect.any(Number),
  //       title: 'Job3',
  //       salary: 120000,
  //       equity: '0',
  //       companyHandle: 'c2',
  //     },
  //   ]);
  // });
  // test('works:  filter hasEquity', async function () {
  //   let jobs = await Job.findAll({ hasEquity: true });
  //   expect(jobs).toEqual([
  //     {
  //       id: expect.any(Number),
  //       title: 'Job2',
  //       salary: 80000,
  //       equity: '0.1',
  //       companyHandle: 'c1',
  //     },
  //   ]);
  // });
});

// /************************************** get */

// describe('get', function () {
//   test('works', async function () {
//     let job = await Job.get('c1');
//     expect(job).toEqual({
//       handle: 'c1',
//       name: 'C1',
//       description: 'Desc1',
//       numEmployees: 1,
//       logoUrl: 'http://c1.img',
//     });
//   });

//   test('not found if no such job', async function () {
//     try {
//       await Job.get('nope');
//       fail();
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });
// });

// /************************************** update */

// describe('update', function () {
//   const updateData = {
//     name: 'New',
//     description: 'New Description',
//     numEmployees: 10,
//     logoUrl: 'http://new.img',
//   };

//   test('works', async function () {
//     let job = await Job.update('c1', updateData);
//     expect(job).toEqual({
//       handle: 'c1',
//       ...updateData,
//     });

//     const result = await db.query(
//       `SELECT handle, name, description, num_employees, logo_url
//            FROM jobs
//            WHERE handle = 'c1'`
//     );
//     expect(result.rows).toEqual([
//       {
//         handle: 'c1',
//         name: 'New',
//         description: 'New Description',
//         num_employees: 10,
//         logo_url: 'http://new.img',
//       },
//     ]);
//   });

//   test('works: null fields', async function () {
//     const updateDataSetNulls = {
//       name: 'New',
//       description: 'New Description',
//       numEmployees: null,
//       logoUrl: null,
//     };

//     let job = await Job.update('c1', updateDataSetNulls);
//     expect(job).toEqual({
//       handle: 'c1',
//       ...updateDataSetNulls,
//     });

//     const result = await db.query(
//       `SELECT handle, name, description, num_employees, logo_url
//            FROM jobs
//            WHERE handle = 'c1'`
//     );
//     expect(result.rows).toEqual([
//       {
//         handle: 'c1',
//         name: 'New',
//         description: 'New Description',
//         num_employees: null,
//         logo_url: null,
//       },
//     ]);
//   });

//   test('not found if no such job', async function () {
//     try {
//       await Job.update('nope', updateData);
//       fail();
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });

//   test('bad request with no data', async function () {
//     try {
//       await Job.update('c1', {});
//       fail();
//     } catch (err) {
//       expect(err instanceof BadRequestError).toBeTruthy();
//     }
//   });
// });

// /************************************** remove */

// describe('remove', function () {
//   test('works', async function () {
//     await Job.remove('c1');
//     const res = await db.query("SELECT handle FROM jobs WHERE handle='c1'");
//     expect(res.rows.length).toEqual(0);
//   });

//   test('not found if no such job', async function () {
//     try {
//       await Job.remove('nope');
//       fail();
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });
// });
