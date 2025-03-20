export const endPoints = {
  // Login
  LOGIN: "/login",
  GET_OTP: "/verify-otp",

  //User
  USER: "/user",
  GET_USERS: "/users",

  // Activity Logs
  GET_ACTIVITY_LOGS: "/get-activity-logs",
  
// Region
REGION: "/region",
GET_REGIONS: "/regions",
AREA_PERFORMANCE:"/areaPerformance",
TRIAL_CONVERTION_RATE:'/trial-conversion-rate',
LEAD_SOURCE:'/leadSource',

  // Area
  AREA: "/area",
  GET_AREAS: "/areas",
  RECENT_ACTIVITY: "/area-activity-logs",
  DEACTIVATE_AREA:"/deactivateArea",

  //RM
  RM: "/region-manager",
  GET_ALL_RM: "/region-managers",
  CHECK_RM:'/region-manager-check',
  TOP_PERFORMANCE:'/top-performers',
  DEACTIVATE_RM:'/deactivateRm',

  //Country and State
  GET_COUNTRY: "/countries",

  // Area Manager
  AM: "/area-manager",
  CHECK_AM:'/area-manager-check',
  DEACTIVATE_AM:'/deactivateAm',
  LEADS_CONVERTED:'/area-managerOvertime',

  //Worker Commission
  WC: "/commissions",
  WCS: "/commission",

  GET_ALL_AM: "/area-managers",

  // BDA
  BDA: "/bda",
  CHECK_BDA:'/bda-check',
  BDA_DETAILS:'/bda-details',
  DEACTIVATE_BDA:'/deactivateBda',
  RENEWAL_BDA:'/renewalBda',
//  CONVERTED_BDA:'/bda/67852f3fe76c8b4af14ec3dd/trial-conversions?date=2025-1-24',

  //SuperVisor
  SUPER_VISOR: "/supervisor",
  CHECK_SV:"/supervisor-check",
  DEACTIVATE_SV:'/deactivateSupervisor',

  //Support Agent
  SUPPORT_AGENT: "/supportAgent",
  DEACTIVATE_SA:'/deactivateSupportAgent',
  FEEDBACK:'/feedback',

  // Lead
  LEADS: "/leads",
  LEAD: "/lead",
  LEAD_OVERTIME:'/leadEngagementOverTime',

  // All Counts
  COUNTS:'/counts',
  //Licenser
  LICENSER: "/licenser",
  DEACTIVATE_LICENSER:'/deactivateLicenser',

  TICKETS:"/ticket",
  GET_TICKETS:"/tickets",
  REQUESTOR:"/getCustomers",

  // trial convertion
  TRIAL:'/trial',
  TRIALS:'/trials',
  GET_TRIAL:'/client',

  // Praise
  PRAISE:"/praise",
  GET_ALL_PRAISE:"/praises",
  GET_ONE_PRAISE:"/praises",



  // Dashboard
  TEAM_BREAK_DOWN:'/team-counts',
  CONVERSION_RATE:'/lead-conversion-rate',
  RESOLVED_TICKETS:'/tickets/solved-by-region',

  // Region Inside View 
  CUSTOMERCOUNTS:"/customer/statistics",

  //Region Recent Activity
  ACTIVITIES:"activity-logs",
  DEACTIVATE_REGION:"/deactivateRegion",

  DROPDOWN_DATA:"/dropdown-data",

  // LEAD ACTIVITY
  LEAD_ACTIVITY:"/activity",
  GET_ALL_LEAD_ACTIVITIES:"/activitys",
  ACTIVITY_TIMELINE:'/activities',

  //LOGOUT
  LOGOUT:"/logout", 

  // Ticket Rising
  UNASSIGNED_TICKETS:'/unassigned-ticket',

  // BUSINESSCARD
  BUSINESSCARD:'/business-cards',
  GET_ALL_BUSINESSCARD:'/business-card',
  // Chat History
  CHAT_HISTORY:'/history',
  CHATS_LEAD:'/chats/lead',
  UNUSED_TICKETS:'/unused-tickets',

  RENEW:'/renew',


 TARGET:'/targets',
 GET_ONE_TARGET:'/target',

//  Expense Category
EXPENSE_CATEGORY:'/category',
EXPENSE:'/expense',

 //Target
 TARGET_ACHEIVED:'/targetAchieved',
 YEARLY_TARGETS:'/yearlyTargets',

 //  Payroll
  PAYROLL: "/payroll",
  SALARY_INFO:'salaryInfo',
  PAY_PAYROLL:'/pay-payrol',
  // Expense 
  EXPENSE_ALL_ACCOUNTS:'/get-all-accounts',
  PAY_EXPENSE:'/pay-expense',

 
    // CMS
    CATEGORY: 'categories',
    POSTS: 'posts',
    GET_ALL_POSTS: 'post',
    NOTIFICATION: 'notification',
    TERMS: 'terms',
    SUBCATEGORY:'subcategory',
    ARTICLE:'article',

  //Smartflo
  //Smartflo
  //CLICK_TO_CALL:'/v1/click_to_call',
  // GET_RECORDINGS:'/v1/call/records'
  CLICK_TO_CALL:'initiate-call',
  GET_RECORDINGS:'get-recordings',
  GET_ALL_RECORDINGS:'get-allrecordings',

  // NexHub
  GET_ALL_SERVICES:'getAllService',
  GET_ALL_ACCOUNTS:'getAllAccounts'
};
