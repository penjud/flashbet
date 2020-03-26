import $ from "jquery";
import React, { createRef, useState } from "react";
import { connect } from "react-redux";
import { setRunner, updateOrder, updateOrderValue, updateOrderPrice, toggleVisibility, toggleStakeAndLiability, toggleBackAndLay, toggleOneClick } from "../../actions/market";
import { placeOrder } from "../../actions/order";
import { setStakeInOneClick } from "../../actions/settings";
import { calcBackProfit, colorForBack } from "../../utils/Bets/BettingCalculations";
import { getMarketCashout } from "../../utils/Bets/GetMarketCashout";
import { getPLForRunner, marketHasBets } from "../../utils/Bets/GetProfitAndLoss";
import { isValidPrice } from "../../utils/Bets/Validator";
import { getNextPrice } from "../../utils/ladder/CreateFullLadder";
import { DeconstructLadder } from "../../utils/ladder/DeconstructLadder";
import { DeconstructRunner } from "../../utils/Market/DeconstructRunner";
import { formatCurrency } from "../../utils/NumberFormat";
import { calcHedgedPL2 } from "../../utils/TradingStategy/HedingCalculator";
import GridDetailCell from "./GridDetailCell";
import GridHeader from "./GridHeader";
import GridOrderRow from "./GridOrderRow";
import NonRunners from "./NonRunner";
import SuspendedWarning from "./SuspendedWarning";

const Grid = ({oneClickOn, oneClickStake, marketOpen, marketStatus, inPlay, market, ladder,
	sortedLadder, runners, nonRunners, stakeBtns, layBtns, countryCode, currencyCode, localeCode, bets,
	setRunner, updateOrder, updateOrderValue, updateOrderPrice, toggleVisibility,
	toggleStakeAndLiability, toggleBackAndLay, toggleOneClick, setStakeInOneClick, placeOrder }) => {
	
	const [rowHovered, setRowHovered] = useState(null);
	const [activeOrder, setActiveOrder] = useState(null);
	const [ordersVisible, setOrdersVisible] = useState(0);
	const oneClickRef = createRef();

	const handlePriceClick = (key, backLay, odds) => e => {
		e.preventDefault();

		if (!marketOpen || marketStatus === "SUSPENDED" || marketStatus === "CLOSED") return;

		if (!oneClickOn) {
			updateOrder({
				id: key,
				visible: true,
				backLay: backLay,
				price: odds
			});
			setOrdersVisible(ordersVisible + 1);
		}
	};

	const handlePriceHover = key => e => {
		if (!marketOpen || marketStatus === "SUSPENDED" || marketStatus === "CLOSED") return;
		setRowHovered(key);
		$(e.currentTarget).one("mouseleave", e => {
			setRowHovered(null);
		});
	};

	const changeSide = order => e => {
		if (!marketOpen || marketStatus === "SUSPENDED" || marketStatus === "CLOSED") return;
		toggleBackAndLay({ id: order.id });
		setActiveOrder(Object.assign(activeOrder || {}, { backLay: order.backLay }));
	};

	const handleOneClickPress = () => e => {
		if (!marketOpen || marketStatus === "SUSPENDED" || marketStatus === "CLOSED") return;
		toggleOneClick(!oneClickOn);
		const node = oneClickRef.current;
		oneClickOn ? node.blur() : node.focus();
	};

	const toggleStakeAndLiabilityButtons = data => e => {
		if (!marketOpen || marketStatus === "SUSPENDED" || marketStatus === "CLOSED") return;
		toggleStakeAndLiability(data);
	};

	const toggleOrderRowVisibility = data => e => {
		toggleVisibility(data);
		setActiveOrder(null);
		setOrdersVisible(ordersVisible - 1);
	};

	const handlePriceClickInOneClick = stake => e => {
		setStakeInOneClick(stake);
	};

	const updateOrderSize = data => e => {
		// Size comes from the textfield input from event if not sent from the button
		if (!data.stake) {
			data.stake = e.target.value;
		}

		updateOrderValue(data);
		setActiveOrder(data);
	};

	const handlePriceChange = data => e => {
		let val = parseInt(e.target.value);

		if (isValidPrice(val)) {
			data.price = getNextPrice(data.price, e.target.value);
			updateOrderPrice(data);
		}
	};

	const selectRunner = runner => e => {
		setRunner(runner);
	};

	const renderRow = (betOdds, key, backLay) => {
		// Fill all empty cells if no data found
		if (!betOdds) {
			return [
				<td className="grid-cell" />,
				<td className="grid-cell" />,
				<td className="grid-cell" />,
				<td className="grid-cell" />,
				<td className="grid-cell" />
			];
		}

		const rows = [];

		for (var i = 0; i < betOdds.length; i++) {
			rows.push(createCell(betOdds[i][0], betOdds[i][1], key, backLay));
			if (i === 4) break;
		}

		// Fill the remaining columns with empty cells
		while (rows.length < 5) {
			rows.push(<td key={rows.length + 1} className="grid-cell" />);
		}

		return rows;
	};

	const createCell = (odds, matched, key, backLay) => {
		return (
			<td
				key={"grid-" + odds}
				className="grid-cell"
				onMouseEnter={handlePriceHover(key)}
				onClick={handlePriceClick(key, backLay, odds)}
				onContextMenu={handlePriceClick(key, (backLay ^= 1), odds)}>
				<span>{odds}</span>
				<span>{matched}</span>
			</td>
		);
	};

	const renderProfitAndLossAndHedge = (order, color) => {
		return {
			val: formatCurrency(
				localeCode,
				currencyCode,
				calcBackProfit(order.stake, order.price, order.backLay)
			),
			color: color
		};
	};

	const renderTableData = () => {
		return (
			<React.Fragment>
				{renderRunners()}
				<NonRunners
					sportId={market.eventType.id}
					nonRunners={nonRunners}
					runners={runners}
					selectRunner={selectRunner}
				/>
			</React.Fragment>
		);
	};

	const renderRunners = () => {
		return sortedLadder.map(key => {
			const { atb, atl, ltp, tv, ltpStyle } = DeconstructLadder(ladder[key]);
			const { name, number, logo, order } = DeconstructRunner(runners[key], market.eventType.id);

			const orderProps =
				order.stakeLiability === 0
					? {
							text: "STAKE",
							text2: "BACK",
							prices: stakeBtns
					  }
					: {
							text: "LIABILITY",
							text2: "LAY",
							prices: layBtns
					  };

			orderProps.text2 = order.backLay === 0 ? "BACK" : "LAY";
			orderProps.bg = order.backLay === 0 ? "#DBEFFF" : "#FEE9EE";

			const profitArray = Object.values(bets.matched)
				.filter(bet => bet.selectionId == runners[key].selectionId)
				.map(
					bet =>
						(bet.side === "LAY" ? -1 : 1) *
						calcHedgedPL2(parseFloat(bet.size), parseFloat(bet.price), parseFloat(ltp[0]))
				);
			const profit = (-1 * profitArray.reduce((a, b) => a - b, 0)).toFixed(2);

			return (
				<React.Fragment key={`grid-runner-${key}`}>
					<tr>
						<GridDetailCell
							sportId={market.eventType.id}
							market={market}
							runner={runners[key]}
							name={name}
							number={number}
							logo={logo}
							ltp={ltp}
							tv={tv}
							bets={bets}
							PL={
								marketHasBets(market.marketId, bets)
									? {
											val: formatCurrency(
												localeCode,
												currencyCode,
												getPLForRunner(market.marketId, parseInt(key), bets)
											),
											color: colorForBack(
												order.backLay,
												getPLForRunner(market.marketId, parseInt(key), bets)
											)
									  }
									: order.visible && rowHovered === key && activeOrder
									? renderProfitAndLossAndHedge(order, colorForBack(order.backLay))
									: rowHovered && rowHovered !== key && activeOrder
									? renderProfitAndLossAndHedge(order, colorForBack(activeOrder.backLay ^ 1))
									: { val: "", color: "" }
							}
							hedge={profit}
							ltpStyle={ltpStyle}
						/>
						{renderRow(atb, key, 0).reverse()}
						{renderRow(atl, key, 1)}
					</tr>

					<GridOrderRow
						runnerId={key}
						order={order}
						orderProps={orderProps}
						toggleStakeAndLiabilityButtons={toggleStakeAndLiabilityButtons}
						toggleBackAndLay={changeSide}
						updateOrderSize={updateOrderSize}
						updateOrderPrice={handlePriceChange}
						toggleOrderRowVisibility={toggleOrderRowVisibility}
						placeOrder={placeOrder}
						market={market}
						bets={bets}
						price={market.runners[key] ? market.runners[key].order.price : 0}
						side={activeOrder && activeOrder.side == 0 ? "BACK" : "LAY"}
						size={activeOrder ? activeOrder.stake : 0}
					/>
				</React.Fragment>
			);
		});
	};

	const ltpSelectionIdObject = {};

	Object.keys(ladder).map(key => {
		const { ltp } = DeconstructLadder(ladder[key]);
		ltpSelectionIdObject[key] = ltp[0];
	});

	const marketCashout = getMarketCashout(market.marketId, bets, ladder);

	return (
		<div id="grid-container">
			<table style={marketStatus === "SUSPENDED" ? { opacity: 0.75 } : {}} className={"grid-view"}>
				<SuspendedWarning marketStatus={marketStatus} />
				<tbody>
					<GridHeader
						market={market}
						ladder={ladder}
						marketOpen={marketOpen}
						inPlay={inPlay}
						status={marketStatus}
						country={{
							localeCode: localeCode,
							countryCode: countryCode
						}}
						oneClickRef={oneClickRef}
						oneClickOn={oneClickOn}
						toggleOneClick={handleOneClickPress}
						oneClickStake={oneClickStake}
						setStakeOneClick={handlePriceClickInOneClick}
						stakeBtns={stakeBtns}
						layBtns={layBtns}
						bets={bets}
						ltpList={ltpSelectionIdObject}
						placeOrder={placeOrder}
						marketCashout={marketCashout}
					/>
					{marketOpen &&
					(marketStatus === "OPEN" || marketStatus === "RUNNING" || marketStatus === "SUSPENDED")
						? renderTableData()
						: null}
				</tbody>
			</table>
		</div>
	);
};

const mapStateToProps = state => {
	return {
		oneClickOn: state.market.oneClickOn,
		oneClickStake: state.settings.stake,
		marketOpen: state.market.marketOpen,
		marketStatus: state.market.status,
		inPlay: state.market.inPlay,
		market: state.market.currentMarket,
		ladder: state.market.ladder,
		sortedLadder: state.market.sortedLadder,
		runners: state.market.runners,
		nonRunners: state.market.nonRunners,
		stakeBtns: state.settings.stakeBtns,
		layBtns: state.settings.layBtns,
		countryCode: state.account.countryCode,
		currencyCode: state.account.currencyCode,
		localeCode: state.account.localeCode,
		bets: state.order.bets
	};
};

const mapDispatchToProps = { setRunner, updateOrder, updateOrderValue, updateOrderPrice, toggleVisibility, toggleStakeAndLiability, toggleBackAndLay, toggleOneClick, setStakeInOneClick, placeOrder };

export default connect(mapStateToProps, mapDispatchToProps)(Grid);
