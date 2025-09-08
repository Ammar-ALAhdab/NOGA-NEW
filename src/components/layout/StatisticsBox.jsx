import PropTypes from "prop-types";
import earnings from "../../assets/icons/statistics/streamline_bag-dollar.svg";
import PurchasedProducts from "../../assets/icons/statistics/fluent-mdl2_product.svg";
import popularProduct from "../../assets/icons/statistics/octicon_heart-16.svg";
import person from "../../assets/icons/statistics/person.svg";
import income from "../../assets/icons/statistics/income.svg";

const variant = {
  totalEarnings: {
    color:
      "linear-gradient(120deg, rgba(249,200,85,1) 29%, rgba(217,163,34,1) 69%)",
    text: "صافي الأرباح",
    icon: earnings,
  },
  totalPurchasedProducts: {
    color:
      "linear-gradient(120deg, rgba(165,104,245,1) 29%, rgba(112,73,163,1) 69%)",
    text: "المنتجات المباعة",
    icon: PurchasedProducts,
  },
  PopularProduct: {
    color:
      "linear-gradient(120deg, rgba(249,141,97,1) 29%, rgba(231,109,59,1) 69%)",
    text: "المنتج الأكثر شعبية",
    icon: popularProduct,
  },
  newCustomersCounter: {
    color:
      "linear-gradient(120deg, rgba(88,236,214,1) 29%, rgba(45,189,168,1) 69%",
    text: "الزبائن الجدد",
    icon: person,
  },
  totalIncome: {
    color:
      "linear-gradient(120deg, rgba(88,236,214,1) 29%, rgba(45,189,168,1) 69%",
    text: "جميع العائدات",
    icon: income,
  },
  totalVisitors: {
    color:
      "linear-gradient(120deg, rgb(88, 236, 130) 29%, rgb(45, 189, 91) 69%)",
    text: "عدد الزوار",
    icon: income,
  },
};

function StatisticsBox({ type, value }) {
  return (
    <div
      className="w-1/4 h-[150px] rounded-3xl flex justify-between items-center p-4"
      style={{ background: variant[type].color }}
    >
      <img src={variant[type].icon} />
      <div className="flex flex-col flex-1 justify-center items-center gap-4">
        <h2 className="text-white font-bold text-center">
          :{variant[type].text}
        </h2>
        <p className="text-white font-bold text-center">{value}</p>
      </div>
    </div>
  );
}

StatisticsBox.propTypes = {
  type: PropTypes.string,
  value: PropTypes.string,
};

export default StatisticsBox;
