import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useEffect, useState } from "react";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { useRouter } from "next/router";
import PaginationBar from "@/components/PaginationBar";
import { getAdminInfo, getDateFormated, handleSelectUserLanguage } from "../../../public/global_functions/popular";
import NotFoundError from "@/components/NotFoundError";
import TableLoader from "@/components/TableLoader";
import { useTranslation } from "react-i18next";

export default function TradesManagment() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

    const [adminInfo, setAdminInfo] = useState({});

    const [isGetTrades, setIsGetTrades] = useState(false);

    const [allTradesInsideThePage, setAllTradesInsideThePage] = useState([]);

    const [waitMsg, setWaitMsg] = useState("");

    const [selectedTradeIndex, setSelectedTradeIndex] = useState(-1);

    const [errorMsg, setErrorMsg] = useState("");

    const [errorMsgOnGetTradesData, setErrorMsgOnGetTradesData] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPagesCount, setTotalPagesCount] = useState(0);

    const [filters, setFilters] = useState({
        _id: "",
        startSide: "",
        endSide: "",
        pair: "",
        status: "",
    });

    const router = useRouter();

    const { t, i18n } = useTranslation();

    const pageSize = 10;

    const sides = ["buy", "sell"];

    const pairs = ["BTC/USDT", "ETH/USDT"];

    const timeframes = ["1m", "5m", "15m", "30m", "1h", "4h", "1d", "1w", "1M"];

    const statuses = ["pending", "executed", "failed"];

    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.adminDashboardlanguageFieldNameInLocalStorage);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : process.env.defaultLanguage, i18n.changeLanguage);
    }, []);

    useEffect(() => {
        const adminToken = localStorage.getItem(process.env.adminTokenNameInLocalStorage);
        if (adminToken) {
            getAdminInfo()
                .then(async (result) => {
                    if (result.error) {
                        localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                        await router.replace("/login");
                    } else {
                        const adminDetails = result.data;
                        if (adminDetails.isWebsiteOwner) {
                            setAdminInfo(adminDetails);
                            const result = (await getallTradesInsideThePage(1, pageSize, getFiltersAsQuery(filters))).data;
                            setAllTradesInsideThePage(result.trades);
                            setTotalPagesCount(Math.ceil(result.tradesCount / pageSize));
                            setIsLoadingPage(false);
                        }
                        else {
                            await router.replace("/");
                        }
                    }
                })
                .catch(async (err) => {
                    if (err?.response?.status === 401) {
                        localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                        await router.replace("/login");
                    }
                    else {
                        setIsLoadingPage(false);
                        setErrorMsgOnLoadingThePage(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Try Again !");
                    }
                });
        } else router.replace("/login");
    }, []);

    const getFiltersAsQuery = (filters) => {
        let filteringString = "";
        if (filters._id) filteringString += `_id=${filters._id}&`;
        if (filters.side) filteringString += `side=${filters.side}&`;
        if (filters.pair) filteringString += `pair=${filters.pair}&`;
        if (filters.status) filteringString += `status=${filters.status}&`;
        if (filteringString) filteringString = filteringString.substring(0, filteringString.length - 1);
        return filteringString;
    }

    const getallTradesInsideThePage = async (pageNumber, pageSize, filters) => {
        try {
            return (await axios.get(`${process.env.BASE_API_URL}/trades/all-trades-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}&language=${process.env.defaultLanguage}&${filters ? filters : ""}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                }
            })).data;
        }
        catch (err) {
            throw err;
        }
    }

    const getPreviousPage = async () => {
        try {
            setIsGetTrades(true);
            setErrorMsgOnGetTradesData("");
            const newCurrentPage = currentPage - 1;
            setAllTradesInsideThePage((await getallTradesInsideThePage(newCurrentPage, pageSize)).data.trades);
            setCurrentPage(newCurrentPage);
            setIsGetTrades(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetTradesData(err?.message === "Network Error" ? "Network Error When Get Brands Data" : "Sorry, Something Went Wrong When Get Brands Data, Please Repeate The Process !!");
            }
        }
    }

    const getNextPage = async () => {
        try {
            setIsGetTrades(true);
            setErrorMsgOnGetTradesData("");
            const newCurrentPage = currentPage + 1;
            setAllTradesInsideThePage((await getallTradesInsideThePage(newCurrentPage, pageSize)).data.trades);
            setCurrentPage(newCurrentPage);
            setIsGetTrades(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetTradesData(err?.message === "Network Error" ? "Network Error When Get Brands Data" : "Sorry, Something Went Wrong When Get Brands Data, Please Repeate The Process !!");
            }
        }
    }

    const getSpecificPage = async (pageNumber) => {
        try {
            setIsGetTrades(true);
            setErrorMsgOnGetTradesData("");
            setAllTradesInsideThePage((await getallTradesInsideThePage(pageNumber, pageSize)).data.trades);
            setCurrentPage(pageNumber);
            setIsGetTrades(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setErrorMsgOnGetTradesData(err?.message === "Network Error" ? "Network Error When Get Brands Data" : "Sorry, Something Went Wrong When Get Brands Data, Please Repeate The Process !!");
            }
        }
    }

    const filterTrades = async (filters) => {
        try {
            setIsGetTrades(true);
            setCurrentPage(1);
            const result = (await getallTradesInsideThePage(1, pageSize, getFiltersAsQuery(filters))).data
            setAllTradesInsideThePage(result.trades);
            setTotalPagesCount(Math.ceil(result.tradesCount / pageSize));
            setIsGetTrades(false);
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setIsGetTrades(false);
                setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    const deleteTrade = async (tradeIndex) => {
        try {
            setWaitMsg("Please Wait To Deleting");
            setSelectedTradeIndex(tradeIndex);
            const result = (await axios.delete(`${process.env.BASE_API_URL}/trades/delete-trade/${allTradesInsideThePage[tradeIndex]._id}?language=${process.env.defaultLanguage}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                }
            })).data;
            setWaitMsg("");
            if (!result.error) {
                setSuccessMsg("Deleting Successfull");
                let successTimeout = setTimeout(async () => {
                    setSuccessMsg("");
                    setSelectedTradeIndex(-1);
                    setAllTradesInsideThePage(allTradesInsideThePage.filter((_, index) => index !== tradeIndex));
                    clearTimeout(successTimeout);
                }, 1500);
            } else {
                setErrorMsg("Sorry, Something Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    setSelectedTradeIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
        catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
            }
            else {
                setWaitMsg("");
                setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    setSelectedTradeIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
    }

    return (
        <div className="trades-managment admin-dashboard">
            <Head>
                <title>{t(process.env.WEBSITE_NAME)} {t("Admin Dashboard")} - {t("Trades Managment")}</title>
            </Head>
            {!isLoadingPage && !errorMsgOnLoadingThePage && <>
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} />
                <div className="page-content d-flex justify-content-center align-items-center flex-column text-center pt-5 pb-5">
                    <div className="container-fluid">
                        <h1 className="welcome-msg mb-4 fw-bold pb-3 mx-auto">
                            <PiHandWavingThin className="me-2" />
                            {t("Hi, Mr")} {adminInfo.fullName} {t("In Your Trades Managment Page")}
                        </h1>
                        <section className="filters mb-5 bg-white border-3 border-info p-3 text-start">
                            <h5 className="section-name fw-bold text-center">{t("Filters")}: </h5>
                            <hr />
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <h6 className={`${i18n.language !== "ar" ? "me-2" : "ms-2"} fw-bold text-center`}>{t("Trade Id")}</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={t("Please Enter Trade Id")}
                                        onChange={(e) => setFilters({ ...filters, _id: e.target.value.trim() })}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <h6 className={`${i18n.language !== "ar" ? "me-2" : "ms-2"} fw-bold text-center`}>{t("Side")}</h6>
                                    <select
                                        className="select-trade-start-side form-select"
                                        onChange={(e) => setFilters({ ...filters, startSide: e.target.value })}
                                    >
                                        <option value="" hidden>{t("Please Select The Trade Start Side")}</option>
                                        <option value="">{t("All")}</option>
                                        {sides.map((side) => <option key={side} value={side}>{t(side)}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <h6 className={`${i18n.language !== "ar" ? "me-2" : "ms-2"} fw-bold text-center`}>{t("Side")}</h6>
                                    <select
                                        className="select-trade-end-side form-select"
                                        onChange={(e) => setFilters({ ...filters, endSide: e.target.value })}
                                    >
                                        <option value="" hidden>{t("Please Select The Trade End Side")}</option>
                                        <option value="">{t("All")}</option>
                                        {sides.map((side) => <option key={side} value={side}>{t(side)}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-4 mt-4">
                                    <h6 className={`${i18n.language !== "ar" ? "me-2" : "ms-2"} fw-bold text-center`}>{t("Pair")}</h6>
                                    <select
                                        className="select-trade-pair form-select"
                                        onChange={(e) => setFilters({ ...filters, pair: e.target.value })}
                                    >
                                        <option value="" hidden>{t("Please Select Pair")}</option>
                                        <option value="">{t("All")}</option>
                                        {pairs.map((pair) => <option key={pair} value={pair}>{pair}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-4 mt-4">
                                    <h6 className={`${i18n.language !== "ar" ? "me-2" : "ms-2"} fw-bold text-center`}>{t("Status")}</h6>
                                    <select
                                        className="select-trade-time-frame form-select"
                                        onChange={(e) => setFilters({ ...filters, timeframe: e.target.value })}
                                    >
                                        <option value="" hidden>{t("Please Select Time Frame")}</option>
                                        <option value="">{t("All")}</option>
                                        {timeframes.map((timeframe) => <option key={timeframe} value={timeframe}>{timeframe}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-4 mt-4">
                                    <h6 className={`${i18n.language !== "ar" ? "me-2" : "ms-2"} fw-bold text-center`}>{t("Status")}</h6>
                                    <select
                                        className="select-trade-status form-select"
                                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    >
                                        <option value="" hidden>{t("Please Select Status")}</option>
                                        <option value="">{t("All")}</option>
                                        {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                                    </select>
                                </div>
                            </div>
                            {!isGetTrades && <button
                                className="btn btn-success d-block w-25 mx-auto mt-2 global-button"
                                onClick={() => filterTrades(filters)}
                            >
                                {t("Filter")}
                            </button>}
                            {isGetTrades && <button
                                className="btn btn-success d-block w-25 mx-auto mt-2 global-button"
                                disabled
                            >
                                {t("Filtering")} ...
                            </button>}
                        </section>
                        {allTradesInsideThePage.length > 0 && !isGetTrades && <section className="users-box w-100">
                            <table className="users-table mb-4 managment-table bg-white w-100">
                                <thead>
                                    <tr>
                                        <th>{t("Id")}</th>
                                        <th>{t("Start Side")}</th>
                                        <th>{t("End Side")}</th>
                                        <th>{t("Pair")}</th>
                                        <th>{t("Time Frame")}</th>
                                        <th>{t("Status")}</th>
                                        <th>{t("Amount")}</th>
                                        <th>{t("Start Price")}</th>
                                        <th>{t("End Price")}</th>
                                        <th>{t("Date Of Creation")}</th>
                                        <th>{t("Processes")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allTradesInsideThePage.map((trade, tradeIndex) => (
                                        <tr key={trade._id}>
                                            <td className="id-cell">
                                                {trade._id}
                                            </td>
                                            <td className="start-side-cell">
                                                {trade.startSide ? t(trade.startSide) : "-----------"}
                                            </td>
                                            <td className="end-side-cell">
                                                {trade.endSide ? t(trade.endSide) : "-----------"}
                                            </td>
                                            <td className="pair-cell">
                                                {trade.pair}
                                            </td>
                                            <td className="time-frame-cell">
                                                {trade.timeframe}
                                            </td>
                                            <td className="status-cell">
                                                {t(trade.status)}
                                            </td>
                                            <td className="amount-cell">
                                                {trade.amount}
                                            </td>
                                            <td className="start-price-cell">
                                                {trade.startPrice ?? "-----------"}
                                            </td>
                                            <td className="end-price-cell">
                                                {trade.endPrice ?? "-----------"}
                                            </td>
                                            <td className="date-of-creation-cell">
                                                {getDateFormated(trade.createdAt)}
                                            </td>
                                            <td className="update-cell">
                                                {selectedTradeIndex !== tradeIndex && <>
                                                    <button
                                                        className="btn btn-danger global-button"
                                                        onClick={() => deleteTrade(tradeIndex)}
                                                    >{t("Delete")}</button>
                                                </>}
                                                {waitMsg && selectedTradeIndex === tradeIndex && <button
                                                    className="btn btn-info d-block mb-3 mx-auto global-button"
                                                    disabled
                                                >{t(waitMsg)}</button>}
                                                {successMsg && selectedTradeIndex === tradeIndex && <button
                                                    className="btn btn-success d-block mx-auto global-button"
                                                    disabled
                                                >{t(successMsg)}</button>}
                                                {errorMsg && selectedTradeIndex === tradeIndex && <button
                                                    className="btn btn-danger d-block mx-auto global-button"
                                                    disabled
                                                >{t(errorMsg)}</button>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>}
                        {allTradesInsideThePage.length === 0 && !isGetTrades && <NotFoundError errorMsg={t("Sorry, Can't Find Any Trades") + " !!"} />}
                        {isGetTrades && <TableLoader />}
                        {errorMsgOnGetTradesData && <NotFoundError errorMsg={t(errorMsgOnGetTradesData)} />}
                        {totalPagesCount > 1 && !isGetTrades &&
                            <PaginationBar
                                totalPagesCount={totalPagesCount}
                                currentPage={currentPage}
                                getPreviousPage={getPreviousPage}
                                getNextPage={getNextPage}
                                getSpecificPage={getSpecificPage}
                            />
                        }
                    </div>
                </div>
            </>}
            {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
            {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
        </div>
    );
}