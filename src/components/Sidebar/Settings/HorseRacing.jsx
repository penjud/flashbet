import React, { useState } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { setItem } from '../../../localStorage/settings';

export default ({ horseRaces, toggleHorseRaces, classes }) => {
  const [changeMade, setChangeMade] = useState(false);

  const renderSaveBtn = () => {
    if (!changeMade) return null;

    return (
      <button
        type="button"
        className={classes.saveBtn}
        onClick={() => {
          setChangeMade(false);
          setItem('horseRaces', horseRaces);
        }}
      >
        <img alt="Save" src={`${window.location.origin}/icons/save.png`} />
      </button>
    );
  };

  return (
    <>
      <AppBar className={classes.appBar} position="static">
        <Typography variant="h6" className={classes.title}>
          Horse Racing
        </Typography>
      </AppBar>
      <FormControlLabel
        control={(
          <Checkbox
            value="checkedB"
            color="primary"
            checked={horseRaces.GB}
            onChange={() => {
              setChangeMade(true);
              toggleHorseRaces({
                GB: !horseRaces.GB,
                IE: horseRaces.IE,
                FR: horseRaces.FR,
                DE: horseRaces.DE,
                IT: horseRaces.IT,
                AE: horseRaces.AE,
                TR: horseRaces.TR,
                SG: horseRaces.SG,
                SE: horseRaces.SE,
                US: horseRaces.US,
                AU: horseRaces.AU,
                NZ: horseRaces.NZ,
                ZA: horseRaces.ZA,
              });
            }}
          />
        )}
        label="UK Races"
      />
      <br />
      {renderSaveBtn()}
      <FormControlLabel
        control={(
          <Checkbox
            value="checkedB"
            color="primary"
            checked={horseRaces.IE}
            onChange={() => {
              setChangeMade(true);
              toggleHorseRaces({
                GB: horseRaces.GB,
                IE: !horseRaces.IE,
                FR: horseRaces.FR,
                DE: horseRaces.DE,
                IT: horseRaces.IT,
                AE: horseRaces.AE,
                TR: horseRaces.TR,
                SG: horseRaces.SG,
                SE: horseRaces.SE,
                US: horseRaces.US,
                AU: horseRaces.AU,
                NZ: horseRaces.NZ,
                ZA: horseRaces.ZA,
              });
            }}
          />
        )}
        label="Irish Races"
      />
      <FormControlLabel
        control={(
          <Checkbox
            value="checkedB"
            color="primary"
            checked={horseRaces.FR}
            onChange={() => {
              setChangeMade(true);
              toggleHorseRaces({
                GB: horseRaces.GB,
                IE: horseRaces.IE,
                FR: !horseRaces.FR,
                DE: horseRaces.DE,
                IT: horseRaces.IT,
                AE: horseRaces.AE,
                TR: horseRaces.TR,
                SG: horseRaces.SG,
                SE: horseRaces.SE,
                US: horseRaces.US,
                AU: horseRaces.AU,
                NZ: horseRaces.NZ,
                ZA: horseRaces.ZA,
              });
            }}
          />
        )}
        label="French Races"
      />
      <FormControlLabel
        control={(
          <Checkbox
            value="checkedB"
            color="primary"
            checked={horseRaces.DE}
            onChange={() => {
              setChangeMade(true);
              toggleHorseRaces({
                GB: horseRaces.GB,
                IE: horseRaces.IE,
                FR: horseRaces.FR,
                DE: !horseRaces.DE,
                IT: horseRaces.IT,
                AE: horseRaces.AE,
                TR: horseRaces.TR,
                SG: horseRaces.SG,
                SE: horseRaces.SE,
                US: horseRaces.US,
                AU: horseRaces.AU,
                NZ: horseRaces.NZ,
                ZA: horseRaces.ZA,
              });
            }}
          />
        )}
        label="German Races"
      />
      <FormControlLabel
        control={(
          <Checkbox
            value="checkedB"
            color="primary"
            checked={horseRaces.IT}
            onChange={() => {
              setChangeMade(true);
              toggleHorseRaces({
                GB: horseRaces.GB,
                IE: horseRaces.IE,
                FR: horseRaces.FR,
                DE: horseRaces.DE,
                IT: !horseRaces.IT,
                AE: horseRaces.AE,
                TR: horseRaces.TR,
                SG: horseRaces.SG,
                SE: horseRaces.SE,
                US: horseRaces.US,
                AU: horseRaces.AU,
                NZ: horseRaces.NZ,
                ZA: horseRaces.ZA,
              });
            }}
          />
        )}
        label="Italian Races"
      />
      <br />
      <FormControlLabel
        control={(
          <Checkbox
            value="checkedB"
            color="primary"
            checked={horseRaces.AE}
            onChange={() => {
              setChangeMade(true);
              toggleHorseRaces({
                GB: horseRaces.GB,
                IE: horseRaces.IE,
                FR: horseRaces.FR,
                DE: horseRaces.DE,
                IT: horseRaces.IT,
                AE: !horseRaces.AE,
                TR: horseRaces.TR,
                SG: horseRaces.SG,
                SE: horseRaces.SE,
                US: horseRaces.US,
                AU: horseRaces.AU,
                NZ: horseRaces.NZ,
                ZA: horseRaces.ZA,
              });
            }}
          />
        )}
        label="UAE Races"
      />
      <FormControlLabel
        control={(
          <Checkbox
            value="checkedB"
            color="primary"
            checked={horseRaces.TR}
            onChange={() => {
              setChangeMade(true);
              toggleHorseRaces({
                GB: horseRaces.GB,
                IE: horseRaces.IE,
                FR: horseRaces.FR,
                DE: horseRaces.DE,
                IT: horseRaces.IT,
                AE: horseRaces.AE,
                TR: !horseRaces.TR,
                SG: horseRaces.SG,
                SE: horseRaces.SE,
                US: horseRaces.US,
                AU: horseRaces.AU,
                NZ: horseRaces.NZ,
                ZA: horseRaces.ZA,
              });
            }}
          />
        )}
        label="Turkish Races"
      />
      <FormControlLabel
        control={(
          <Checkbox
            value="checkedB"
            color="primary"
            checked={horseRaces.SG}
            onChange={() => {
              setChangeMade(true);
              toggleHorseRaces({
                GB: horseRaces.GB,
                IE: horseRaces.IE,
                FR: horseRaces.FR,
                DE: horseRaces.DE,
                IT: horseRaces.IT,
                AE: horseRaces.AE,
                TR: horseRaces.TR,
                SG: !horseRaces.SG,
                SE: horseRaces.SE,
                US: horseRaces.US,
                AU: horseRaces.AU,
                NZ: horseRaces.NZ,
                ZA: horseRaces.ZA,
              });
            }}
          />
        )}
        label="Singaporean Races"
      />
      <FormControlLabel
        control={(
          <Checkbox
            value="checkedB"
            color="primary"
            checked={horseRaces.SE}
            onChange={() => {
              setChangeMade(true);
              toggleHorseRaces({
                GB: horseRaces.GB,
                IE: horseRaces.IE,
                FR: horseRaces.FR,
                DE: horseRaces.DE,
                IT: horseRaces.IT,
                AE: horseRaces.AE,
                TR: horseRaces.TR,
                SG: horseRaces.SG,
                SE: !horseRaces.SE,
                US: horseRaces.US,
                AU: horseRaces.AU,
                NZ: horseRaces.NZ,
                ZA: horseRaces.ZA,
              });
            }}
          />
        )}
        label="Swedish Races"
      />
      <FormControlLabel
        control={(
          <Checkbox
            value="checkedB"
            color="primary"
            checked={horseRaces.US}
            onChange={() => {
              setChangeMade(true);
              toggleHorseRaces({
                GB: horseRaces.GB,
                IE: horseRaces.IE,
                FR: horseRaces.FR,
                DE: horseRaces.DE,
                IT: horseRaces.IT,
                AE: horseRaces.AE,
                TR: horseRaces.TR,
                SG: horseRaces.SG,
                SE: horseRaces.SE,
                US: !horseRaces.US,
                AU: horseRaces.AU,
                NZ: horseRaces.NZ,
                ZA: horseRaces.ZA,
              });
            }}
          />
        )}
        label="USA Races"
      />
      <FormControlLabel
        control={(
          <Checkbox
            value="checkedB"
            color="primary"
            checked={horseRaces.AU}
            onChange={() => {
              setChangeMade(true);
              toggleHorseRaces({
                GB: horseRaces.GB,
                IE: horseRaces.IE,
                FR: horseRaces.FR,
                DE: horseRaces.DE,
                IT: horseRaces.IT,
                AE: horseRaces.AE,
                TR: horseRaces.TR,
                SG: horseRaces.SG,
                SE: horseRaces.SE,
                US: horseRaces.US,
                AU: !horseRaces.AU,
                NZ: horseRaces.NZ,
                ZA: horseRaces.ZA,
              });
            }}
          />
        )}
        label="Australian Races"
      />
      <FormControlLabel
        control={(
          <Checkbox
            value="checkedB"
            color="primary"
            checked={horseRaces.NZ}
            onChange={() => {
              setChangeMade(true);
              toggleHorseRaces({
                GB: horseRaces.GB,
                IE: horseRaces.IE,
                FR: horseRaces.FR,
                DE: horseRaces.DE,
                IT: horseRaces.IT,
                AE: horseRaces.AE,
                TR: horseRaces.TR,
                SG: horseRaces.SG,
                SE: horseRaces.SE,
                US: horseRaces.US,
                AU: horseRaces.AU,
                NZ: !horseRaces.NZ,
                ZA: horseRaces.ZA,
              });
            }}
          />
        )}
        label="New Zealand Races"
      />
      <FormControlLabel
        control={(
          <Checkbox
            value="checkedB"
            color="primary"
            checked={horseRaces.ZA}
            onChange={() => {
              setChangeMade(true);
              toggleHorseRaces({
                GB: horseRaces.GB,
                IE: horseRaces.IE,
                FR: horseRaces.FR,
                DE: horseRaces.DE,
                IT: horseRaces.IT,
                AE: horseRaces.AE,
                TR: horseRaces.TR,
                SG: horseRaces.SG,
                SE: horseRaces.SE,
                US: horseRaces.US,
                AU: horseRaces.AU,
                NZ: horseRaces.NZ,
                ZA: !horseRaces.ZA,
              });
            }}
          />
        )}
        label="South African Races"
      />
    </>
  );
};
