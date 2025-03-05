import Boxes from "../../../assets/icons/Boxes";
import CoinIcon from "../../../assets/icons/CoinIcon";
// import HandCoinsIcon from "../../assets/icons/handCoinsIcon";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ClockkIcon from "../../../assets/icons/ClockkIcon";
import CopyIcon from "../../../assets/icons/CopyIcon";
import HandCoinsIcon from "../../../assets/icons/HandCoinsIcon";
import PackageCheck from "../../../assets/icons/PackageCheck";
import Modal from "../../../components/modal/Modal";
import Button from "../../../components/ui/Button";
import HomeCard from "../../../components/ui/HomeCards";
import { useResponse } from "../../../context/ResponseContext";
import useApi from "../../../Hooks/useApi";
import { endPoints } from "../../../services/apiEndpoints";
import CategoryForm from "./CategoryForm";
import ExpenseForm from "./ExpenseForm";
import ExpenseTable from "./ExpenseTable";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import toast from "react-hot-toast";
import { useUser } from "../../../context/UserContext";
import SearchBar from "../../../components/ui/SearchBar";
import SelectDropdown from "../../../components/ui/SelectDropdown";
import { months, years } from "../../../components/list/MonthYearList";
import { useRegularApi } from "../../../context/ApiContext";

interface LeadViewData {
  expenseName: string;
    addedby: string;
    category: string;
    status: string;
    amount:string;
    date: string;
  }

type Props = {}
const ExpenseHome = ({}: Props) => {

  const navigate = useNavigate()
   const {refreshContext,expenseCategories}=useRegularApi()
  const {request:getAllExpenses}=useApi('get',3002)
  const {request:deleteExpense}=useApi('delete',3002)
  const {loading,setLoading}=useResponse()
  const [editId,setEditId]=useState<any>('')
  const tabs = ["All Expenses","RM", "AM", "BDA","SV",'SA']
  const [activeTab, setActiveTab] = useState<string>("All Expenses");
 const currentMonthValue = new Date().toLocaleString("default", { month: "2-digit" });
 const currentMonth: any = months.find((m) => m.value === currentMonthValue) || months[0];
 const currentYearValue = String(new Date().getFullYear()); // Ensure it's a string
 const currentYear: any = years.find((y) => y.value === currentYearValue) || years[0];
 const [selectedMonth, setSelectedMonth] = useState<any>(currentMonth);
 const [selectedYear, setSelectedYear] = useState<any>(currentYear);
 const [newMonthList, setNewMonthList] = useState<any>([]);
 const [expenseCategoryList,setExpenseCategoryList]=useState<any[]>([])
 const [selectedCategory,setSelectedCategory]=useState<any>(null)
 const [countExpense,setCountExpense]=useState<any>('')
 const [selectedDate, setSelectedDate] = useState<string>(`${selectedYear.value}-${currentMonth.value}-1`);
  const [searchValue, setSearchValue] = useState<string>("");
  const [allExpenses,setExpenses]=useState<any[]>([])
  const [filteredExpenses,setFilteredExpenses]=useState<any[]>([])
  const {user}=useUser()
  const allowedRoles: any = ["Super Admin", "Sales Admin", "Support Admin"];


  const handleView = (id: any, status: any) => {
    let path = "/expense"; // Default path for "Paid"
    console.log(status);
    
    switch (status) {
      case "Approval Granted":
        path = "/expense-granted";
        break;
      case "Pending Approval":
        path = "/expense-pg";
        break;
      case "Rejected":
        path = "/expense-reject";
        break;
      case "Paid":
        path = "/expense-paid";
        break;
      default:
        path = "/expense";
    }
  
    // Corrected role checking condition
    

if (!allowedRoles.includes(user?.role) && !(status === "Rejected" || status === "Paid")) {
  toast.error("You are not authorized to view this page");
} else {
  navigate(`${path}/${id}`);
}

  };
  

  const handleEdit = (id:any) => {
   setEditId(id)
    handleModalToggle(true,false)
    
  }
  
  const handleDelete = (id?:any) => {
    setEditId(id)
     handleModalToggle(false,false,true)
   }
  

 // State to manage modal visibility
  const [isModalOpen, setIsModalOpen] = useState({
 addForm: false,
 categoryAdd: false,
 confirm: false,
  });

  // Function to toggle modal visibility
  const handleModalToggle = (
    addForm = false,
    categoryAdd = false,
    confirm = false,
  ) => {
    setIsModalOpen((prev) => ({
      ...prev,
      addForm,
      categoryAdd,
      confirm,
    }));
  
    // Run after state updates to check if all are false
    if (!addForm && !categoryAdd && !confirm) {
      getAllExpense();
    }
  };
  
  const handleActiveTab = (tab: any) => {
    setActiveTab(tab)
    setSearchValue('')
    if (tab === "All Expenses") {
      setFilteredExpenses(allExpenses)
    } else {
      
      const roleMap: { [key: string]: string } = {
        RM: "Region Manager",
        AM: "Area Manager",
        BDA: "BDA",
        SV:'Supervisor',
        SA:'Support Agent'
      };
      if (roleMap[tab]) {
        setFilteredExpenses(
          allExpenses?.filter((expense: any) => expense?.addedBy?.role === roleMap[tab])
        );
      }
    }
  };


  
  
  useEffect(() => {
    setNewMonthList(
      months.filter((m) =>
        selectedYear.value === currentYear.value // If selected year is the current year
          ? m.value <= currentMonthValue // Show months up to the current month
          : true // Otherwise, show all months
      )
    );
    setActiveTab("All Expenses")
    setSelectedDate(`${selectedYear.value}-${selectedMonth.value}-1`);
  
  }, [selectedMonth, selectedYear]);


  useEffect(()=>{
    getAllExpense()
  },[selectedDate,selectedCategory])
  
  useEffect(()=>{
    refreshContext({expenseCategories:true})
    if(expenseCategories){
      setExpenseCategoryList(
        expenseCategories?.map((exp: any) => ({
          value: exp?._id,
          label: exp?.categoryName       
        })) || []
      );
    }
   },[expenseCategories])

   const filteredData: any = useMemo(() => {
      return  filteredExpenses?.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchValue.toLowerCase())
        )
      );
    }, [filteredExpenses, searchValue]);


    const homeCardData = [
    {
      icon: <CoinIcon size={30}/>,
      number: countExpense?.totalExpense,
      title: "Total Expense",
      
      iconFrameColor: "#51BFDA",
      iconFrameBorderColor: "#C1E7F1CC",
    },
    {
      icon: <HandCoinsIcon/>,
      number: countExpense?.averageExpense,
      title: "Average Expense Amount",
      iconFrameColor: "#1A9CF9",
      iconFrameBorderColor: "#BBD8EDCC",
    },
    {
      icon: <ClockkIcon/>,
      number: countExpense?.pendingExpenses,
      title: "Pending Expense",
      iconFrameColor: "#D786DD",
      iconFrameBorderColor: "#FADDFCCC",
    },
    {
      icon:  <CopyIcon />,
      number: countExpense?.rejectedExpenses,
      title: "Rejected Expense",
      iconFrameColor: "#FCB23E",
      iconFrameBorderColor: "#FDE3BBCC",
    },
    ];

    console.log("fil",filteredExpenses);
    
  
    // Define the columns with strict keys
  const columns: { key: any; label: string }[] = [
    { key: "expenseName", label: "Expense Name" },
    { key: "addedBy.userName", label: "Added by" },
    { key: "category", label: "Category" },
    { key: "status", label: "Status" },
    { key: "amount", label: "Amount" },
    { key: "date", label: "Date" },
  ];

  const getAllExpense = async () => {
    try {
      setLoading(true); // Ensures loading state before API call
      const end = `${endPoints.EXPENSE}/?date=${selectedDate}${
        selectedCategory?.value ? `&id=${selectedCategory.value}` : ""
      }`;
      
      const { response, error } = await getAllExpenses(end);
  
      if (response && !error) {
        console.log("expense", response.data);
        const filteredExpense = response.data.expenses.map((expense: any) => ({
          ...expense,
          date: new Date(expense.date).toLocaleDateString(),
          category: expense?.category?.categoryName || "Uncategorized",
        }));
  
        const expenseCounts = {
          averageExpense: response?.data?.averageExpense
            ? response?.data?.averageExpense.toFixed(2) // Ensures two decimal places
            : "0.00",
          pendingExpenses: response?.data?.pendingExpenses || 0,
          rejectedExpenses: response?.data?.rejectedExpenses || 0,
          totalExpense: response?.data?.totalExpense || 0,
        };
  
        setCountExpense(expenseCounts);
        setFilteredExpenses(filteredExpense);
        setExpenses(filteredExpense);
      } else {
        console.log(error?.response?.data);
      }
    } catch (err) {
      console.error("Error fetching expenses", err);
    } finally {
      setLoading(false); // Ensures loading is reset even if API call fails
    }
  };


const handleDeleteApi = async () => {
  try {
    const { response, error } = await deleteExpense(`${endPoints.EXPENSE}/${editId}`);
    if (response && !error) {
      toast.success(response.data.message);
      getAllExpense()
    }else{
      toast.error(error?.response?.data?.message || "An error occurred");
    }

}catch(error){
    console.log(error)
  }
}


  const renderHeader = () => (
    <div>
      <div
      className={`flex justify-between  items-center mb-3`}
    >
        <div className={`w-[440px]`}>
          <SearchBar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            placeholder="Search Expense"
          />
        </div>
    
        <div className="flex gap-4">
        <SelectDropdown
                  setSelectedValue={setSelectedMonth}
                  selectedValue={selectedMonth}
                  filteredData={newMonthList}
                    searchPlaceholder="Search Month"
                  width="w-32"
                />
         <SelectDropdown
                  setSelectedValue={setSelectedYear}
                  selectedValue={selectedYear}
                  filteredData={years}

                  searchPlaceholder="Search Month"
                  width="w-28"
                />
          <SelectDropdown
                  setSelectedValue={setSelectedCategory}
                  selectedValue={selectedCategory}
                  filteredData={expenseCategoryList}
                  placeholder="Select Category"
                  searchPlaceholder="Search Category"
                  width="w-48"
                />
        </div>
    
    </div>
      <div className="flex gap-16 rounded-xl px-4 py-3 text-base font-bold  border-gray-200">
          {tabs.map((tab) => (
            <div
              key={tab}
              onClick={() => handleActiveTab(tab)}
              className={`cursor-pointer py-2 px-[16px] ${activeTab === tab
                ? "text-[#303F58] text-sm font-bold border-b-2 shadow-lg rounded-md border-[#97998E]"
                : "text-gray-400"
                }`}
            >
              {tab}
            </div>
          ))}
        </div>
    </div>
    
  );


  return (
    <>
    <div>
         <div className="flex justify-between items-center">
          <div className="p-1">
          <h1 className="text-[#303F58] text-xl font-bold my-1">Expense</h1>
                  <p className="text-[#8F99A9] text-sm font-normal">A cost incurred for business operations or services. </p>
          </div>
                  <div className="flex gap-2">
                    <Button
                      variant="tertiary"
                      className="border border-[#565148]"
                      size="sm"
                      onClick={() => {
                        handleModalToggle(false,true,false)
                        setEditId("");
                      }}
                    >
                      <p className="">
                        <span className="text-xl font-bold ">+ </span>Add Category
                      </p>
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>{
                        setEditId("");
                         handleModalToggle(true,false,false)
                        }}
                    >
                      <span className="text-xl font-bold">+</span>Add Expense
                    </Button>
                  </div>
                </div>
                <div className="flex gap-3 py-2 justify-between">
          {homeCardData?.map((card, index) => (
            <HomeCard
              iconFrameColor={card.iconFrameColor}
              iconFrameBorderColor={card.iconFrameBorderColor}
              key={index}
              icon={card.icon}
              number={card.number}
              title={card.title}
            />
          ))}
        </div>
        <div className="bg-white rounded-lg p-3 mt-2">
          {renderHeader()}
        <ExpenseTable<LeadViewData>
            data={filteredData.reverse()}
            columns={columns}
            headerContents={{
          
            search: { placeholder: "Search" },
            sort: [
                  {
                    sortHead: "Filter",
                    sortList: [
                      { label: "Sort by Date", icon: <PackageCheck size={14} color="#4B5C79"/> },
                      { label: "Sort by Status", icon: <Boxes size={14} color="#4B5C79"/> }
                    ]
                  }
                ]
            }}
            actionList={[
              { label: 'edit', function: handleEdit },
              { label: 'view', function: handleView },
              { label: 'delete', function: handleDelete },
            ]}
            loading={loading}
        />
        </div>
    </div>
    
    <Modal open={isModalOpen.addForm} onClose={() => handleModalToggle()} className="w-[60%]">
        <ExpenseForm editId={editId} onClose={() => handleModalToggle()} />
      </Modal>
      <Modal open={isModalOpen.categoryAdd} onClose={() => handleModalToggle()} className="w-[65%]">
        <CategoryForm  onClose={() => handleModalToggle()} />
      </Modal>
      <Modal className="w-[30%]" align="center" open={isModalOpen.confirm} onClose={() => handleModalToggle()}>
    <ConfirmModal
      action={handleDeleteApi}
      prompt="Are you sure want to delete this Expense?"
      onClose={() => handleModalToggle()}
    />
  </Modal>
    </>
  )
}

export default ExpenseHome