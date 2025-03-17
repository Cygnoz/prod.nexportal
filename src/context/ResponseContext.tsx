import React, { createContext, useState, ReactNode, useContext } from 'react';
import { LeadData } from '../Interfaces/Lead';

type CMSMENU={
  IsCMSMenuOpen:boolean
  selectedData:string
}

type ResponseContextType = {
  customerData: LeadData |any;
  setCustomerData: React.Dispatch<React.SetStateAction<LeadData | null>>;
  unAssignedTicketCount:number
  setUnAssignedTicketCount:React.Dispatch<React.SetStateAction<number>>;
  loading: any;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  postLoading: any;
  setPostLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isDrawerOpen: any;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  cmsMenu: any;
  setCmsMenu: React.Dispatch<React.SetStateAction<CMSMENU>>;
};

// Create the context with a default value
const ResponseContext = createContext<ResponseContextType | undefined>(undefined);

// Context provider component
export const ResponseProvider = ({ children }: { children: ReactNode }) => {
  const [customerData, setCustomerData] = useState<LeadData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [postLoading, setPostLoading] = useState<boolean>(false);
  const [unAssignedTicketCount, setUnAssignedTicketCount] = useState<number>(0);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [cmsMenu, setCmsMenu] = useState<CMSMENU>({
    IsCMSMenuOpen:false,
    selectedData:'BillBizz'
  });
  return (
    <ResponseContext.Provider value={{ customerData, setCustomerData,loading,setLoading,unAssignedTicketCount,setUnAssignedTicketCount,setPostLoading,postLoading,isDrawerOpen,setDrawerOpen,cmsMenu,setCmsMenu }}>
      {children}
    </ResponseContext.Provider>
  );
};

// Custom hook to use the context
export const useResponse = (): ResponseContextType => {
  const context = useContext(ResponseContext);
  if (!context) {
    throw new Error('useResponse must be used within a ResponseProvider');
  }
  return context;
};
