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

/* Accepts
 *   filter: object from route query that has keys and values to filter SQL query by
 * Returns
 *   sqlFilter:  string that will be the WHERE clause added to the SQL query based on filter parameters
 */
function getSqlWhereCompanyFilters(filter) {
  const { name, minEmployees, maxEmployees } = filter;

  let sqlFilter = '';
  // If any filter exists, build WHERE Clause
  if (name || minEmployees || maxEmployees) {
    // throw error if minEmployes > maxEmployees
    if (minEmployees && maxEmployees && minEmployees > maxEmployees) {
      throw new BadRequestError(
        `minEmployess cannot be greater than maxEmployees`
      );
    }
    // Create SQL statement for each filter as it would appear in WHERE Clause (if exists)
    let nameSql = name ? `name ILIKE '%${name}%'` : '';
    let minSql = minEmployees
      ? `${nameSql ? 'AND ' : ''}num_employees >= ${minEmployees}`
      : '';
    let maxSql = maxEmployees
      ? `${nameSql || minSql ? 'AND ' : ''}num_employees <= ${maxEmployees}`
      : '';

    // Concatenate filter statements into one WHERE clause string
    sqlFilter = `
        WHERE
          ${nameSql} ${minSql} ${maxSql}
      `;
  }
  return sqlFilter;
}

/* Accepts
 *   filter: object from route query that has keys and values to filter SQL query by
 * Returns
 *   sqlFilter:  string that will be the WHERE clause added to the SQL query based on filter parameters
 */
function getSqlWhereJobFilters(filter) {
  const { title, minSalary, hasEquity } = filter;

  let sqlFilter = '';
  // If any filter exists, build WHERE Clause
  if (title || minSalary || hasEquity) {
    // Create SQL statement for each filter as it would appear in WHERE Clause (if exists)
    let titleSql = title ? `title ILIKE '%${title}%'` : '';
    let minSalarySql = minSalary
      ? `${titleSql ? 'AND ' : ''}salary >= ${minSalary}`
      : '';
    let hasEquitySql = hasEquity
      ? `${titleSql || minSalarySql ? 'AND ' : ''}equity > 0`
      : '';

    // Concatenate filter statements into one WHERE clause string
    sqlFilter = `
        WHERE
          ${titleSql} ${minSalarySql} ${hasEquitySql}
      `;
  }
  return sqlFilter;
}

module.exports = {
  sqlForPartialUpdate,
  getSqlWhereCompanyFilters,
  getSqlWhereJobFilters,
};
