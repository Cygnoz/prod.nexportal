import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Layout from './layout/Layout';
import LeadHome from './modules/Customers/Lead/LeadHome';
import LeadView from './modules/Customers/Lead/LeadView';
import LicensorHome from './modules/Customers/Licensor/LicensorHome';
import TrialHome from './modules/Customers/Trial/TrialHome';
import AreaHome from './modules/Sales R&A/Area/AreaHome';
import AreaView from './modules/Sales R&A/Area/AreaView';
import RegionHome from './modules/Sales R&A/Region/RegionHome';
import RegionView from './modules/Sales R&A/Region/RegionView';
import AMHome from './modules/SalesTeams/AreaManager/AMHome';
import BDAHome from './modules/SalesTeams/BDA/BDAHome';
import BDAView from './modules/SalesTeams/BDA/view/BDAView';
import RMHome from './modules/SalesTeams/RegionManager/RMHome';
import RMView from './modules/SalesTeams/RegionManager/RMView';
import SupervisorHome from './modules/SupportTeams/Supervisor/SupervisorHome';
import SupportagentHome from './modules/SupportTeams/SupportAgent/SupportAgentHome';
import SupportAgentView from './modules/SupportTeams/SupportAgent/SupportAgentView';
import TicketsHome from './modules/Tickets/TicketsHome';
import UserHome from './modules/Users/User/UserHome';
import UserLogHome from './modules/Users/UserLog/UserLogHome';
import WCommisionHome from './modules/Users/WorkerCommision/WCommisionHome';
import DashboardPage from './pages/Dashboard/DashboardPage';
import Login from './pages/login/Login';
import Otp from './pages/login/Otp';
// import RMViewForm from './modules/RegionalManager/RegionManager/RMViewForm';
import NoAccess from './context/NoAccess';
import SuperVisorView from './modules/SupportTeams/Supervisor/SuperVisorView';
import { useUser } from './context/UserContext';
import TrialView from './modules/Customers/Trial/TrialView/TrialView';
import LicenserView from './modules/Customers/Licensor/view/LicenserView';
import AMView from './modules/SalesTeams/AreaManager/AMView';
import PraiseHome from './modules/Awards/Praise/PraiseHome';
import TicketsView from './modules/Tickets/LiveChat';
import SettingsHome from './modules/Settings/SettingsHome';
import PayrollHome from './modules/Expense/Payroll/PayrollHome';
import PayrollSlip from './modules/Expense/Payroll/view/PayrollPaySlip';
import PayrollView from './modules/Expense/Payroll/view/PayrollPgView';
import PayrollView2 from './modules/Expense/Payroll/view/PayrollAwApp';
import BusinessCard from './modules/Settings/BusinessCard';
import { roles } from './components/ui/Roles';
import ExpenseHome from './modules/Expense/Expenses/ExpenseHome';
import TargetHome from './modules/Target/TargetHome';
import PayrollView3 from './modules/Expense/Payroll/view/PayrollApproved';
import ExpenseView from './modules/Expense/Expenses/view/ExpenseView';
import ExpenseViewReject from './modules/Expense/Expenses/view/ExpenseViewReject';
import ExpenseViewPaid from './modules/Expense/Expenses/view/ExpenseViewPaid';
import ExpenseViewGranted from './modules/Expense/Expenses/view/ExpenseViewGranted';
import NotificationHome from './modules/CMS/Notification/NotificationHome';
import Posts from './modules/CMS/Posts';
import Categories from './modules/CMS/Categories';
import KnowledgeCatogeries from './modules/CMS/Knowledge Base/KnowledgeCatogeries';
import Terms_Conditions from './modules/CMS/Terms&Conditions/Terms_Conditions';
import NewPost from './modules/CMS/NewPost';
import { useResponse } from './context/ResponseContext';
// import ExpenseHome from './modules/Expense/ExpenseHome';

const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-[9999]">
      <div className="relative w-16 h-16">
        {/* Spinning Loader */}
        <div className="absolute inset-0 border-[7px]  border-[#C96E76] border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { user } = useUser();
  const {postLoading}=useResponse()
  const Wrapper: React.FC = () => {


    // Ensure `user?.role` is always a string
    const userRole = user?.role ?? ""; // Provide a default empty string if role is undefined
    const staff = roles.find((role) => role.role === userRole);

    // Check if the role is one of the admin roles
    const isAdmin = ["Super Admin", "Sales Admin", "Support Admin"].includes(userRole);

    // Component to render
    const Component = isAdmin ? DashboardPage : staff?.component;

    // Ensure `Component` is a valid React component
    if (!Component) {
      return <div>Role not found</div>; // Handle case where role or component is missing
    }

    if (typeof Component === "function") {
      return <Component staffId={user?.userId || ""} />; // Pass `userId` with a fallback for safety
    }

    return React.cloneElement(Component, { staffId: user?.userId || "" });
  };



  const parentRoutes = [
    { path: "dashboard", element: <Wrapper /> },
    { path: "regions", element: <RegionHome /> },
    { path: "regions/:id", element: <RegionView /> },
    { path: "lead/:id", element: <LeadView /> },
    { path: "areas/:id", element: <AreaView /> },
    { path: "lead", element: <LeadHome /> },
    { path: "areas", element: <AreaHome /> },
    { path: "support-agent", element: <SupportagentHome /> },
    { path: "support-agent/:id", element: <SupportAgentView /> },
    { path: "area-manager", element: <AMHome /> },
    { path: "area-manager/:id", element: <AMView /> },
    { path: "bda", element: <BDAHome /> },
    { path: "bda/:id", element: <BDAView /> },
    { path: "supervisor", element: <SupervisorHome /> },
    { path: "supervisor/:id", element: <SuperVisorView /> },
    { path: "trial", element: <TrialHome /> },
    { path: "trial/:id", element: <TrialView /> },
    { path: "licenser", element: <LicensorHome /> },
    { path: "licenser/:id", element: <LicenserView /> },
    { path: "region-manager", element: <RMHome /> },
    { path: "region-manager/:id", element: <RMView /> },
    { path: "settings/users", element: <UserHome /> },
    { path: "settings/worker-commission", element: <WCommisionHome /> },
    { path: "ticket", element: <TicketsHome /> },
    { path: "ticket/:id", element: <TicketsView /> },
    { path: "settings/user-log", element: <UserLogHome /> },
    { path: "settings/business-card", element: <BusinessCard /> },
    { path: "prises", element: <PraiseHome /> },
    { path: "settings/users", element: <SettingsHome /> },
    { path: "payroll", element: <PayrollHome /> },
    { path: "payroll-slip/:id", element: <PayrollSlip /> },
    { path: "payroll-view/:id", element: <PayrollView /> },
    { path: "payroll-view2/:id", element: <PayrollView2 /> },
    { path: "payroll-view3/:id", element: <PayrollView3 /> },
    { path: "expense", element: <ExpenseHome /> },
    { path: 'expense-pg/:id', element: <ExpenseView /> },
    { path: 'expense-reject/:id', element: <ExpenseViewReject /> },
    { path: 'expense-paid/:id', element: <ExpenseViewPaid /> },
    { path: 'expense-granted/:id', element: <ExpenseViewGranted /> },
    { path: "target", element: <TargetHome /> },
    { path: "cms/blogs/posts", element: <Posts page='blogs' /> },
    { path: "cms/blogs/categories", element: <Categories page='blogs' /> },
    { path: "cms/news/posts", element: <Posts page='news' /> },
    { path: "cms/news/categories", element: <Categories page='news' /> },
    { path: "cms/knowledge/categories", element: <KnowledgeCatogeries page='base' /> },
    { path: "cms/knowledge/subcategories", element: <KnowledgeCatogeries page='sub' /> },
    { path: "cms/knowledge/articles", element: <KnowledgeCatogeries page='article' /> },
    { path: "cms/terms", element: <Terms_Conditions /> },
    { path: "cms/notification", element: <NotificationHome /> },
    { path: "cms/blog/newpost", element: <NewPost /> },

  ];


  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/otp" element={<Otp />} />
        {sessionStorage.getItem("authToken") || user ? (
          <Route path="/*" element={<Layout />}>
            {parentRoutes.map(({ path, element }, index) => (
              <Route key={index} path={path} element={element} />
            ))}
          </Route>
        ) : (
          <Route path="*" element={<NoAccess />} />
        )}
      </Routes>
    </Router>

    {/* 🔄 Show loading overlay when loading is true */}
    {postLoading && <LoadingOverlay />}

    <Toaster reverseOrder={false} />
  </>
  );
};

export default App;



