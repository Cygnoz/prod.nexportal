import { useState, useEffect } from "react";
import Image from "../../assets/image/Rectangle.png";
import TargetTable from "./TargetTable";
import TargetForm from "./TargetForm";
import Modal from "../../components/modal/Modal";
import Button from "../../components/ui/Button";
import { useUser } from "../../context/UserContext";
import useApi from "../../Hooks/useApi";
import { endPoints } from "../../services/apiEndpoints";
import toast from "react-hot-toast";
import ConfirmModal from "../../components/modal/ConfirmModal";
import { useRegularApi } from "../../context/ApiContext";
import { useResponse } from "../../context/ResponseContext";
import SelectDropdown from "../../components/ui/SelectDropdown";
import { months, years } from "../../components/list/MonthYearList";
import { useLocation, useNavigate } from "react-router-dom";
import SearchBar from "../../components/ui/SearchBar";

type TabType = "Region" | "Area" | "BDA";

const TargetHome = () => {
  const { request: getAllTarget } = useApi('get', 3004);
  const { request: deleteTarget } = useApi("delete", 3004);
  const { refreshContext } = useRegularApi();
  const { loading, setLoading } = useResponse();
  const [editId, setEditId] = useState('');
  const [allTargets, setAllTargets] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<TabType>("Region");
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");

  const { user } = useUser();

  const tabs: TabType[] = ["Region", "Area", "BDA"];

  const getVisibleTabs = (): TabType[] => {
    switch (user?.role) {
      case "Super Admin":
        return tabs;
      case "Region Manager":
        return tabs.filter((tab) => tab !== "Region");
      case "Area Manager":
        return tabs.filter((tab) => tab === "BDA");
      default:
        return [];
    }
  };

  const getDefaultTab = (): TabType => {
    switch (user?.role) {
      case "Super Admin":
        return "Region";
      case "Region Manager":
        return "Area";
      case "Area Manager":
        return "BDA";
      default:
        return "Region"; // Fallback in case user role is undefined
    }
  };

  const [activeTab, setActiveTab] = useState<TabType>(getDefaultTab());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    setActiveTab(getDefaultTab());
  }, [user?.role]);

  const handleCreateTarget = () => {
    setModalType(activeTab);
    setIsCreateModalOpen(true);
    refreshContext({ customerCounts: true });
    getTargets(monthParam || selectedMonth.label, yearParam || selectedYear.value);

  };

  const handleEdit = (id: any) => {
    setModalType(activeTab);
    setIsCreateModalOpen(true);
    setEditId(id);
  };

  const openDeleteModal = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteId(null);
    setIsDeleteModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { response, error } = await deleteTarget(`${endPoints.TARGET}/${deleteId}`);
      if (response && !error) {
        toast.success(response.data.message || "Target deleted successfully");
        getTargets(); // Refresh the list
      } else {
        console.error(error);
        toast.error("Failed to delete target");
      }
    } catch (err) {
      console.error("Error deleting target:", err);
      toast.error("An error occurred while deleting target");
    } finally {
      closeDeleteModal(); // Close delete modal after operation
    }
  };

  const getTargets = async (month?: string, year?: string) => {
    try {
      setLoading(true);
      const endpoint = `${endPoints.TARGET}?month=${month}&year=${year}`;
      const { response, error } = await getAllTarget(endpoint);

      console.log("Targets:", response);

      if (response && !error && response.data) {
        // If data is found, update allTargets and set data correctly
        setAllTargets(response.data);
      } else {
        // If no data is found, reset allTargets to empty arrays
        setAllTargets({
          region: [],
          area: [],
          bda: [],
        });
      }
    } catch (err) {
      console.log(err);
      // Handle unexpected errors by resetting data
      setAllTargets({
        region: [],
        area: [],
        bda: [],
      });
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    refreshContext({ customerCounts: true });
  }, []);

  const Regioncolumns = [
    { key: "region.regionName", label: "Region" },
    { key: "target", label: "Target" },
  ];

  const Areacolumns = [
    { key: "area.areaName", label: "Area" },
    { key: "target", label: "Target" },
  ];

  const BDAcolumns = [
    { key: "bda.user.userName", label: "BDA" },
    { key: "target", label: "Target" },
  ];

  const isButtonVisible = (() => {
    if (user?.role === "Super Admin" && activeTab === "Region") return true;
    if (user?.role === "Region Manager" && activeTab === "Area") return true;
    if (user?.role === "Area Manager" && activeTab === "BDA") return true;
    return false;
  })();


  useEffect(() => {
    const dataByTab = getDataByActiveTab(activeTab);
    const filtered = filterData(dataByTab, searchValue);
    setFilteredData(filtered);
  }, [activeTab, allTargets, searchValue]);


  const filterData = (data: any[], search: string) => {
    if (!search) return data; // Return all data if search is empty

    const lowerSearch = search.toLowerCase();
    return data.filter((item) => {
      // Check regionName for "Region" tab
      if (item.region?.regionName?.toLowerCase().includes(lowerSearch)) {
        return true;
      }

      // Check areaName for "Area" tab
      if (item.area?.areaName?.toLowerCase().includes(lowerSearch)) {
        return true;
      }

      // Check bda.user.userName for "BDA" tab
      if (item.bda?.user?.userName?.toLowerCase().includes(lowerSearch)) {
        return true;
      }

      return false; // Return false if no match is found
    });
  };


  const getDataByActiveTab = (tab: any) => {
    if (!allTargets) return [];
    switch (tab) {
      case "Region":
        return allTargets?.region || [];
      case "Area":
        return allTargets?.area ?? [];  // Use `?? []` to handle null values
      case "BDA":
        return allTargets?.bda ?? [];
      default:
        return [];
    }
  };


  // console.log("data", data);

  // console.log("API Response:", allTargets);


  const currentMonthValue = new Date().toLocaleString("default", { month: "2-digit" });
  const currentMonth: any = months.find((m) => m.value === currentMonthValue) || months[0];
  const currentYearValue = String(new Date().getFullYear());
  const currentYear: any = years.find((y) => y.value === currentYearValue) || years[0];
  const [selectedMonth, setSelectedMonth] = useState<any>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<any>(currentYear);

  const navigate = useNavigate();
  const location = useLocation();


  // Get query params from URL when page loads
  const queryParams = new URLSearchParams(location.search);
  const monthParam = queryParams.get("month");
  const yearParam = queryParams.get("year");
  useEffect(() => {
    // Set values from URL if present, otherwise use default values
    if (monthParam && yearParam) {
      const monthFromUrl = months.find((m) => m.label === monthParam);
      const yearFromUrl = years.find((y) => y.value === yearParam);

      if (monthFromUrl) setSelectedMonth(monthFromUrl);
      if (yearFromUrl) setSelectedYear(yearFromUrl);
    }

    // Fetch targets initially
    getTargets(monthParam || selectedMonth.label, yearParam || selectedYear.value);
  }, []);

  useEffect(() => {
    // Update URL when selectedMonth or selectedYear changes
    const queryParams = new URLSearchParams();
    queryParams.set("month", selectedMonth.label);
    queryParams.set("year", selectedYear.value);

    navigate(`?${queryParams.toString()}`, { replace: true });

    // Fetch targets on change
    getTargets(selectedMonth.label, selectedYear.value);
  }, [selectedMonth, selectedYear]);


  return (
    <>
      <div>

        <div className="mb-4 p-2">
          <p className="text-[#303F58] text-lg font-bold">Target</p>
        </div>

        <div className="flex flex-wrap gap-6 sm:gap-24 bg-[#FEFBF8] rounded-xl px-4 py-2 text-base font-bold border-b border-gray-200">
          {getVisibleTabs().map((tab) => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer py-2 px-4 sm:px-[16px] ${activeTab === tab
                ? "text-[#303F58] text-sm font-bold border-b-2 shadow-lg rounded-md border-[#97998E]"
                : "text-gray-400"
                }`}
            >
              {tab}
            </div>
          ))}

          {isButtonVisible && (
            <div className="flex justify-end sm:ml-auto w-full sm:w-auto">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  handleCreateTarget();
                  setEditId("");
                }}
              >
                <span className="font-bold text-xl">+</span> Create Target
              </Button>
            </div>
          )}
        </div>

        <div className="w-full p-2 h-fit bg-[#E3E6D5] my-4 rounded-2xl">
          <div className="flex flex-col sm:flex-row justify-between">
            <div className="flex items-center">
              <img src={Image} className="w-14 h-15" alt="" />
              <div className="ms-2 mt-1">
                <p className="text-lg font-semibold text-[#4B5C79]">Total Target</p>
                <p className="text-xs font-normal text-[#4B5C79]">Total License targets Should Achieve</p>
              </div>
            </div>

            <div className="p-2 text-lg font-semibold mt-4 sm:mt-0">
              <p className="text-[#820000] text-2xl font-bold">
                {activeTab === "Region"
                  ? allTargets?.totalRegionTarget
                  : activeTab === "Area"
                    ? allTargets?.totalAreaTarget
                    : allTargets?.totalBdaTarget}

              </p>
            </div>
          </div>
        </div>
        <div>

          <div className="flex gap-4 w-full sm:w-auto bg-white px-5 pt-3 rounded-xl">
            <h2 className="text-lg font-bold pt-2 sm:mb-0 w-[30%]">{activeTab}s Target</h2>

            <SearchBar
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              placeholder="Search..."
            />
            <div className="flex gap-2">
              {/* Year Select */}
              <SelectDropdown
                setSelectedValue={setSelectedYear}
                selectedValue={selectedYear}
                filteredData={years}
                searchPlaceholder="Search Years"
                width="w-full md:w-44"
              />

              {/* Month Select */}
              <SelectDropdown
                setSelectedValue={setSelectedMonth}
                selectedValue={selectedMonth}
                filteredData={months}
                searchPlaceholder="Search Months"
                width="w-full md:w-44"
              />
            </div>

          </div>
        </div>

        <div>
          <TargetTable
            data={filteredData}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}

            columns={
              activeTab === "Region"
                ? Regioncolumns
                : activeTab === "Area"
                  ? Areacolumns
                  : BDAcolumns
            }
            headerContents={{
            }}
            actionList={
              (user?.role === "Super Admin" && activeTab === "Region") ||
                (user?.role === "Region Manager" && activeTab === "Area") ||
                (user?.role === "Area Manager" && activeTab === "BDA")
                ? [
                  { label: "edit", function: handleEdit },
                  { label: "delete", function: openDeleteModal },
                ]
                : []
            }
            noAction={
              !(
                (user?.role === "Super Admin" && activeTab === "Region") ||
                (user?.role === "Region Manager" && activeTab === "Area") ||
                (user?.role === "Area Manager" && activeTab === "BDA")
              )
            }
            loading={loading}
          />
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        className="w-[35%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[50%]"
      >
        <TargetForm onClose={() => { setIsCreateModalOpen(false); getTargets(monthParam || selectedMonth.label, yearParam || selectedYear.value); }} editId={editId} type={modalType} />
      </Modal>
      <Modal open={isDeleteModalOpen} className="w-[30%] max-sm:w-[90%] max-md:w-[70%] max-lg:w-[50%]" onClose={closeDeleteModal}>
        <ConfirmModal
          action={handleDelete}
          prompt={
            activeTab === 'Region'
              ? 'Are you sure want to delete this Region Target?'
              : activeTab === 'Area'
                ? 'Are you sure want to delete this Area Target?'
                : 'Are you sure want to delete this Bda Target?'
          }
          onClose={closeDeleteModal}
        />
      </Modal>
    </>
  );
};

export default TargetHome;