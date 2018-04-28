import React, { Component } from 'react';
import { bool, func, number } from 'prop-types';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';

export default class RankedQueue extends Component {
    static propTypes = {
        disabled: bool,
        inQueue: number,
        onJoinQueue: func
    };

    handleJoinQueue = () => {
        this.props.onJoinQueue();
    };

    render = () => (
        <Paper style={{padding: 20, marginBottom: 20, position: 'relative'}}>
            <div style={{position: 'absolute', top: 0, bottom: 0, right: 20, height: 36, margin: 'auto', color: 'white'}}>
                <div style={{position: 'relative'}}>
                    { this.props.inQueue ? <span>
                            <b>{this.props.inQueue} player(s) in ranked queue </b>
                        </span>
                        : <span/>
                    }
                </div>
                <RaisedButton
                    secondary
                    label="Join Ranked Queue"
                    onTouchTap={this.handleJoinQueue} />
            </div>
        </Paper>
    );
}
