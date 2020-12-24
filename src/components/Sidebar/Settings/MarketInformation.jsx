import React, { useState } from 'react';
//* @material-ui core
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { setItem } from '../../../localStorage/settings';
//* Custom @material-ui components
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
        <AppBar className={classes.appBar} position="static">
          <Typography variant="h6" className={classes.title}>
            Market Information
          </Typography>
        </AppBar>
      </SectionContent>
      <FormControlLabel
        control={(
          <Checkbox
            value="checkedB"
            color="primary"
            checked={marketInfo.visible}
            onChange={() => {
              setChangeMade(true);
              toggleMarketInformation({ visible: !marketInfo.visible, open: marketInfo.open });
            }}
          />
                  )}
        label="Show Panel"
      />
      {renderSaveBtn()}
      <FormControlLabel
        control={(
          <Checkbox
            value="checkedB"
            color="primary"
            checked={marketInfo.open}
            onChange={() => {
              setChangeMade(true);
              toggleMarketInformation({ visible: marketInfo.visible, open: !marketInfo.open });
            }}
          />
                  )}
        label="Panel Open"
      />
    </SectionBar>
  );
};
