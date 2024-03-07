import React, { useState } from 'react';
// @mui/material
import AppBar from '@mui/material/AppBar';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import { setItem } from '../../../localStorage/settings';
//* Custom @mui components
import SectionBar from '../../../jss/components/Sidebar/SectionBar';
import SectionContent from '../../../jss/components/Sidebar/SectionContent';

export default ({ defaultView, toggleDefaultView, classes }) => {
  const [changeMade, setChangeMade] = useState(false);

  const handleViewChange = () => (e) => {
    setChangeMade(true);
    toggleDefaultView(e.target.value);
  };

  const renderSaveBtn = () => {
    if (!changeMade) return null;

    return (
      <button
        type="button"
        className={classes.saveBtn}
        onClick={() => {
          setItem('defaultView', defaultView);
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
            Default View
          </Typography>
        </AppBar>        
      </SectionContent>
      {renderSaveBtn()}
      <RadioGroup aria-label="Default View" name="View" className={classes.radioButtons} value={defaultView} onChange={handleViewChange()}>
        <FormControlLabel value="LadderView" control={<Radio />} label="Ladder" labelPlacement="end" />
        <FormControlLabel value="GridView" control={<Radio />} label="Grid" labelPlacement="end" />
        <FormControlLabel value="HomeView" control={<Radio />} label="Home" labelPlacement="end" />
      </RadioGroup>
    </SectionBar>
  );
};
