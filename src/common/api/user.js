import request from 'axios';

import config from '../../../package.json';

export default function getUser(token, callback) {
  if (!token) {
    return callback(false);
  }
  request
    .get(`http://${config.apiHost}:${config.apiPort}/api/users/check?access_token=${token}`)
    .then((response) => {
      if (response.status === 200) {
        request
          .get(`http://${config.apiHost}:${config.apiPort}/api/users/${response.data.valid.userId}?access_token=${token}`)
          .then((getUserResponse) => {
            callback(getUserResponse.data);
          })
          .catch((err) => {
            callback(false);
          });
      } else {
        callback(false);
      }
    })
    .catch((err) => {
      callback(false);
    });
}
