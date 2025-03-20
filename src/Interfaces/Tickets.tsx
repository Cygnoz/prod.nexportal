export interface TicketsData {
    customerId: string;
    subject: string;
    description?: string;
    supportAgentId: string;
    priority: string;
    project?:string;
    plan?:string;
    planName?:string;
    status?: string;
  }

 