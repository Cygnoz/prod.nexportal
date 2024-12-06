// export interface AMData{
//     image?:any;
//     fullName:string;
//     email?:string;
//     phone:string;
//     age?:string;
//     bloodGroup?:string;
//     address?:string;
//     street1?:string;
//     street2?:string;
//     city?:string;
//     state?:string;
//     adhaarNo?:string;
//     panNo?:string;
//     dateOfJoining?:string;
//     loginEmail:string;
//     password:string;
//     confirmPassword:string;
//     workEmail?:string;
//     workPhone?:string;
//     region?:string;
//     regionId?:string;
//     area?:string;
//     areaId?:string;
//     commission?:number;
//     bankDetails?:string;
//     bankName?:string;
//     bankBranch?:string;
//     bankAccountNo?:string;
//     ifscCode?:string;
// }

interface Address {
    street1: string;
    street2: string;
  }
  
  interface BankDetails {
    bankName: string;
    bankBranch: string;
    bankAccountNo: string;
    ifscCode: string;
  }
  
 export interface AMData {
    image?: string;
    fullName: string;
    email?: string;
    phone: string;
    age?: number |null;
    bloodGroup?: string;
    address?: Address;
    city?: string;
    state?: string;
    adhaarNo?: string;
    panNo?: string;
    dateOfJoining?: string;
    loginEmail: string;
    password: string;
    confirmPassword:string;
    workEmail?: string;
    workPhone?: string;
    region?: string;
    area?: string;
    commission?: string;
    bankDetails?: BankDetails;
  }
  