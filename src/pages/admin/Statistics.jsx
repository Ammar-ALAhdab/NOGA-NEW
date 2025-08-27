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
  const [purchacedproducts, setPurchacedproducts] = useState({});
  const [branchesEarnings, setBranchesEarnings] = useState([]);
  const [branchesIncomings, setBranchesIncomings] = useState([]);
  const [periodTime, setPeriodTime] = useState("year");
  const [dateTime, setDateTime] = useState(`${dayjs().format("YYYY-MM-DD")}`);

  const axiosPrivate = useAxiosPrivate();

  const getBranchesEarnings = async (link) => {
    try {
      const response = await axiosPrivate.get(link);
      const filter = response.data.filter((b) => b.branch_id != 1);
      setBranchesEarnings(filter);
    } catch (error) {
      console.log(error);
    }
  };

  const getTotalEarnings = async (link) => {
    try {
      const response = await axiosPrivate.get(link);
      setTotalEarnings(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getBranchesIncomings = async (link) => {
    try {
      const response = await axiosPrivate.get(link);
      const filter = response.data.filter((b) => b.branch_id != 1);

      setBranchesIncomings(filter);
    } catch (error) {
      console.log(error);
    }
  };

  const getNewCustomersCounter = async (link) => {
    try {
      const response = await axiosPrivate.get(link);
      setNewCustomersCounter(response.data);
    } catch (error) {
      console.log(error);
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
    getTotalEarnings(`/earnings?${periodTime}=${dateTime}`);
    getBranchesEarnings(`/earnings/branches?${periodTime}=${dateTime}`);
    getBranchesIncomings(`/income/branches?${periodTime}=${dateTime}`);
    getNewCustomersCounter(`/customers/count?${periodTime}=${dateTime}`);
    getPurchacedproducts(
      `/purchaced-products-quantities?${periodTime}=${dateTime}`
    );
  };

  useEffect(() => {
    showStatistics();
  }, []);

  useEffect(() => {
    showStatistics();
  }, [periodTime, dateTime]);

  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow gap-4">
      <Title text="الإحصائيات:" />
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
          </div>
        </div>
      </section>
    </main>
  );
}

export default Statistics;
