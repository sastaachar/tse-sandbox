import React, { createContext, useContext, useState, useRef } from "react";
import ReactJson from "react-json-view";
import Modal from "react-modal";

// Create Context for Modal
const ModalContext = createContext({
  isOpen: false,
  modalContent: "" as string | React.FC,
  openModal: () => {},
  closeModal: () => {},
  setModalContent: (content: string | React.FC) => {},
  showModalContent: (
    content: string | React.FC | object,
    onCloseListener?: Function,
    isJson?: boolean
  ) => {},
});

export const useGlobalModal = () => {
  return useContext(ModalContext);
};

// Modal Provider Component
export const ModalProvider = (props: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState<string | React.FC>("");
  const [isJson, setIsJson] = useState(false);
  const onCloseListeners = useRef<Array<() => void>>([]);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    onCloseListeners.current.forEach((listner) => {
      try {
        listner?.();
      } catch (e) {}
    });
    onCloseListeners.current = [];
    setIsOpen(false);
  };

  const showModalContent = (
    content: string | React.FC,
    onCloseListener?: () => void,
    isJson: boolean = false
  ) => {
    if (onCloseListener) onCloseListeners.current.push(onCloseListener);
    setModalContent(content);
    setIsJson(isJson);
    setIsOpen(true);
  };

  return (
    <ModalContext.Provider
      value={{
        isOpen,
        openModal,
        closeModal,
        modalContent,
        setModalContent,
        showModalContent,
      }}
    >
      {props.children}
      <Modal
        isOpen={isOpen}
        onRequestClose={closeModal}
        style={{
          content: {
            padding: "40px",
          },
        }}
      >
        <>
          <button
            onClick={closeModal}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: "transparent",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: "#333",
            }}
          >
            &times;
          </button>
          {typeof modalContent === "string" &&
            (isJson ? (
              <ReactJson
                src={JSON.parse(modalContent)}
                iconStyle="triangle"
                enableClipboard={true}
                theme="monokai"
                indentWidth={4}
              />
            ) : (
              <code>{modalContent}</code>
            ))}
          {typeof modalContent !== "string" && modalContent}
        </>
      </Modal>
    </ModalContext.Provider>
  );
};
