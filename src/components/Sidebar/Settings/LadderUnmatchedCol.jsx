import React, { useState } from 'react';
// @mui/material
import AppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { setItem } from '../../../localStorage/settings';
//* Custom @mui/material components
import SectionBar from '../../../jss/components/Sidebar/SectionBar';
import SectionContent from '../../../jss/components/Sidebar/SectionContent';

export default ({ ladderUnmatched, toggleLadderUnmatched, classes }) => {
  const [changeMade, setChangeMade] = useState(false);

  const renderSaveBtn = () => {
    if (!changeMade) return null;

    return (
      <button
        type="button"
        className={classes.saveBtn}
        onClick={() => {
          setItem('ladderUnmatched', ladderUnmatched);
          setChangeMade(false);
        }}
      >
        <img alt="Save" src={`${window.location.origin}/icons/Save_Button.svg`} />
      </button>
    );
  };

  return (
    <SectionBar>
      <SectionContent>
        <AppBar className={classes.appBar} position="absolute">
          <Typography variant="h6" className={classes.title}>
            Ladder Unmatched
          </Typography>
        </AppBar>
      </SectionContent>
      {renderSaveBtn()}
      <RadioGroup
        aria-label="Ladder Column"
        name="unmatched"
        className={classes.radioButtons}
        value={ladderUnmatched}
        onChange={(e) => {
          setChangeMade(true);
          toggleLadderUnmatched(e.target.value);
        }}
      >
        <FormControlLabel value="blank" control={<Radio />} label="Unmatched Bets Only" labelPlacement="end" />
        <FormControlLabel value="pl" control={<Radio />} label="Unmatched Bets + P/L" labelPlacement="end" />
        <FormControlLabel value="hedged" control={<Radio />} label="Unmatched Bets + Hedge" labelPlacement="end" />
      </RadioGroup>
    </SectionBar>
  );
};
