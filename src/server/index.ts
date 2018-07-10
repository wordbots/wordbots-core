require('./server');

require.extensions['.png'] = () => {
  return null;
};
