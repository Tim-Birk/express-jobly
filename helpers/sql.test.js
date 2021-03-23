const { sqlForPartialUpdate } = require('./sql');
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
