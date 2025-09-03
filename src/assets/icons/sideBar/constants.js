import adminBranches from "./admin/admin_branches.svg";
import adminEmployee from "./admin/admin_employee.svg";
import adminSettings from "./admin/admin_settings.svg";
import adminStatistics from "./admin/admin_statistics.svg";
import adminBranchesHover from "./admin/admin_branches_h.svg";
import adminEmployeeHover from "./admin/admin_employee_h.svg";
import adminSettingsHover from "./admin/admin_settings_h.svg";
import adminStatisticsHover from "./admin/admin_statistics_h.svg";
import salesAddCustomer from "./sales/sales_add_customer.svg";
import salesCustomers from "./sales/sales_customers.svg";
import salesProductsLog from "./sales/sales_products_log.svg";
import salesProducts from "./sales/sales_products.svg";
import salesAddCustomerHover from "./sales/sales_add_customer_h.svg";
import salesCustomersHover from "./sales/sales_customers_h.svg";
import salesProductsLogHover from "./sales/sales_products_log_h.svg";
import salesProductsHover from "./sales/sales_products_h.svg";
import manageEmployees from "./hr/hr_manage_employees.svg";
import manageEmployeesHover from "./hr/hr_manage_employees_h.svg";
import warehouseAdSendProducts from "./warehouseAdmin/warehouse_admin_send_products.svg";
import warehouseAdminReturnProducts from "./warehouseAdmin/warehouse_admin_return_products.svg";
import warehouseAdminProductsLog from "./warehouseAdmin/warehouse_admin_products_log.svg";
import warehouseAdminManageRequests from "./warehouseAdmin/warehouse_admin_manage_requests.svg";
import warehouseAdSendProductsHover from "./warehouseAdmin/warehouse_admin_send_products_h.svg";
import warehouseAdminReturnProductsHover from "./warehouseAdmin/warehouse_admin_return_products_h.svg";
import warehouseAdminProductsLogHover from "./warehouseAdmin/warehouse_admin_products_log_h.svg";
import warehouseAdminManageRequestsHover from "./warehouseAdmin/warehouse_admin_manage_requests_h.svg";
import warehouseAdminAttributes from "./warehouseAdmin/warehouse_admin_attributes.svg";
import warehouseAdminAttributesHover from "./warehouseAdmin/warehouse_admin_attributes_h.svg";
import branchManagerProductsRequestLog from "./branchManager/branch_admin_products_request_log.svg";
import branchManagerProductsRequestLogHover from "./branchManager/branch_admin_products_request_log_h.svg";
import logout from "./logout.svg";
import logoutHover from "./logout_h.svg";
import profileIcon from "./profile_icon.svg";
import profileIconHover from "./profile_icon_h.svg";
import sidebarArrowControl from "./sidebar_arrow.svg";
import sidebarArrowControlHover from "./sidebar_arrow_h.svg";

const navData = {
  profileIcon: [profileIcon, profileIconHover],
  sidebarArrow: [sidebarArrowControl, sidebarArrowControlHover],
  admin: {
    role: "المدير:",
    links: {
      الإحصائيات: [adminStatistics, adminStatisticsHover, "statistics"],
      "إدارة الأفرع": [adminBranches, adminBranchesHover, "branches"],
      "إدارة الموظفين": [adminEmployee, adminEmployeeHover, "manageEmployees"],
      الإعدادات: [adminSettings, adminSettingsHover, "settings"],
      "تسجيل الخروج": [logout, logoutHover, "logout"],
    },
  },
  salesOfficer: {
    role: "موظف المبيعات فرع:",
    links: {
      المنتجات: [salesProducts, salesProductsHover, "products"],
      الزبائن: [salesCustomers, salesCustomersHover, "customers"],
      "إنشاء سجل زبون": [
        salesAddCustomer,
        salesAddCustomerHover,
        "addCustomer",
      ],
      "سجل المبيعات": [
        salesProductsLog,
        salesProductsLogHover,
        "soldProductsLog",
      ],
      "تسجيل الخروج": [logout, logoutHover, "logout"],
    },
  },
  hr: {
    role: "مسؤول الموارد البشرية:",
    links: {
      "إدارة الموظفين": [
        manageEmployees,
        manageEmployeesHover,
        "manageEmployees",
      ],
      "جداول الأعمال": [ , , "workSchedules"],
      "الاجازات": [ , , "vecations"],
      "الحضور": [ , , "attendances"],
      "الرواتب": [ , , "salaries"],
      الإعدادات: [adminSettings, adminSettingsHover, "settings"],
      "تسجيل الخروج": [logout, logoutHover, "logout"],
    },
  },
  warehouseAdmin: {
    role: "مسؤول المستودع:",
    links: {
      "إدارة المنتجات": [salesProducts, salesProductsHover, "products"],
      "إرسال منتجات": [
        warehouseAdSendProducts,
        warehouseAdSendProductsHover,
        "sendProducts",
      ],
      "إعادة منتجات": [
        warehouseAdminReturnProducts,
        warehouseAdminReturnProductsHover,
        "returnProducts",
      ],
      "سجل حركة المنتجات": [
        warehouseAdminProductsLog,
        warehouseAdminProductsLogHover,
        "productsLog",
      ],

      "إدارة الطلبات": [
        warehouseAdminManageRequests,
        warehouseAdminManageRequestsHover,
        "manageRequests",
      ],
      "سجل الطلبات": [
        warehouseAdminProductsLog,
        warehouseAdminProductsLogHover,
        "requestsLog",
      ],
      "إدارة خصائص المنتجات": [
        warehouseAdminAttributes,
        warehouseAdminAttributesHover,
        "attributes",
      ],
      الإعدادات: [adminSettings, adminSettingsHover, "settings"],

      "تسجيل الخروج": [logout, logoutHover, "logout"],
    },
  },
  branchManager: {
    role: "مدير فرع:",
    links: {
      الإحصائيات: [adminStatistics, adminStatisticsHover, "statistics"],
      المنتجات: [salesProducts, salesProductsHover, "products"],
      "طلب المنتجات": [
        warehouseAdSendProducts,
        warehouseAdSendProductsHover,
        "orderProducts",
      ],
      "سجل الطلبات": [
        branchManagerProductsRequestLog,
        branchManagerProductsRequestLogHover,
        "productsRequestLog",
      ],
      "سجل المبيعات": [
        salesProductsLog,
        salesProductsLogHover,
        "soldProductsLog",
      ],
      "تسجيل الخروج": [logout, logoutHover, "logout"],
    },
  },
};

export default navData;
