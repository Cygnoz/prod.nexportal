import Modal from "../../components/modal/Modal";
import Button from "../../components/ui/Button";



type ConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({ open, onClose, onConfirm }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      className="rounded-lg p-8 w-[546px] h-[160px] text-[#303F58] space-y-8"
    >
      <p className="text-sm text-start">Are you sure you want to delete?</p>
      <div className="flex justify-end gap-2 mb-3">
        <Button
          onClick={onClose}
          variant="secondary"
          className="pl-8 pr-8 text-sm h-10"
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="primary"
          className="pl-8 pr-8 text-sm h-10"
        >
          Ok
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
