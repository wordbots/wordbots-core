export default function promiseMiddleware() {
  return next => action => {
    const { promise, type, ...rest } = action;

    if (!promise) return next(action);

    const SUCCESS = `${type  }_SUCCESS`;
    const REQUEST = `${type  }_REQUEST`;
    const FAILURE = `${type  }_FAILURE`;
    next({ ...rest, type: REQUEST });
    return promise
      .then(req => {
        next({ ...rest, req, type: SUCCESS });
        return true;
      })
      .catch(err => {
        next({ ...rest, err, type: FAILURE });
        /* eslint-disable no-console */
        console.log(err);
        /* eslint-enable no-console */
        return false;
      });
   };
}
