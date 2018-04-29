import React, { Component } from 'react';
import { bool, func, number } from 'prop-types';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';

export default class RankedQueue extends Component {
    static propTypes = {
        disabled: bool,
        queuing: bool,
        inQueue: number,
        onJoinQueue: func,
        onLeaveQueue: func
    };

    handleJoinQueue = () => {
        this.props.onJoinQueue();
    };

    handleLeaveQueue = () => {
        this.props.onLeaveQueue();
    };

    render = () => (
        <Paper style={{padding: 20, marginBottom: 20, position: 'relative'}}>
            <div>
                    <span>
                        <b>{ this.props.inQueue ? this.props.inQueue : 0 } player(s) in ranked queue</b>
                    </span>
            </div>
            <div style={{position: 'absolute', top: 0, bottom: 0, right: 20, height: 36, margin: 'auto'}}>
                {
                    this.props.queuing ?
                    < RaisedButton
                        secondary
                        label ="Leave Ranked Queue"
                        onTouchTap={this.handleLeaveQueue} />
                    :
                    <RaisedButton
                        secondary
                        label="Join Ranked Queue"
                        onTouchTap={this.handleJoinQueue}/>
                }
            </div>
        </Paper>
    );
}
