/* eslint-disable no-var */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-unassigned-import */

require('./server');

require.extensions['.png'] = function () {
  return null;
};
