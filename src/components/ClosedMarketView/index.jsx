import React from 'react';
//* Components
import BetsPlaced from './BetsPlaced';
import MarketReport from './MarketReport';
import MarketSettlement from './MarketSettlement';
//* JSS
import useStyles from '../../jss/components/ClosedMarketView';

const ClosedMarketView = () => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <MarketSettlement />
      <div className={styles.tables}>
        <MarketReport />
        <BetsPlaced />
      </div>
    </div>
  );
};

export default ClosedMarketView;
