import React, { useState } from 'react';
// @mui/material
import AppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/core/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { setItem } from '../../../localStorage/settings';
// @mui/material
import SectionBar from '../../../jss/components/Sidebar/SectionBar';
import SectionContent from '../../../jss/components/Sidebar/SectionContent';

export default ({
  marketInfo, toggleMarketInformation, classes,
}) => {
  const [changeMade, setChangeMade] = useState(false);

  const renderSaveBtn = () => {
    if (!changeMade) return null;

    return (
      <button
        type="button"
        className={classes.saveBtn}
        onClick={() => {
          setItem('marketInfo', marketInfo);
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
            Market Information
          </Typography>
        </AppBar>
      </SectionContent>
      <FormControlLabel
        className={classes.checkboxes}
        control={(
          <Checkbox
            value="checkedB"
            checked={marketInfo.visible}
            onChange={() => {
              setChangeMade(true);
              toggleMarketInformation({ visible: !marketInfo.visible });
            }}
          />
                  )}
        label="Visible"
      />
      {renderSaveBtn()}
    </SectionBar>
  );
};
