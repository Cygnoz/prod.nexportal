export interface LeadData {
    salutation?:string
    image?:string;
    firstName: string;
    lastName?: string;
    email?: string;
    phone: string;
    website?: string;
    leadSource: string;
    regionId: string;
    areaId: string;
    bdaId: string;
    companyId?: string;
    companyName?: string;
    companyPhone?: string;
    companyAddress?: string;
    pinCode?: string;
    customerId?:string
    customerStatus?:string
    project:string
    startDate?:string
    endDate?:string
    assignedBDA?:string
    trialStatus?:string
    age?:string;
    address?:string;
    regionDetails?:{regionName:string};
  }