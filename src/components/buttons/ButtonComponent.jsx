import PropTypes from "prop-types";
import add from "../../assets/icons/Buttons/add.svg";
import minus from "../../assets/icons/Buttons/minus.svg";
import deleteIt from "../../assets/icons/Buttons/delete.svg";
import filter from "../../assets/icons/Buttons/filter.svg";
import search from "../../assets/icons/Buttons/search.svg";
import back from "../../assets/icons/Buttons/back.svg";
import edit from "../../assets/icons/Buttons/edit.svg";
import procedure from "../../assets/icons/Buttons/correct.svg";
import show from "../../assets/icons/Buttons/show.svg";
import reject from "../../assets/icons/Buttons/x.svg";
import cart from "../../assets/icons/Buttons/cart.svg";
import send from "../../assets/icons/sideBar/warehouseAdmin/warehouse_admin_send_products.svg";
import salesSale from "../../assets/icons/sideBar/sales/sales_sale.svg";

const buttonVariants = {
  add: {
    text: "إضافة",
    icon: add,
    backgroundColor: "#3457D5",
  },
  reduce: {
    text: "إنقاص",
    icon: minus,
    backgroundColor: "#E76D3B",
  },
  delete: {
    text: "حذف",
    icon: deleteIt,
    backgroundColor: "#E76D3B",
  },
  filter: {
    text: "فلترة",
    icon: filter,
    backgroundColor: "#D9A322",
  },
  search: {
    text: "بحث",
    icon: search,
    backgroundColor: "#7049A3",
  },
  back: {
    text: "رجوع",
    icon: back,
    backgroundColor: "#9290C3",
  },
  edit: {
    text: "تعديل",
    icon: edit,
    backgroundColor: "#2DBDA8",
  },
  procedure: {
    text: "إجراء العملية",
    icon: procedure,
    backgroundColor: "#3457D5",
  },
  show: {
    text: "عرض التفاصيل",
    icon: show,
    backgroundColor: "#7049A3",
  },
  send: {
    text: "إرسال",
    icon: send,
    backgroundColor: "#D9A322",
  },
  accept: {
    text: "قبول",
    icon: procedure,
    backgroundColor: "#7049A3",
  },
  reject: {
    text: "رفض",
    icon: reject,
    backgroundColor: "#E76D3B",
  },
  purchases: {
    text: "عرض المشتريات",
    icon: cart,
    backgroundColor: "#2DBDA8",
  },
  sale: {
    text:"إجراء عملية بيع",
    icon: salesSale,
    backgroundColor: "#2DBDA8",
  },
  transport: {
    text:"إجراء عملية نقل",
    icon: null,
    backgroundColor: "#3457D5",
  },
  receive: {
    text:"استلام",
    icon: null,
    backgroundColor: "#3457D5",
  },
  confirm: {
    text:"تأكيد",
    icon: null,
    backgroundColor: "#3457D5",
  },
  sign_in: {
    text:"تسجيل دخول",
    icon: procedure,
    backgroundColor: "#66C266",
  },
  sign_out: {
    text:"تسجيل خروج",
    icon: reject,
    backgroundColor: "#FF7F7F",
  },
};

const ButtonComponent = ({
  variant,
  textButton = "",
  onClick = (e) => {
    e.preventDefault();
  },
  type,
  small,
  disabled = false,
}) => {
  // Default is add button if variant is not defined
  const { text, icon, backgroundColor } =
    buttonVariants[variant] || buttonVariants.add;

  const buttonStyle = {
    backgroundColor: disabled ? "#9290C3" : backgroundColor,
    padding: `${small ? "2px 8px" : "4px 16px"}`,
    border: "none",
    borderRadius: `${small ? "15px" : "30px"}`,
    color: "white",
    cursor: disabled ? "not-allowed" : "pointer",
    display: "inline-flex",
    flexDirection: `${small ? "row-reverse" : ""}`,
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    height: `${small ? "30px" : "40px"}`,
    fontSize: `${small ? "12px" : "14px"}`,
  };

  return (
    <button
      type={type}
      style={buttonStyle}
      onClick={onClick}
      disabled={disabled}
    >
      <img src={icon} alt={icon} width={18} height={18} />
      {textButton ? textButton : text}
    </button>
  );
};

ButtonComponent.propTypes = {
  variant: PropTypes.string,
  textButton: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.string,
  small: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default ButtonComponent;
