import { useEffect, useState } from "react";
import Notebook from "../../../../assets/icons/Notebook";
import PencilLine from "../../../../assets/icons/PencilLine";
import Trash from "../../../../assets/icons/Trash";
import Button from "../../../../components/ui/Button";
import Modal from "../../../../components/modal/Modal";
import NotesForm from "../ViewModals/NotesForm";
import SearchBar from "../../../../components/ui/SearchBar";
import useApi from "../../../../Hooks/useApi";
import { useParams } from "react-router-dom";
import { endPoints } from "../../../../services/apiEndpoints";
import DOMPurify from "dompurify";
import toast from "react-hot-toast";
import ConfirmModal from "../../../../components/modal/ConfirmModal";
import NoRecords from "../../../../components/ui/NoRecords";

// Skeleton loader for notes
const SkeletonNote = () => (
  <div className="bg-[#FAFAFA] w-full h-fit rounded-xl my-5 p-5 animate-pulse">
    <div className="flex justify-between">
      <div className="flex gap-3">
        <div className="bg-[#F3E6E6] rounded-full size-8 px-2 py-2">
          <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
        </div>
        <div className="w-36 h-5 bg-gray-300 rounded"></div>
      </div>
      <div className="w-28 h-4 bg-gray-300 rounded"></div>
    </div>
    <div className="flex justify-between mt-4">
      <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
      <div className="flex gap-4">
        <div className="w-12 h-4 bg-gray-300 rounded"></div>
        <div className="w-12 h-4 bg-gray-300 rounded"></div>
      </div>
    </div>
  </div>
);

const Notes = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState<string>("");
  const [noteData, setNoteData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // Loading state for skeleton

  const { request: getLeadNote } = useApi("get", 3001);
  const { request: deleteLead } = useApi("delete", 3001);
  const { id: leadId } = useParams();

  // Fetch Notes
  const getNotes = async () => {
    setLoading(true); // Start loading
    try {
      const { response, error } = await getLeadNote(`${endPoints.GET_ALL_LEAD_ACTIVITIES}/${leadId}`);
      if (response && !error) {
        const taskActivities = response.data.activities
          .filter((activity: any) => activity?.activityType === "Note")
          .reverse();
        setNoteData(taskActivities);
      } else {
        console.error("API Error:", error.response?.data?.message);
      }
    } catch (err) {
      console.error("Error fetching notes:", err);
    } finally {
      setLoading(false); // End loading
    }
  };

  useEffect(() => {
    getNotes();
  }, []);

  // Refresh Notes After Adding/Editing
  const handleNoteAdded = () => {
    setIsModalOpen(false); // Close modal after adding/editing
    getNotes(); // Fetch updated notes
  };

  // Filter notes based on search input
  const filteredNotes = noteData.filter((note) =>
    note.relatedTo?.toLowerCase().includes(searchValue.toLowerCase()) ||
    note.note?.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Toggle Edit Modal
  const handleModalToggle = (editId?: string) => {
    setIsModalOpen((prev) => !prev);
    setEditId(editId || null);
  };

  // Toggle Delete Confirmation Modal
  const deleteModalToggle = (noteId?: string) => {
    setDeleteOpen((prev) => !prev);
    if (noteId) {
      setDeleteId(noteId);
    }
  };


  // Handle Delete Function
  const handleDelete = async () => {
    if (!deleteId) {
      toast.error("No note selected for deletion.");
      return;
    }

    try {
      const { response, error } = await deleteLead(`${endPoints.LEAD_ACTIVITY}/${deleteId}`);
      if (response) {
        toast.success(response.data.message);
        setNoteData((prevNotes) => prevNotes.filter((note) => note._id !== deleteId));
        setDeleteOpen(false);
      } else {
        console.error("Delete Failed:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message || "Failed to delete the note.");
      }
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error("Failed to delete the note.");
    }
  };

  return (
    <div>
      <div className="w-full h-fit rounded-lg p-5 gap-5 bg-[#FFFFFF]">
        <div className="flex justify-between gap-4">
          <div className="flex gap-6">
            <p className="text-[#303F58] text-sm font-bold p-2">Notes</p>
            <SearchBar
              placeholder="Search"
              searchValue={searchValue}
              onSearchChange={setSearchValue}
            />
          </div>
          <Button
            onClick={() => handleModalToggle("")}
            className="text-[#565148] text-base rounded-lg w-fit h-9 bg-[#FEFDFA] border-[#565148]"
            variant="secondary"
          >
            +<span className="text-xs">Add Notes</span>
          </Button>
        </div>

        {/* Show Skeleton Loader while loading */}
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => <SkeletonNote key={index} />)
        ) : filteredNotes.length === 0 ? (
          <NoRecords text="No Notes Found" parentHeight="200px" imgSize={90} textSize="md" />
        ) : (
          filteredNotes.map((note) => (
            <div className="bg-[#FAFAFA] w-full h-fit rounded-xl my-5" key={note._id}>
              <div className="flex justify-between p-5">
                <div className="flex gap-3">
                  <div className="bg-[#F3E6E6] rounded-full size-8 px-2 py-2">
                    <Notebook color="#820000" size={18} />
                  </div>
                  <p className="mt-1 text-[#303F58] text-xs font-semibold">{note?.relatedTo}</p>
                </div>
                <div className="text-[#4B5C79] text-xs font-semibold">
                  {new Date(note?.updatedAt).toLocaleString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </div>
              </div>
              <div className="flex justify-between p-5">
                <div
                  className="flex gap-4 ms-2 text-xs font-normal bg-[#FFFFFF] w-[680px] p-1 rounded"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(note?.note || ""),
                  }}
                />
                <div className="flex gap-4">
                  <div className="cursor-pointer" onClick={() => handleModalToggle(note?._id)}>
                    <PencilLine color="#303F58" size={16} />
                    <p className="text-[#303F58] text-xs font-normal mt-1">Edit</p>
                  </div>
                  <div className="cursor-pointer" onClick={() => deleteModalToggle(note?._id)}>
                    <Trash color="#303F58" size={16} />
                    <p className="text-[#303F58] text-xs font-normal mt-1 -ml-2">Delete</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal className="w-[45%] max-sm:w-[90%] max-md:w-[70%] " open={isModalOpen} onClose={handleModalToggle}>
        <NotesForm editId={editId} onClose={handleNoteAdded} />
      </Modal>

      <Modal open={deleteOpen} align="center" onClose={() => deleteModalToggle()} className="w-[30%]">
        <ConfirmModal
          action={handleDelete}
          prompt="Are you sure want to delete this note?"
          onClose={() => deleteModalToggle()}
        />
      </Modal>
    </div>
  );
};

export default Notes;
