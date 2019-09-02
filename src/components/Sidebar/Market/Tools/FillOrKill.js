import * as React from "react";
import { connect } from "react-redux";
import * as actions from "../../../../actions/fillOrKill";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "row"
  },
  number: {
    marginLeft: theme.spacing(1),
    width: 50
  }
}));

const FillOrKill = props => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <div className={classes.root}>
        <TextField
          id="standard-number"
          className={classes.number}
          type="number"
          label="Seconds"
          value={props.seconds}
          onChange={e => props.onReceiveFillOrKill(e.target.value)}
          margin="normal"
        />
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = state => {
  return {
    seconds: state.fillOrKill.seconds
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onReceiveFillOrKill: seconds => dispatch(actions.setFillOrKill(seconds))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FillOrKill);