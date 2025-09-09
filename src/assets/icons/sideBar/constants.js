import adminBranches from "./admin/admin_branches.svg";
import adminEmployee from "./admin/admin_employee.svg";
import adminSettings from "./admin/admin_settings.svg";
import adminStatistics from "./admin/admin_statistics.svg";
import adminCameras from "./admin/admin_cameras.svg";
import adminDiscounts from "./admin/admin_discounts.svg";
import adminCoupons from "./admin/admin_coupons.svg";
import adminBranchesHover from "./admin/admin_branches_h.svg";
import adminEmployeeHover from "./admin/admin_employee_h.svg";
import adminSettingsHover from "./admin/admin_settings_h.svg";
import adminStatisticsHover from "./admin/admin_statistics_h.svg";
import adminCamerasHover from "./admin/admin_cameras_h.svg";
import adminDiscountsHover from "./admin/admin_discounts_h.svg";
import adminCouponsHover from "./admin/admin_coupons_h.svg";
import salesAddCustomer from "./sales/sales_add_customer.svg";
import salesCustomers from "./sales/sales_customers.svg";
import salesProductsLog from "./sales/sales_products_log.svg";
import salesProducts from "./sales/sales_products.svg";
import salesFindNearestBranch from "./sales/sales_find_nearest_branch.svg";
import salesAddCustomerHover from "./sales/sales_add_customer_h.svg";
import salesCustomersHover from "./sales/sales_customers_h.svg";
import salesProductsLogHover from "./sales/sales_products_log_h.svg";
import salesProductsHover from "./sales/sales_products_h.svg";
import salesFindNearestBranchHover from "./sales/sales_find_nearest_branch_h.svg";
import manageEmployees from "./hr/hr_manage_employees.svg";
import manageEmployeesHover from "./hr/hr_manage_employees_h.svg";
import hrWorkSchedules from "./hr/hr_work_schedules.svg";
import hrWorkSchedulesHover from "./hr/hr_work_schedules_h.svg";
import hrVacations from "./hr/hr_vacations.svg";
import hrVacationsHover from "./hr/hr_vacations_h.svg";
import hrAttendance from "./hr/hr_attendance.svg";
import hrAttendanceHover from "./hr/hr_attendance_h.svg";
import hrSalaries from "./hr/hr_salaries.svg";
import hrSalariesHover from "./hr/hr_salaries_h.svg";
import warehouseAdSendProducts from "./warehouseAdmin/warehouse_admin_send_products.svg";
import warehouseAdminProductsLog from "./warehouseAdmin/warehouse_admin_products_log.svg";
import warehouseAdminManageRequests from "./warehouseAdmin/warehouse_admin_manage_requests.svg";
import warehouseAdSendProductsHover from "./warehouseAdmin/warehouse_admin_send_products_h.svg";
import warehouseAdminProductsLogHover from "./warehouseAdmin/warehouse_admin_products_log_h.svg";
import warehouseAdminManageRequestsHover from "./warehouseAdmin/warehouse_admin_manage_requests_h.svg";
import warehouseAdminAttributes from "./warehouseAdmin/warehouse_admin_attributes.svg";
import warehouseAdminAttributesHover from "./warehouseAdmin/warehouse_admin_attributes_h.svg";
import branchManagerProductsRequestLog from "./branchManager/branch_admin_products_request_log.svg";
import branchManagerProductsRequestLogHover from "./branchManager/branch_admin_products_request_log_h.svg";
import branchSentProducts from "./branchManager/branch_sent_products.svg";
import branchSentProductsHover from "./branchManager/branch_sent_products_h.svg";
import branchReceivedProducts from "./branchManager/branch_received_products.svg";
import branchReceivedProductsHover from "./branchManager/branch_received_products_h.svg";
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
      الكاميرات: [adminCameras, adminCamerasHover, "cameras"],
      الخصومات: [adminDiscounts, adminDiscountsHover, "discounts"],
      الكوبونات: [adminCoupons, adminCouponsHover, "coupons"],
      "عمليات الشراء": [
        warehouseAdminProductsLog,
        warehouseAdminProductsLogHover,
        "purchases",
      ],
      الإعدادات: [adminSettings, adminSettingsHover, "settings"],
      "تسجيل الخروج": [logout, logoutHover, "logout"],
    },
  },
  salesOfficer: {
    role: "موظف المبيعات فرع:",
    links: {
      المنتجات: [salesProducts, salesProductsHover, "products"],
      "ايجاد المنتج في اقرب فرع": [
        salesFindNearestBranch,
        salesFindNearestBranchHover,
        "nearest-branch",
      ],
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
      "جداول الأعمال": [hrWorkSchedules, hrWorkSchedulesHover, "workSchedules"],
      الاجازات: [hrVacations, hrVacationsHover, "vecations"],
      الحضور: [hrAttendance, hrAttendanceHover, "attendances"],
      الرواتب: [hrSalaries, hrSalariesHover, "salaries"],
      الإعدادات: [adminSettings, adminSettingsHover, "settings"],
      "تسجيل الخروج": [logout, logoutHover, "logout"],
    },
  },
  warehouseAdmin: {
    role: "مسؤول المستودع:",
    links: {
      "إدارة المنتجات": [salesProducts, salesProductsHover, "products"],
      "إدارة خصائص المنتجات": [
        warehouseAdminAttributes,
        warehouseAdminAttributesHover,
        "attributes",
      ],
      " نقل المنتجات": [
        warehouseAdSendProducts,
        warehouseAdSendProductsHover,
        "sendProducts",
      ],
      // "إعادة منتجات": [
      //   warehouseAdminReturnProducts,
      //   warehouseAdminReturnProductsHover,
      //   "returnProducts",
      // ],
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
      // "سجل الطلبات": [
      //   warehouseAdminProductsLog,
      //   warehouseAdminProductsLogHover,
      //   "requestsLog",
      // ],

      // الإعدادات: [adminSettings, adminSettingsHover, "settings"],

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
      "حركة المنتجات المرسلة": [
        branchSentProducts,
        branchSentProductsHover,
        "productsLogSource",
      ],
      "حركة المنتجات المستلمة": [
        branchReceivedProducts,
        branchReceivedProductsHover,
        "productsLogDestination",
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
