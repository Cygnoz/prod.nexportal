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

type TabType = "Region" | "Area" | "Bda";

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
  const { user } = useUser();

  const tabs: TabType[] = ["Region", "Area", "Bda"];

  const getVisibleTabs = (): TabType[] => {
    switch (user?.role) {
      case "Super Admin":
        return tabs;
      case "Region Manager":
        return tabs.filter((tab) => tab !== "Region");
      case "Area Manager":
        return tabs.filter((tab) => tab === "Bda");
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
        return "Bda";
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
    getTargets();
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

  const getTargets = async () => {
    try {
      setLoading(true);
      const endpoint = `${endPoints.TARGET}`;
      const { response, error } = await getAllTarget(endpoint);
      if (response && !error) {
        setAllTargets(response.data);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTargets();
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
    if (user?.role === "Area Manager" && activeTab === "Bda") return true;
    return false;
  })();

  const getDataByActiveTab = (tab: any) => {
    switch (tab) {
      case "Region":
        return allTargets?.region || [];
      case "Area":
        return allTargets?.area ?? [];  // Use `?? []` to handle null values
      case "Bda":
        return allTargets?.bda ?? [];
      default:
        return [];
    }
  };
  
  const data = getDataByActiveTab(activeTab);

  console.log("data",data);
  
  console.log("API Response:", allTargets);

  return (
    <>
      <div>
        <div className="mb-4 p-2">
          <p className="text-[#303F58] text-lg font-bold">Target</p>
        </div>
        <div className="flex gap-24 bg-[#FEFBF8] rounded-xl px-4 py-2 text-base font-bold border-b border-gray-200">
          {getVisibleTabs().map((tab) => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer py-2 px-[16px] ${activeTab === tab
                  ? "text-[#303F58] text-sm font-bold border-b-2 shadow-lg rounded-md border-[#97998E]"
                  : "text-gray-400"
                }`}
            >
              {tab}
            </div>
          ))}

          {isButtonVisible && (
            <div className="flex justify-end ml-auto">
              <Button variant="primary" size="sm" onClick={() => {
                handleCreateTarget();
                setEditId('');
              }}>
                <span className="font-bold text-xl">+</span> Create Target
              </Button>
            </div>
          )}
        </div>

        <div className="w-full p-4 h-fit bg-[#E3E6D5] my-4 rounded-2xl">
          <div className="flex justify-between">
            <div className="flex">
              <div>
                <img src={Image} className="w-14 h-15" alt="" />
              </div>
              <div className="gap-4 ms-1 mt-1">
                <p className="text-lg font-semibold text-[#4B5C79]">Total Target</p>
                <p className="text-xs font-normal text-[#4B5C79]">
                  Total License targets Should Achieve
                </p>
              </div>
            </div>
            <div className="p-2 text-lg font-semibold">
              <p className="text-[#820000] text-2xl font-bold">
                {
                  activeTab === "Region"
                    ? allTargets?.totalRegionTarget
                    : activeTab === "Area"
                      ? allTargets?.totalAreaTarget
                      : allTargets?.totalBdaTarget}
              </p>
            </div>
          </div>
        </div>

        <div>
          <TargetTable
            data={data}
            columns={
              activeTab === "Region"
                ? Regioncolumns
                : activeTab === "Area"
                  ? Areacolumns
                  : BDAcolumns
            }
            headerContents={{
              title: activeTab + "'s Target",
              search: { placeholder: "Search..." },
              sort: [
                {
                  sortHead: "Sort by Month and Year",
                  sortList: [
                    { label: "Month", icon: <span></span>, action: () => { } },
                    { label: "Year", icon: <span></span>, action: () => { } },
                  ],
                },
              ],
            }}
            actionList={
              (user?.role === "Super Admin" && activeTab === "Region") ||
                (user?.role === "Region Manager" && activeTab === "Area") ||
                (user?.role === "Area Manager" && activeTab === "Bda")
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
                (user?.role === "Area Manager" && activeTab === "Bda")
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
        className="w-[35%]"
      >
        <TargetForm onClose={() => { setIsCreateModalOpen(false); getTargets(); }} editId={editId} type={modalType} />
      </Modal>
      <Modal open={isDeleteModalOpen} className="w-[30%]" onClose={closeDeleteModal}>
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