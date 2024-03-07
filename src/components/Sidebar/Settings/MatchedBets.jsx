import React, { useState } from 'react';
// @mui/material
import AppBar from '@mui/materialAppBar';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { setItem } from '../../../localStorage/settings';
//* Custom @mui/material components
import SectionBar from '../../../jss/components/Sidebar/SectionBar';
import SectionContent from '../../../jss/components/Sidebar/SectionContent';

export default ({ matchedBets, toggleMatchedBets, classes }) => {
  const [changeMade, setChangeMade] = useState(false);

  const renderSaveBtn = () => {
    if (!changeMade) return null;

    return (
      <button
        type="button"
        className={classes.saveBtn}
        onClick={() => {
          setChangeMade(false);
          setItem('matchedBets', matchedBets);
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
            Matched Bets
          </Typography>
        </AppBar>
      </SectionContent>
      <FormControlLabel
        className={classes.checkboxes}
        control={(
          <Checkbox
            value="checkedB"
            checked={matchedBets.visible}
            onChange={() => {
              setChangeMade(true);
              toggleMatchedBets({ visible: !matchedBets.visible });
            }}
          />
        )}
        label="Visible"
      />
      {renderSaveBtn()}
    </SectionBar>
  );
};
