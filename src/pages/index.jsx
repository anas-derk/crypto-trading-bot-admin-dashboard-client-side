import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { getAdminInfo, handleSelectUserLanguage } from "../../public/global_functions/popular";
import { useTranslation } from "react-i18next";
import FormFieldErrorBox from "@/components/FormFieldErrorBox";
import axios from "axios";
import { inputValuesValidation } from "../../public/global_functions/validations";

export default function Home() {

  const [isLoadingPage, setIsLoadingPage] = useState(true);

  const [errorMsgOnLoadingThePage, setErrorMsgOnLoadingThePage] = useState("");

  const [adminInfo, setAdminInfo] = useState({});

  const [tradeInfo, setTradeInfo] = useState({
    amount: "",
    pair: "",
    timeframe: "",
  })

  const [waitMsg, setWaitMsg] = useState("");

  const [errorMsg, setErrorMsg] = useState("");

  const [successMsg, setSuccessMsg] = useState("");

  const [formValidationErrors, setFormValidationErrors] = useState({});

  const router = useRouter();

  const { t, i18n } = useTranslation();

  const pairs = ["BTC/USDT", "ETH/USDT"];

  const timeframes = ["1m", "5m", "15m", "30m", "1h", "4h", "1d", "1w", "1M"];

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
            setAdminInfo(result.data);
            setIsLoadingPage(false);
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

  const createOrder = async (e) => {
    try {
      e.preventDefault();
      setFormValidationErrors({});
      const errorsObject = inputValuesValidation([
        {
          name: "amount",
          value: tradeInfo.amount,
          rules: {
            isRequired: {
              msg: "Sorry, This Field Can't Be Empty !!",
            },
          },
        },
        {
          name: "pair",
          value: tradeInfo.pair,
          rules: {
            isRequired: {
              msg: "Sorry, This Field Can't Be Empty !!",
            },
          },
        },
        {
          name: "timeframe",
          value: tradeInfo.timeframe,
          rules: {
            isRequired: {
              msg: "Sorry, This Field Can't Be Empty !!",
            },
          },
        },
      ]);
      setFormValidationErrors(errorsObject);
      if (Object.keys(errorsObject).length == 0) {
        setWaitMsg("Please Wait");
        const result = (await axios.post(`${process.env.BASE_API_URL}/trades/create-order?language=${process.env.defaultLanguage}`, tradeInfo, {
          headers: {
            Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
          }
        })).data;
        setWaitMsg("");
        if (!result.error) {
          setSuccessMsg(result.msg);
          let successTimeout = setTimeout(async () => {
            setSuccessMsg("");
            clearTimeout(successTimeout);
          }, 1500);
        } else {
          setErrorMsg(result.msg);
          let errorTimeout = setTimeout(() => {
            setErrorMsg("");
            clearTimeout(errorTimeout);
          }, 1500);
        }
      }
    }
    catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
        await router.replace("/login");
        setWaitMsg("");
      }
      else {
        setWaitMsg("");
        setErrorMsg(err?.message === "Network Error" ? "Network Error" : "Sorry, Something Went Wrong, Please Repeate The Process !!");
        let errorTimeout = setTimeout(() => {
          setErrorMsg("");
          clearTimeout(errorTimeout);
        }, 1500);
      }
    }
  }

  return (
    <div className="main admin-dashboard">
      <Head>
        <title>{t(process.env.WEBSITE_NAME)} - {t("Admin Dashboard")}</title>
      </Head>
      {!isLoadingPage && !errorMsgOnLoadingThePage && <>
        <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
        <div className="page-content d-flex justify-content-center align-items-center flex-column">
          <h1 className="fw-bold w-fit pb-2 text-centerm mb-5">
            <PiHandWavingThin className="me-2" />
            {t("Hi, Mr")} {`${adminInfo.fullName}`} {t("In Your Admin Dashboard Main Page")}
          </h1>
          <form className="create-order-form w-50" onSubmit={createOrder}>
            <div className="amount-field-box">
              <input
                type="number"
                placeholder={t("Please Enter Amount")}
                className={`form-control p-3 border-2 ${formValidationErrors["amount"] ? "border-danger mb-2" : "mb-5"}`}
                onChange={(e) => setTradeInfo({ ...tradeInfo, amount: e.target.valueAsNumber })}
              />
            </div>
            {formValidationErrors["amount"] && <FormFieldErrorBox errorMsg={t(formValidationErrors["amount"])} />}
            <div className={`select-pair-field-box ${formValidationErrors["pair"] ? "border-danger mb-2" : "mb-5"}`}>
              <select
                className="select-trade-pair form-select"
                onChange={(e) => setTradeInfo({ ...tradeInfo, pair: e.target.value })}
              >
                <option value="" hidden>{t("Please Select Pair")}</option>
                <option value="">{t("All")}</option>
                {pairs.map((pair) => <option key={pair} value={pair}>{pair}</option>)}
              </select>
            </div>
            {formValidationErrors["pair"] && <FormFieldErrorBox errorMsg={t(formValidationErrors["pair"])} />}
            <div className={`select-time-frame-field-box ${formValidationErrors["timeframe"] ? "border-danger mb-2" : "mb-5"}`}>
              <select
                className="select-trade-timeframe form-select"
                onChange={(e) => setTradeInfo({ ...tradeInfo, timeframe: e.target.value })}
              >
                <option value="" hidden>{t("Please Select Time Frame")}</option>
                {timeframes.map((timeframe) => <option key={timeframe} value={timeframe}>{timeframe}</option>)}
              </select>
            </div>
            {formValidationErrors["timeframe"] && <FormFieldErrorBox errorMsg={t(formValidationErrors["timeframe"])} />}
            {!waitMsg && !successMsg && !errorMsg && <button
              type="submit"
              className="btn btn-success w-50 d-block mx-auto p-2 global-button"
            >
              {t("Create Order")}
            </button>}
            {waitMsg && <button
              className="btn btn-danger w-50 d-block mx-auto p-2 global-button"
              disabled
            >
              {t(waitMsg)}
            </button>}
            {errorMsg && <button
              className="btn btn-danger w-50 d-block mx-auto p-2 global-button"
              disabled
            >
              {t(errorMsg)}
            </button>}
            {successMsg && <button
              className="btn btn-success w-75 d-block mx-auto p-2 global-button"
              disabled
            >
              {t(successMsg)}
            </button>}
          </form>
        </div>
      </>}
      {isLoadingPage && !errorMsgOnLoadingThePage && <LoaderPage />}
      {errorMsgOnLoadingThePage && <ErrorOnLoadingThePage errorMsg={errorMsgOnLoadingThePage} />}
    </div>
  );
}