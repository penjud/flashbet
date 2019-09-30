import * as React from "react";
import { connect } from "react-redux";
import * as actions from "../../../../actions/stopEntry";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import StyledMenuItem from "../../../MaterialUI/StyledMenuItem";
import StyledMenu from "../../../MaterialUI/StyledMenu";
import { formatPrice } from "../../../../utils/ladder/CreateFullLadder";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap"
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 75
  },
  group: {
    margin: theme.spacing(1, 0)
  },
  formControlLabel: {
    fontSize: "0.6rem",
    "& label": {
      fontSize: "0.6rem"
    }
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  backPriceTextFields: {
    width: 75,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  select: {
    margin: theme.spacing(1)
  }
}));

const StopEntry = props => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedIndex, setSelectedIndex] = React.useState(1);

  // Load all the runners / set All / The Field as the default
  React.useEffect(() => {
    props.onSelection(
      Object.keys(props.runners).map(key => [props.runners[key].selectionId])
    );
  }, []);

  const handleClickListItem = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (event, index) => {
    props.onSelection(index);
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Handle Submit click to place an order
  const placeOrder = () => {
    const selections = typeof props.selections == "string" ? [props.selections] : props.selections

    const newStopEntryList = Object.assign({}, props.stopEntryList)

    selections.map(selection => {
      const convertedSelection = parseInt(selection);
      const addedOrder = {
          targetLTP: props.ticks,
          condition: props.operator,
          side: props.side,
          size: props.stake,
          price: formatPrice(props.price)
      };

      if (newStopEntryList[convertedSelection] === undefined) {
        newStopEntryList[convertedSelection] = [addedOrder]
      } else {
        newStopEntryList[convertedSelection] = newStopEntryList[convertedSelection].concat(addedOrder)
      }
    })

    props.onUpdateStopEntryList(newStopEntryList);
  };

  return (
    <div className={classes.root}>
      <List component="nav" aria-label="Device settings">
        <ListItem
          button
          aria-haspopup="true"
          aria-controls="lock-menu"
          aria-label="Selections"
          onClick={handleClickListItem}
        >
          <ListItemText
            primary="Runners"
            secondary={
              props.selections
                ? typeof props.selections === "string"
                  ? props.runners[props.selections].runnerName
                  : "All / The Field"
                : ""
            }
          />
        </ListItem>
      </List>
      <StyledMenu
        id="lock-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {/* The Menu Item for All / the Field */}
        {props.runners ? (
          <StyledMenuItem
            key={`stop-loss-order-all/field`}
            className={classes.root}
            selected={typeof props.selections != "string"}
            onClick={event =>
              handleMenuItemClick(
                event,
                Object.keys(props.runners).map(key => [
                  props.runners[key].selectionId
                ])
              )
            }
          >
            All / The Field
          </StyledMenuItem>
        ) : null}
        {/* Create Menu Items for all the runners and display their names
         * Store their selectionId to be used to place bets for event clicks
         */}
        {Object.keys(props.runners).map(key => (
          <StyledMenuItem
            key={`stop-entry-order-${props.runners[key].runnerName}`}
            className={classes.root}
            selected={key === props.selections}
            onClick={event => handleMenuItemClick(event, key)}
          >
            {props.runners[key].runnerName}
          </StyledMenuItem>
        ))}
      </StyledMenu>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <FormControl variant="outlined" className={classes.formControl}>
          <InputLabel>LTP</InputLabel>
          <Select
            native
            className={classes.select}
            value={props.operator}
            onChange={e => props.onReceiveOperator(e.target.value)}
            input={<OutlinedInput name="age" />}
          >
            <option value="" />
            <option value={"<"}>{"<"}</option>
            <option value={"="}>{"="}</option>
            <option value={">"}>{">"}</option>
          </Select>
        </FormControl>
        <TextField
          id="standard-number"
          className={classes.textField}
          type="number"
          label="Ticks"
          value={props.ticks}
          inputProps={{ min: "1", max: "100" }}
          onChange={e => props.onReceiveTicks(e.target.value)}
          margin="normal"
        />
      </div>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <TextField
          id="standard-number"
          className={classes.backPriceTextFields}
          type="number"
          label="Back"
          value={props.stake}
          inputProps={{ min: "1" }}
          onChange={e => props.onReceiveStake(e.target.value)}
          margin="normal"
        />
        <TextField
          id="standard-number"
          className={classes.backPriceTextFields}
          type="number"
          label="@"
          value={props.price}
          inputProps={{ min: "1" }}
          onChange={e => props.onReceivePrice(e.target.value)}
          margin="normal"
        />
      </div>
      <Button
        variant="outlined"
        color="primary"
        className={classes.button}
        onClick={() => {
          placeOrder();
        }}
      >
        Submit
      </Button>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    operator: state.stopEntry.operator,
    ticks: state.stopEntry.ticks,
    stake: state.stopEntry.stake,
    price: state.stopEntry.price,
    runners: state.market.runners,
    side: state.stopEntry.side,
    stopEntryList: state.stopEntry.list,
    selections: state.stopEntry.selections
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onReceiveOperator: operator => dispatch(actions.setLTPOperator(operator)),
    onReceiveTicks: ticks => dispatch(actions.setTicks(ticks)),
    onReceiveStake: stake => dispatch(actions.setStake(stake)),
    onReceivePrice: price => dispatch(actions.setPrice(price)),
    onRecieveSide: side => dispatch(actions.setSide(side)),
    onUpdateStopEntryList: list => dispatch(actions.updateStopEntryList(list)),
    onSelection: selections => dispatch(actions.setSelections(selections))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StopEntry);
