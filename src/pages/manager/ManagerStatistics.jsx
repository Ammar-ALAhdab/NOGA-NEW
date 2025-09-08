import DropDownComponent from "../../components/inputs/DropDownComponent";
import StatisticsBox from "../../components/layout/StatisticsBox";
import currencyFormatting from "../../util/currencyFormatting";
import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import DateInputComponent from "../../components/inputs/DateInputComponent";
import Title from "../../components/titles/Title";
import dayjs from "dayjs";
import useLocationState from "../../hooks/useLocationState";

const time = [
  { id: 1, value: "year", title: "سنوية" },
  { id: 2, value: "month", title: "شهرية" },
  { id: 3, value: "day", title: "يومية" },
];

function ManagerStatistics() {
  const branchInfo = useLocationState("branch");
  const [branchEarnings, setBranchEarnings] = useState({ total_earning: 0 });
  const [branchIncomings, setBranchIncomings] = useState({
    total_income: 0,
  });
  const [branchVisitors, setBranchesVisitors] = useState({ total_visitors: 0 });
  const [periodTime, setPeriodTime] = useState("year");
  const [dateTime, setDateTime] = useState(`${dayjs().format("YYYY-MM-DD")}`);
  const branchID =
    JSON.parse(localStorage.getItem("branchID")) || branchInfo.id;
  const branchName =
    JSON.parse(localStorage.getItem("branchName")) ||
    `${branchInfo?.city_name} ${branchInfo?.number}`;
  const axiosPrivate = useAxiosPrivate();
  const [purchacedproducts, setPurchacedproducts] = useState({});

  const getBranchEarnings = async (link) => {
    try {
      const response = await axiosPrivate.get(link);
      setBranchEarnings(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getBranchIncomings = async (link) => {
    try {
      const response = await axiosPrivate.get(link);
      setBranchIncomings(response.data);
    } catch (error) {
      console.log(error);
    }
  };
  const getBrachVisitors = async (link) => {
    try {
      const response = await axiosPrivate.get(link);
      setBranchesVisitors(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getPurchacedproducts = async (link) => {
    try {
      console.log(link);
      let highestTotal = 0;
      let total = 0;
      let productWithHighestTotal = null;
      const response = await axiosPrivate.get(link);
      response.data.forEach((item) => {
        total += item.total;
        if (item.total > highestTotal) {
          highestTotal = item.total;
          productWithHighestTotal = item.product_name;
        }
      });
      setPurchacedproducts({
        popularProduct: productWithHighestTotal,
        countPurchased: highestTotal.toString(),
        total: total.toString(),
      });
    } catch (error) {
      console.log(error);
    }
  };

  const showStatistics = () => {
    getBranchEarnings(
      `sales/earnings/branches/${branchID}?${periodTime}=${dateTime}`
    );
    getBranchIncomings(
      `sales/income/branches/${branchID}?${periodTime}=${dateTime}`
    );
    getPurchacedproducts(
      `sales/purchaced-products-quantities/branches/${branchID}?${periodTime}=${dateTime}`
    );
    getBrachVisitors(
      `branches/total-branch-visitors/${branchID}?${periodTime}=${dateTime}`
    )
  };

  useEffect(() => {
    showStatistics();
  }, []);

  useEffect(() => {
    showStatistics();
  }, [periodTime, dateTime]);

  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow gap-4">
      <Title text={`إحصائيات فرع ${branchName}:`} />
      <section className="flex flex-col items-center justify-center gap-8 w-full bg-white rounded-[30px] p-4 my-box-shadow ">
        <div className="flex flex-row-reverse items-center justify-end w-full gap-4">
          <DateInputComponent
            label={"التاريخ:"}
            value={dateTime}
            onChange={setDateTime}
          />
          <DropDownComponent
            label="الفترة الزمنية:"
            data={time}
            dataTitle={"title"}
            dataValue={"value"}
            ButtonText={"اختر الفترة"}
            value={periodTime}
            onSelect={setPeriodTime}
          />
        </div>
        <div className="flex flex-row-reverse items-center justify-end w-full gap-4">
          <StatisticsBox
            type={"totalEarnings"}
            value={currencyFormatting(branchEarnings.total_earning)}
          />
          <StatisticsBox
            type={"totalIncome"}
            value={currencyFormatting(branchIncomings.total_income)}
          />
          <StatisticsBox
            type={"totalPurchasedProducts"}
            value={purchacedproducts.total}
          />
          <StatisticsBox
            type={"PopularProduct"}
            value={purchacedproducts.popularProduct}
          />
          <StatisticsBox
            type={"totalVisitors"}
            value={`+${branchVisitors.total_visitors}`}
          />
        </div>

      </section>
    </main>
  );
}

export default ManagerStatistics;
