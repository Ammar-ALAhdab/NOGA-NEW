import DropDownComponent from "../../components/inputs/DropDownComponent";
import StatisticsBox from "../../components/layout/StatisticsBox";
import currencyFormatting from "../../util/currencyFormatting";
import SectionTitle from "../../components/titles/SectionTitle";
import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import BarChartComponent from "../../components/charts/BarChartComponent";
import DateInputComponent from "../../components/inputs/DateInputComponent";
import dayjs from "dayjs";
import Title from "../../components/titles/Title";
import AssociationRulesStatistics from "../warehouse/AssociationRulesStatistics";

const time = [
  { id: 1, value: "year", title: "سنوية" },
  { id: 2, value: "month", title: "شهرية" },
  { id: 3, value: "day", title: "يومية" },
];

function Statistics() {
  const [totalEarnings, setTotalEarnings] = useState({ total_earning: 0 });
  const [newCustomersCounter, setNewCustomersCounter] = useState({
    customers_number: 0,
  });
  const [totalBranchesVisitors, setTotalBranchesVisitors] = useState({
    total_visitors: 0,
  });
  const [allPurchacedproducts, setAllPurchacedproducts] = useState([]);
  const [purchacedproducts, setPurchacedproducts] = useState({});
  const [branchesEarnings, setBranchesEarnings] = useState([]);
  const [branchesIncomings, setBranchesIncomings] = useState([]);
  const [branchVisitors, setBranchesVisitors] = useState([]);
  const [periodTime, setPeriodTime] = useState("year");
  const [dateTime, setDateTime] = useState(`${dayjs().format("YYYY-MM-DD")}`);

  const axiosPrivate = useAxiosPrivate();

  const getBranchesEarnings = async (link) => {
    try {
      const response = await axiosPrivate.get(link);
      // const filter = response.data.filter((b) => b.branch_id != 1);
      setBranchesEarnings(response.data);
    } catch (error) {
    }
  };

  const getTotalEarnings = async (link) => {
    try {
      const response = await axiosPrivate.get(link);
      setTotalEarnings(response.data);
    } catch (error) {
    }
  };

  const getTotalBrachVisitors = async (link) => {
    try {
      const response = await axiosPrivate.get(link);
      setTotalBranchesVisitors(response.data);
    } catch (error) {
    }
  };


  const getBrachVisitors = async (link) => {
    try {
      const response = await axiosPrivate.get(link);
      setBranchesVisitors(response.data);
    } catch (error) {
    }
  };

  const getBranchesIncomings = async (link) => {
    try {
      const response = await axiosPrivate.get(link);
      // const filter = response.data.filter((b) => b.branch_id != 1);

      setBranchesIncomings(response.data);
    } catch (error) {
    }
  };

  const getNewCustomersCounter = async (link) => {
    try {
      const response = await axiosPrivate.get(link);
      setNewCustomersCounter(response.data);
    } catch (error) {
    }
  };


  const getPurchacedproducts = async (link) => {
    try {
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
      setAllPurchacedproducts(response.data)
      setPurchacedproducts({
        popularProduct: productWithHighestTotal,
        countPurchased: highestTotal.toString(),
        total: total.toString(),
      });
    } catch (error) {
    }
  };

  const showStatistics = () => {
    getTotalEarnings(`sales/earnings?${periodTime}=${dateTime}`);
    getBranchesEarnings(`sales/earnings/branches?${periodTime}=${dateTime}`);
    getBranchesIncomings(`sales/income/branches?${periodTime}=${dateTime}`);
    getNewCustomersCounter(`sales/customers/count?${periodTime}=${dateTime}`);
    getPurchacedproducts(
      `sales/purchaced-products-quantities?${periodTime}=${dateTime}`
    );
    getTotalBrachVisitors(
      `branches/total-branch-visitors?${periodTime}=${dateTime}`
    )
    getBrachVisitors(
      `branches/branch-visitors?${periodTime}=${dateTime}`
    )
  };

  useEffect(() => {
    showStatistics();
  }, []);

  useEffect(() => {
    showStatistics();
  }, [periodTime, dateTime]);
console.log(branchesIncomings);
console.log(branchesEarnings);

  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow gap-4">
      <Title text="الإحصائيات:" />
      <section className="flex flex-col items-center justify-center gap-8 w-full bg-white rounded-[30px] p-4 my-box-shadow pb-6">
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
            value={currencyFormatting(totalEarnings.total_earning)}
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
            type={"newCustomersCounter"}
            value={`+${newCustomersCounter?.customers_number}`}
          />
          <StatisticsBox
            type={"totalVisitors"}
            value={`+${totalBranchesVisitors?.total_visitors}`}
          />
        </div>
        <div className="flex flex-col items-center justify-center w-full gap-4">
          <SectionTitle text={"المخططات البيانية:"} />
          <div className="w-full flex flex-wrap items-center justify-center">
            <div className="flex-1 flex items-center justify-center">
              <BarChartComponent
                data={branchesEarnings}
                fill="#7049A3"
                hoverFill="#D9A322"
                dataKey="total_earning"
                // Yvalue="الأرباح بالليرة السورية"
                title="الأرباح للأفرع"
              />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <BarChartComponent
                data={branchesIncomings}
                fill="#2DBDA8"
                hoverFill="#D9A322"
                dataKey="total"
                // Yvalue="العائدات بالليرة السورية"
                title="العائدات للأفرع"
              />
            </div>

              <div className="flex-1 flex items-center justify-center">
                <BarChartComponent
                  data={branchVisitors}
                  fill="#7049A3"
                  hoverFill="#D9A322"
                  dataKey="total_visitors"
                  // Yvalue="الأرباح بالليرة السورية"
                  title="عدد الزوار للأفرع"
                />
              </div>
            <div className="w-full flex flex-wrap items-center justify-center">
              <div className="flex-1 flex items-center justify-center">
                <BarChartComponent
                  data={allPurchacedproducts}
                  fill="#7049A3"
                  hoverFill="#D9A322"
                  dataKey="total"
                  XdataKey="product_name"
                  Xvalue="المنتجات"
                  title="المنتجات المباعة"
                />
              </div>
            </div>
          </div>

        </div>
      <AssociationRulesStatistics />
      </section>
    </main>
  );
}

export default Statistics;
