import { Role, rolePermissions } from '../types/rolePermissions';

// Define categories for sidebar options based on teams
const teamCategories = {
    "SALES R & A":["Region", "Area"],
    "SALES TEAM": [ "Region Manager", "Area Manager", "BDA","Target"],
    "SUPPORT TEAM": ["Supervisor", "Support Agent"],
    CUSTOMERS: ["Lead", "Trial", "Licenser"],
    TICKETS: ["Tickets"],
    EXPENSES:["Expense","Payroll"],
    AWARDS:['Praise'],
    SETTINGS:['Settings',"CMS"]
    
};

// Define the function to get categorized sidebar options for a given role
export function getSidebarOptions(role: Role): Record<string, string[]> {
    const options = rolePermissions[role] || [];

    // Organize the options by team category
    const categorizedOptions: Record<string, string[]> = {
        "SALES R & A":[],
        "SALES TEAM": [],
        "SUPPORT TEAM": [],
        CUSTOMERS: [],
        TICKETS: [],
        EXPENSES:[],
        AWARDS:[],
        SETTINGS:[]
    };

    options?.forEach(option => {
        for (const [category, items] of Object.entries(teamCategories)) {
            if (items.includes(option)) {
                categorizedOptions[category]?.push(option);
            }
        }
    });

    return categorizedOptions;
}
