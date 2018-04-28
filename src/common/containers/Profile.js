import React from 'react';
import { string } from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Paper from 'material-ui/Paper';

import MarkdownBlock from '../components/MarkdownBlock';

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
                      <MarkdownBlock source={profile} />
                  </Paper>
            </div>
        </div>
    );
};

About.propTypes = {
    version: string
};

export default withRouter(connect(mapStateToProps)(About));

const profile = `
## Profile!
`;
