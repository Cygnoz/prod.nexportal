import AreaIcon from '../assets/icons/AreaIcon'
import AreaManagerIcon from '../assets/icons/AreaMangerIcon';
import UserIcon from '../assets/icons/UserIcon';
import SupervisorIcon from '../assets/icons/SupervisorIcon';
import SupportAgentIcon from '../assets/icons/SupportAgentIcon';
import LeadIcon from '../assets/icons/LeadIcon';
import TicketCheck from '../assets/icons/TicketCheck';
import RegionIcon from '../assets/icons/RegionIcon';
import TrialIcon from '../assets/icons/TrialIcon';
import Licensor from '../assets/icons/Licensor';
import Trophy from '../assets/icons/Trophy';
import Settings from '../assets/icons/Settings';
import TargetFlag from '../assets/icons/TargetFlag';
import BookContent from '../assets/icons/BookContent';
import RecordingsIcon from '../assets/icons/RecordingsIcon';
 
// Define the available roles
export type Role =
  | "Super Admin"
  | "Sales Admin"
  | "Support Admin"
  | "Region Manager"
  | "Area Manager"
  | "BDA"
  | "Supervisor"
  | "Support Agent"
  |"Author";

// Define an interface for role permissions
interface RolePermissions {
  [key: string]: string[]; // Key is a role, value is an array of allowed sidebar options
}

// Define the icons for each sidebar option
const sidebarIcons: { [key: string]: React.ComponentType } = {
    "Region": RegionIcon,
    "Area": AreaIcon,
    "Region Manager": UserIcon,
    "Area Manager": AreaManagerIcon,
    "BDA": UserIcon,
    "Supervisor": SupervisorIcon,
    "Support Agent": SupportAgentIcon,
    "Lead": LeadIcon,
    "Trial": TrialIcon,
    "Licenser": Licensor,
    "Tickets": TicketCheck,
    "Expense" : TicketCheck,
    "Payroll" : TicketCheck,
    "User": UserIcon,
    "User Log": UserIcon,
    "Worker Commission":UserIcon,
    "Praise":Trophy,
    "Settings":Settings,
    "Target":TargetFlag,
    "CMS": BookContent,
    "Recordings":RecordingsIcon

  };

// Define routes for each sidebar option
const sidebarRoutes: { [key: string]: string } = {
    "Region": "/regions",
    "Area": "/areas",
    "Region Manager": "/region-manager",
    "Area Manager": "/area-manager",
    "BDA": "/bda",
    "Supervisor": "/supervisor",
    "Support Agent": "/support-agent",
    "Lead": "/lead",
    "Trial": "/trial",
    "Licenser": "/licenser",
    "Tickets": "/ticket",
    "Target": "/target",
    "Expense": "/expense",
    "Payroll":"/payroll",
    "User": "/settings/users",
    "User Log": "/settings/user-log",
    "Worker Commission":'/settings/worker-commission',
    "Praise":'/prises',
    "Settings":'/settings/users',
    "CMS":'/cms/blogs/posts',
    "Recordings":'/recordings'

  };

// Define permissions for each role based on the new categorization
const rolePermissions: RolePermissions = {
  'Super Admin': [
    "Region",
    "Area",
    "Region Manager",
    "Area Manager",
    "BDA",
    "Supervisor",
    "Support Agent",
    "Lead",
    "Trial",
    "Licenser",
    "Tickets",
    "Target",
    "Expense",
    "Payroll",
    "User",
    "User Log",
    "Worker Commission",
    "Praise",
    "Settings",
    "CMS",
    "Recordings"
  ],
  'Sales Admin': [
    "Region",
    "Area",
    "Region Manager",
    "Area Manager",
    "BDA",
    "Lead",
    "Trial",
    "Target",
    "Expense",
    "Payroll",
    "Licenser",
    "Worker Commission",
    "Praise",   
  ],
  'Support Admin': ["Supervisor", "Support Agent", "Trial", "Licenser",  "Expense","Payroll", "Tickets","Praise"],
  'Region Manager': ["Area", "Area Manager", "BDA","Target","Expense", "Lead", "Trial", "Licenser"],
  'Area Manager': ["BDA","Target", "Lead","Expense", "Trial", "Licenser"],
  'BDA': ["Lead", "Trial","Expense", "Licenser"],
  'Supervisor': ["Support Agent","Expense", "Trial", "Licenser", "Tickets","Recordings"],
  'Support Agent': ["Trial", "Licenser","Expense", "Tickets"],
  'Author': ["CMS"],
};

// Export rolePermissions, sidebarRoutes, and sidebarIcons
export { rolePermissions, sidebarRoutes, sidebarIcons, };
