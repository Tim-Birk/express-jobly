const { BadRequestError } = require('../expressError');

/* Accepts 2 objects
 *   dataToUpdate: object that has the actual data values that will be sent to databse for update
 *   jsToSql: object that has the db column names that correspond to the keys provided in dataToUpdate
 *
 * Returns object
 *   setCols:  joined string of all db columns being set equal to appropriate paramter number for update
 *   values:  array of actual values that correspond to parameter numbers in setCols
 * */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  // get keys from data to update object
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError('No data');

  /* get an array of strings where each string is the corresponding db column name for each key
   * set equal to the index-based parameter number for the sql command
   * ex: {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2'] */
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  /* return object where setCols is the joined string of all col values from above and
   * values is an array of the actual values that correspond to each db parameter
   * being set in the setCol string */
  return {
    setCols: cols.join(', '),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
