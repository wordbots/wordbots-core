import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Paper from '@material-ui/core/Paper';

export function mapStateToProps(state) {
  return {
    loggedIn: state.global.user !== null
  };
}

const About = function (props) {
  return (
    <div style={{margin: '48px 72px'}}>
      <Helmet title="Profile"/>

      <div style={{display: 'flex', justifyContent: 'stretch'}}>
        <Paper style={{padding: '5px 20px'}}>
          <h2>Profile</h2>
          <p>TODO: Stuff goes here.</p>
        </Paper>
      </div>
    </div>
  );
};

export default withRouter(connect(mapStateToProps)(About));
