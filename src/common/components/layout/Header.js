import React,{Component} from 'react';
import LeftNav from 'material-ui/lib/left-nav';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import AppBar from 'material-ui/lib/app-bar';
import RaisedButton from 'material-ui/lib/raised-button';
import MenuItem from 'material-ui/lib/menus/menu-item';
import IconButton from 'material-ui/lib/icon-button';
import Helmet from 'react-helmet';
import ThemeManager from 'material-ui/lib/styles/theme-manager';
import PersonalTheme from '../../themes/personal';
import { bindActionCreators } from 'redux';

import * as UserActions from '../../actions/user';

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {open: true};
    this.handleToggle = this.handleToggle.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  handleLogout() {
    this.props.logout(this.props.user);
  }

  handleToggle() {
    console.log('blabla');
    this.setState({open: !this.state.open}); 
  }

  render() {
    const {user} = this.props;

    return (
      <div>
        <AppBar
          zDepth={2}
          title={
            <Link style={{color: '#fff'}} to="/">WordBots</Link>
          }
          iconElementRight={
            <MenuItem primaryText="Linky" style={{color: '#fff'}}/>
          }
          onLeftIconButtonTouchTap={this.handleToggle}
        />

        <LeftNav style={{paddingTop: '70px'}} open={this.state.open}>
          <Link to="/home"><MenuItem>Home Page</MenuItem></Link>
          <Link to="/game"><MenuItem>Game</MenuItem></Link>
        </LeftNav>
      </div>
    );
  }
}

Header.getChildContext = {
  muiTheme: ThemeManager.getMuiTheme(PersonalTheme)
};

Header.propTypes = {
  logout: React.PropTypes.func,
  user: React.PropTypes.object
}

function mapStateToProps(state) {
  return {
    user : state.user
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(UserActions,dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Header);
