const { sqlForPartialUpdate, getSqlWhereCompanyFilters } = require('./sql');
const { BadRequestError } = require('../expressError');

describe('sqlForPartialUpdate', function () {
  test('works', function () {
    const dataToUpdate = {
      numEmployess: 30,
      logoUrl: 'https://www.google.com/url',
    };
    const jsToSql = {
      numEmployees: 'num_employees',
      logoUrl: 'logo_url',
    };

    const { setCols, values } = sqlForPartialUpdate(dataToUpdate, jsToSql);
    console.log(setCols);
    expect(setCols).toEqual('"numEmployess"=$1, "logo_url"=$2');
    expect(values).toEqual([30, 'https://www.google.com/url']);
  });

  test('bad request with no data', async function () {
    try {
      sqlForPartialUpdate({});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

describe('getSqlWhereCompanyFilters', function () {
  const testFilters = [
    {
      filterName: 'allFilters',
      filter: {
        name: 'Se',
        minEmployees: 10,
        maxEmployees: 1000,
      },
      expectedResult: `
    WHERE
          name ILIKE '%Se%' AND num_employees >= 10 AND num_employees <= 1000
    `,
    },
    {
      filterName: 'name and minEmployees',
      filter: {
        name: 'Se',
        minEmployees: 10,
      },
      expectedResult: `
      WHERE
      name ILIKE '%Se%' AND num_employees >= 1
    `,
    },
    {
      filterName: 'name and maxEmployees',
      filter: {
        name: 'Se',
        maxEmployees: 1000,
      },
      expectedResult: `
      WHERE
      name ILIKE '%Se%'  AND num_employees <= 1000
    `,
    },
    {
      filterName: 'minEmployees and maxEmployees',
      filter: {
        minEmployees: 10,
        maxEmployees: 1000,
      },
      expectedResult: `
      WHERE
      num_employees >= 10 AND num_employees <= 1000
    `,
    },
    {
      filterName: 'name only',
      filter: {
        name: 'Se',
      },
      expectedResult: `
      WHERE
        name ILIKE '%Se%'
    `,
    },
    {
      filterName: 'minEmployees only',
      filter: {
        minEmployees: 10,
      },
      expectedResult: `
      WHERE
           num_employees >= 10'
    `,
    },
    {
      filterName: 'maxEmployees only',
      filter: {
        maxEmployees: 1000,
      },
      expectedResult: `
      WHERE
            num_employees <= 1000
    `,
    },
    {
      filterName: 'no filters',
      filter: {},
      expectedResult: ``,
    },
    {
      filterName: 'filters that do not exist',
      filter: { cats: 12, dog: 'sparky' },
      expectedResult: ``,
    },
  ];
  for (testFilter of testFilters) {
    test(`works: ${testFilter.filterName}`, function () {
      const sqlWhere = getSqlWhereCompanyFilters(testFilter.filter);
      expect(sqlWhere.replace(/\s+/g, ' ').trim()).toEqual(
        testFilter.expectedResult.replace(/\s+/g, ' ').trim()
      );
    });
  }

  test('bad request when minEmployees > maxEmployees', async function () {
    try {
      getSqlWhereCompanyFilters({
        minEmployees: 100,
        maxEmployees: 50,
      });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});
