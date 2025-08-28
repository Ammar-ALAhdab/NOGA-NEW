import { Navigate, Route, Routes } from "react-router-dom";
import ErrorPage from "./pages/public/ErrorPage.jsx";
import Admin from "./pages/admin/Admin.jsx";
import Branches from "./pages/admin/Branches.jsx";
import Statistics from "./pages/admin/Statistics.jsx";
import AddBranch from "./pages/admin/AddBranch.jsx";
import BranchDetails from "./pages/admin/BranchDetails.jsx";
import Branch from "./pages/admin/Branch.jsx";
import BranchAccounts from "./pages/admin/BranchAccounts.jsx";
import MangerAccountDetails from "./pages/admin/MangerAccountDetails.jsx";
import SalesAccounts from "./pages/admin/SalesAccounts.jsx";
import SalesAccountDetails from "./pages/admin/SalesAccountDetails.jsx";
// import Settings from "./pages/admin/Settings.jsx";
// import SystemAccounts from "./pages/admin/SystemAccounts.jsx";
// import SystemAccountsUsers from "./components/layout/SystemAccountsUsers.jsx";
import SystemSettings from "./pages/admin/SystemSettings.jsx";
import Employees from "./pages/admin/Employees.jsx";
import AddEmployee from "./pages/admin/AddEmployee.jsx";
import Hr from "./pages/hr/Hr.jsx";
import Login from "./pages/public/Login.jsx";
import Layout from "./pages/public/Layout.jsx";
import RequireAuth from "./auth/RequireAuth.jsx";
import WarehouseAdmin from "./pages/warehouse/WarehouseAdmin.jsx";
import Products from "./pages/warehouse/Products.jsx";
import AddProductWizard from "./pages/warehouse/AddProductWizard.jsx";
import SendProducts from "./pages/warehouse/SendProducts.jsx";
import ReturnProducts from "./pages/warehouse/ReturnProducts.jsx";
import Unauthorized from "./pages/public/Unauthorized.jsx";
import PersistLogin from "./pages/public/PersistLogin.jsx";
import EmployeeDetails from "./pages/admin/EmployeeDetails.jsx";
import CreateAccount from "./pages/admin/CreateAccount.jsx";
import HrSettings from "./pages/hr/HrSettings.jsx";
import ProductsLog from "./pages/warehouse/ProductsLog.jsx";
import BranchManager from "./pages/manager/BranchManager.jsx";
import BranchProducts from "./pages/manager/BranchProducts.jsx";
import SalesOfficer from "./pages/sales/SalesOfficer.jsx";
import WareHouseSettings from "./pages/warehouse/WareHouseSettings.jsx";
import PhoneProductDetails from "./pages/warehouse/PhoneProductDetails.jsx";
import AccessoryProductDetails from "./pages/warehouse/AccessoryProductDetails.jsx";
import VariantDetails from "./pages/warehouse/VariantDetails.jsx";
import EditProducts from "./pages/warehouse/EditProducts.jsx";
import RequestsLog from "./pages/warehouse/RequestsLog.jsx";
import OrderProducts from "./pages/manager/OrderProducts.jsx";
import ManageRequests from "./pages/warehouse/ManageRequests.jsx";
import Request from "./pages/warehouse/Request.jsx";
import AccessoryDetails from "./pages/manager/AccessoryDetails.jsx";
import PhoneDetails from "./pages/manager/PhoneDetails.jsx";
import Customers from "./pages/sales/Customers.jsx";
import AddCustomer from "./pages/sales/AddCustomer.jsx";
import CustomerDetails from "./pages/sales/CustomerDetails.jsx";
import MakeSale from "./pages/sales/MakeSale.jsx";
import ManagerStatistics from "./pages/manager/ManagerStatistics.jsx";
import ProductsRequestLog from "./pages/manager/ProductsRequestLog.jsx";
import SoldProductsLog from "./pages/sales/SoldProductsLog.jsx";
import Attributes from "./pages/warehouse/Attributes.jsx";
import ManageTransportation from "./pages/warehouse/ManageTransportation.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes is Here : */}
        <Route path="" element={<Login />} />
        <Route path="unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<ErrorPage />} />
        {/* End Public Routes */}

        {/* Protected Routes is Here : */}
        <Route element={<PersistLogin />}>
          <Route element={<RequireAuth allowedRole={["admin", "CEO"]} />}>
            {/* ----- Start Admin Routes ----- */}
            <Route path="admin" element={<Admin />}>
              {/* Redirect to statistics by default */}
              <Route index element={<Navigate to="statistics" />} />
              <Route path="statistics" element={<Statistics />} />
              <Route path="branches" element={<Branches />} />
              <Route path="branches/:BranchId" element={<Branch />} />
              <Route
                path="branches/:BranchId/details"
                element={<BranchDetails />}
              />
              <Route
                path="branches/:BranchId/branchStatistics"
                element={<ManagerStatistics />}
              />
              <Route
                path="branches/:BranchId/branchAccounts"
                element={<BranchAccounts />}
              />
              <Route
                path="branches/:BranchId/branchAccounts/mangerAccount"
                element={<MangerAccountDetails />}
              />
              <Route
                path="branches/:BranchId/branchAccounts/salesAccounts"
                element={<SalesAccounts />}
              />
              <Route
                path="branches/:BranchId/branchAccounts/salesAccounts/:SalesId"
                element={<SalesAccountDetails />}
              />
              <Route path="branches/addBranch" element={<AddBranch />} />
              <Route path="settings" element={<SystemSettings />} />
              {/* <Route
                path="settings/systemSettings"
                element={<SystemSettings />}
              />
              <Route
                path="settings/systemAccounts"
                element={<SystemAccounts />}
              />
              <Route
                path="settings/systemAccounts/adminAccount"
                element={<SystemAccountsUsers userType={"admin"} />}
              />
              <Route
                path="settings/systemAccounts/warehouseAccount"
                element={<SystemAccountsUsers userType={"warehouse"} />}
              />
              <Route
                path="settings/systemAccounts/hrAccount"
                element={<SystemAccountsUsers userType={"hr"} />}
              /> */}
              <Route path="manageEmployees" element={<Employees />} />
              <Route
                path="manageEmployees/:EmployeeID"
                element={<EmployeeDetails />}
              />
              <Route
                path="manageEmployees/addEmployee"
                element={<AddEmployee userType={"admin"} />}
              />
              <Route
                path="manageEmployees/createAccount"
                element={<CreateAccount userType={"admin"} />}
              />
            </Route>
          </Route>
          {/* ----- END Admin Routes ----- */}

          {/* ----- Start HR Routes ----- */}
          <Route element={<RequireAuth allowedRole={["HR"]} />}>
            <Route path="hr" element={<Hr />}>
              {/* Redirect to manageEmployees by default */}
              <Route index element={<Navigate to="manageEmployees" />} />
              <Route path="manageEmployees" element={<Employees />} />
              <Route
                path="manageEmployees/:EmployeeID"
                element={<EmployeeDetails />}
              />
              <Route
                path="manageEmployees/addEmployee"
                element={<AddEmployee userType={"Hr"} />}
              />
              <Route
                path="manageEmployees/createAccount"
                element={<CreateAccount userType={"Hr"} />}
              />
              <Route path="settings" element={<HrSettings />} />
            </Route>
          </Route>
          {/* ----- END HR Routes -----*/}

          {/* ----- Start WarehouseAdmin Routes ----- */}
          <Route
            element={<RequireAuth allowedRole={["Warehouse Administrator"]} />}
          >
            <Route path="/warehouseAdmin" element={<WarehouseAdmin />}>
              {/* Redirect to Products by default */}
              <Route index element={<Navigate to="products" />} />
              {/* <Route path="products" element={<ProductsCopy />} /> */}
              <Route path="products" element={<Products />} />
              <Route
                path="products/addProduct"
                element={<AddProductWizard />}
              />
              <Route path="products/editProducts" element={<EditProducts />} />
              <Route
                path="products/variant/:VariantId"
                element={<VariantDetails />}
              />
              <Route
                path="products/phone/:ProductId"
                element={<PhoneProductDetails />}
              />
              <Route
                path="products/accessory/:ProductId"
                element={<AccessoryProductDetails />}
              />
              <Route path="sendProducts" element={<SendProducts />} />
              <Route path="returnProducts" element={<ReturnProducts />} />
              <Route path="productsLog" element={<ProductsLog />} />
              <Route path="productsLog/:transportationId" element={<ManageTransportation />} />
              <Route path="manageRequests" element={<ManageRequests />} />
              <Route path="manageRequests/:RequestId" element={<Request />} />
              <Route path="requestsLog" element={<RequestsLog />} />
              <Route path="settings" element={<WareHouseSettings />} />
              <Route path="attributes" element={<Attributes />} />
            </Route>
          </Route>
          {/* ----- END WarehouseAdmin Routes ----- */}

          {/* ----- Start Branch Manger Routes ----- */}
          <Route element={<RequireAuth allowedRole={["Manager"]} />}>
            <Route path="/branchManager" element={<BranchManager />}>
              {/* Redirect to statistics by default */}
              <Route index element={<Navigate to="statistics" />} />
              <Route path="statistics" element={<ManagerStatistics />} />
              <Route
                path="products"
                element={<BranchProducts manager={true} />}
              />
              <Route
                path="products/phone/:ProductId"
                element={<PhoneDetails />}
              />
              <Route
                path="products/accessory/:ProductId"
                element={<AccessoryDetails />}
              />
              <Route path="orderProducts" element={<OrderProducts />} />
              <Route
                path="productsRequestLog"
                element={<ProductsRequestLog />}
              />
              <Route path="soldProductsLog" element={<SoldProductsLog />} />
            </Route>
          </Route>
          {/* ----- End Branch Manger Routes ----- */}

          {/* ----- Start Sales Officer Routes ----- */}
          <Route element={<RequireAuth allowedRole={["Sales Officer"]} />}>
            <Route path="/salesOfficer" element={<SalesOfficer />}>
              {/* Redirect to products by default */}
              <Route index element={<Navigate to="products" />} />
              <Route path="products" element={<BranchProducts />} />
              <Route
                path="products/phone/:ProductId"
                element={<PhoneDetails />}
              />
              <Route
                path="products/accessory/:ProductId"
                element={<AccessoryDetails />}
              />
              <Route path="customers" element={<Customers />} />
              <Route
                path="customers/:CustomerID"
                element={<CustomerDetails />}
              />
              <Route path="addCustomer" element={<AddCustomer />} />
              <Route path="makeSale" element={<MakeSale />} />
              <Route path="soldProductsLog" element={<SoldProductsLog />} />
              <Route
                path="customers/customerSoldProductsLog/:customerID"
                element={<SoldProductsLog customerRecords={true} />}
              />
            </Route>
          </Route>
          {/* ----- End Sales Officer Routes ----- */}
        </Route>

        {/* End Protected Routes */}
      </Route>
    </Routes>
  );
}
