import React, { useEffect } from 'react';
import { connect } from 'react-redux';
//* @material-ui core
import List from '@material-ui/core/List';
//* Actions
import { setAllSports, updateSubmenuList, updateCurrentSubmenu } from '../../../actions/sport';
import { sortSports } from '../../../utils/Algorithms/SortSports';
import DeselectSport from './DeselectSport';
import SelectSport from './SelectSport';
import SelectSubmenu from './SelectSubmenu';
//* JSS
import useStyles from '../../../jss/components/Sidebar/menu';

const AllSports = ({ sports, currentSubmenu, winMarketsOnly, horseRaces, setAllSports, updateCurrentSubmenu, updateSubmenuList }) => {
  const classes = useStyles();
  useEffect(() => {
    // gets all the sports and saves them on the server
    fetch('/api/fetch-all-sports');
  }, []);

  useEffect(() => {
    fetch('/api/get-all-sports')
      .then((res) => res.json())
      .then((sports) => {
        sports.push({ eventType: { id: 'TC-7', name: "Horse Racing - Today's Card" } });
        sports.push({ eventType: { id: 'TC-4339', name: "Greyhound Racing - Today's Card" } });
        sports = sortSports(sports);
        setAllSports(sports);
      });
  }, []);

  useEffect(() => {
    if (sports.submenuList.EVENT_TYPE && sports.submenuList.EVENT_TYPE.name.includes("Today's Card")) {
      updateCurrentSubmenu('');
      updateSubmenuList({});
    }
  }, [winMarketsOnly, horseRaces, sports.submenuList.EVENT_TYPE, updateCurrentSubmenu, updateSubmenuList]);

  const getSportInfo = (name, newSubmenuType, submenuList, selectedId, apiToCall) => async (e) => {
    const isHorseRace = (name.startsWith('TC') && name.endsWith('7')) || (name.includes('Horse') && name.includes("Today's Card"));

    // gets the country names and makes it an array ex... [GB]
    const countryNames = Object.keys(horseRaces).reduce((acc, item) => {
      if (horseRaces[item] === true) {
        return [item, ...acc];
      }
      return acc;
    }, []);

    // call the api with the id and get new selections
    const data = await fetch(`/api/${apiToCall}/?id=${selectedId}&marketTypes=${winMarketsOnly === true ? 'WIN' : undefined}&country=${isHorseRace ? JSON.stringify(countryNames) : undefined}`)
      .then((res) => res.json())
      .catch(() => {});

    // set the old submenu as the newSubmenuType: children we received from the api
    if (data) {
      const newSubmenuList = { submenuList };

      newSubmenuList[newSubmenuType] = { name, data };

      updateCurrentSubmenu(newSubmenuType);
      updateSubmenuList(newSubmenuList);
    }
  };

  const setSubmenu = (data, name, newSubmenuType, submenuList) => {
    const newSubmenuList = { ...submenuList };
    newSubmenuList[newSubmenuType] = { name, data };

    updateCurrentSubmenu(newSubmenuType);
    updateSubmenuList(newSubmenuList);
  };

  const deselectSubmenu = (newSubmenuType, submenuList) => {
    if (newSubmenuType === 'ROOT') {
      updateCurrentSubmenu('');
      updateSubmenuList({});
      return;
    }

    const submenuEnum = {
      ROOT: 0,
      EVENT_TYPE: 1,
      GROUP: 2,
      GROUP_1: 3,
      EVENT: 4,
      RACE: 5,
      MARKET: 6,
    };

    // filter out items that are above the submenu level, we are going upward in the list, so we remove items under that aren't needed
    const newSubmenuList = {};

    const maxSubmenuLevel = submenuEnum[newSubmenuType];
    Object.keys(submenuList).map((key) => {
      if (!submenuEnum[key] || submenuEnum[key] <= maxSubmenuLevel) {
        newSubmenuList[key] = submenuList[key];
      }
    });

    updateCurrentSubmenu(newSubmenuType);
    updateSubmenuList(newSubmenuList);
  };

  return (
    <List className={classes.allSports}>
      {Object.keys(sports.submenuList).map((type, index) => (
        <DeselectSport key={`all-sports-deselect-${sports.submenuList[type].name}`} type={type} data={sports.submenuList[type]} isLast={index === Object.keys(sports.submenuList).length - 1} submenuList={sports.submenuList} deselectSubmenu={deselectSubmenu} />
      ))}

      {
        // Selecting Item
        sports.submenuList.EVENT_TYPE === undefined || currentSubmenu === '' ? (
          <SelectSport sports={sports.sports} setSubmenu={getSportInfo} />
        ) : (
          <SelectSubmenu data={sports.submenuList[currentSubmenu].data} setSubmenu={setSubmenu} submenuList={sports.submenuList} />
        )
      }
    </List>
  );
};

const mapStateToProps = (state) => ({
  sports: state.sports,
  myMarkets: state.market.myMarkets,
  winMarketsOnly: state.settings.winMarketsOnly,
  horseRaces: state.settings.horseRaces,
});

const mapDispatchToProps = {
  setAllSports,
  updateSubmenuList,
  updateCurrentSubmenu,
};

export default connect(mapStateToProps, mapDispatchToProps)(AllSports);
