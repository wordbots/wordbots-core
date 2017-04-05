import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Paper from 'material-ui/lib/paper';

export function mapStateToProps(state) {
  return {
    version: state.version,
    sidebarOpen: state.layout.present.sidebarOpen
  };
}

class Home extends Component {
  render() {
    return (
      <div style={{
        paddingLeft: this.props.sidebarOpen ? 256 : 0,
        margin: '48px 72px'
      }}>
        <Helmet title="Home"/>

        <div style={{
          display: 'flex',
          justifyContent: 'stretch'
        }}>
          <div style={{width: '50%'}}>
            <Paper style={{padding: 20, marginRight: 20}}>
              <div style={{
                fontSize: 24,
                fontWeight: 'bold',
                marginBottom: 12
              }}>Wordbots {this.props.version}</div>
              <div>This patch marks the the first public release of Wordbots.</div>
            </Paper>

            <Paper style={{padding: 20, marginRight: 20, marginTop: 20}}>
              <div style={{
                fontSize: 24,
                fontWeight: 100,
                marginBottom: 12
              }}>Leave Your Feedback</div>
              <div>Link to form goes here?</div>
            </Paper>
          </div>

          <div style={{width: '50%'}}>
            <Paper style={{padding: 20}}>
              <div style={{
                fontSize: 24,
                fontWeight: 100,
                marginBottom: 12
              }}>How to Play</div>
              <div>
                <p><b>Create Your Own Cards</b></p>
                <p>Get started by making your own custom cards using the Card Creator,
                   accessible from the Collection page or with this <Link to="/creator"
                   style={{color: 'red', fontWeight: 'bold'}}>link.</Link></p>
                <p><b>Make a Deck</b></p>
                <p><b>Play!</b></p>
              </div>
            </Paper>
          </div>
        </div>
      </div>
    );
  }
}

const { bool, string } = React.PropTypes;

Home.propTypes = {
  version: string,
  sidebarOpen: bool
};

export default connect(mapStateToProps)(Home);

