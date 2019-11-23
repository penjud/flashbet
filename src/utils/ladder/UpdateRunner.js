
import { SearchInsert } from "../Algorithms/SearchInsert";
import { formatPriceKey, calcBackLayPercentages } from "../ladder/CreateFullLadder";

const UpdateRunner = (ladder, rawData) => {

  if (rawData.ltp) {
    ladder.ltp = [rawData.ltp, ...ladder.ltp];
  }
  if (rawData.tv) {
    ladder.tv = [rawData.tv, ladder.tv[0]];
  }

  if (rawData.trd) {
    rawData.trd.forEach(trd => {
      let price = trd[0];
      let totalMatched = Math.floor(trd[1]);

      let index = SearchInsert(ladder.trd, price, true);

      if (totalMatched <= 0) {
        if (price === ladder.trd[index][0]) {
          ladder.trd.splice(index, 1);
        }
      }
      else if (price === ladder.trd[index][0]) {
        ladder.trd[index][1] = totalMatched;
      }
      else {
        ladder.trd.splice(index, 0, [price, totalMatched]);
      }
    });
  }

  // Update the atb values
  if (rawData.atb) {
    rawData.atb.forEach(atb => {
      if (atb[1] > 0 && Math.floor(atb[1] <= 0)) {
        let price = atb[0];
        let matched = Math.floor(atb[1]);
  
        let index = SearchInsert(ladder.atb, price, true);
  
        if (matched <= 0) {
          if (price === ladder.atb[index][0]) {
            ladder.atb.splice(index, 1);
            ladder.fullLadder[formatPriceKey(price)].layMatched = null;
          }
        }
        else if (price === ladder.atb[index][0]) {
          ladder.atb[index][1] = matched;
          ladder.fullLadder[formatPriceKey(price)].layMatched = matched;
        }
        else {
          ladder.atb.splice(index, 0, [price, matched]);
          ladder.fullLadder[formatPriceKey(price)].layMatched = matched;
        }
      }
    });
  }

  // Update the atl values
  if (rawData.atl) {
    rawData.atl.forEach(atl => {
      if (atl[1] > 0 && Math.floor(atl[1] <= 0)) {
        let price = atl[0];
        let matched = Math.floor(atl[1]);
  
        let index = SearchInsert(ladder.atl, price, false);

        if (matched <= 0) {
          if (price === ladder.atl[index][0]) {
            ladder.atl.splice(index, 1);
            ladder.fullLadder[formatPriceKey(price)].backMatched = null;
          }
        }
        else if (price === ladder.atl[index][0]) {
          ladder.atl[index][1] = matched;
          ladder.fullLadder[formatPriceKey(price)].backMatched = matched;
        }
        else {
          ladder.atl.splice(index, 0, [price, matched]);
          ladder.fullLadder[formatPriceKey(price)].backMatched = matched;
        }
      }
    });
  }

  ladder.percent = calcBackLayPercentages(ladder.fullLadder, ladder.ltp[0]);

  return ladder;
}

export { UpdateRunner };