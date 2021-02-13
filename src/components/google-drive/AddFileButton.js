import React, { useState } from "react";
import ReactDOM from "react-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Form, Card } from "react-bootstrap";
import { storage, database } from "../../firebase";
import { ROOT_FOLDER } from "../../hooks/useFolder";
import { v4 as uuidV4 } from "uuid";
import { ProgressBar, Toast } from "react-bootstrap";
import CenteredName from "./CenteredName";
import { useHistory } from "react-router-dom";
import { Button } from "react-bootstrap";

export default function AddFileButton({ currentFolder }) {
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const { currentUser } = useAuth();
  const [name, setName] = React.useState("");
  const [status, setStatus] = React.useState(true);
  const [submit, setSubmit] = React.useState(true);
  const { logout } = useAuth();
  const [error, setError] = useState("");
  const history = useHistory();
  const toggle = () => {
    setStatus((state) => !state);
  };

  async function handleSuccessLogout() {
    await logout();
    history.push("/successfullysubmitted");
  }

  async function handleLogout() {
    setError("");

    try {
      await logout();
      history.push("/alreadysubmitted");
    } catch {
      setError("Failed to log out");
    }
  }

  function handleUpload(e) {
    const file = e.target.files[0];
    if (currentFolder == null || file == null) return;

    const id = uuidV4();
    setUploadingFiles((prevUploadingFiles) => [
      ...prevUploadingFiles,
      { id: id, name: file.name, progress: 0, error: false },
    ]);
    const filePath =
      currentFolder === ROOT_FOLDER
        ? `${currentFolder.path.join("/")}/${file.name}`
        : `${currentFolder.path.join("/")}/${currentFolder.name}/${file.name}`;

    const uploadTask = storage
      .ref(`/files/${currentUser.uid}/${filePath}`)
      .put(file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = snapshot.bytesTransferred / snapshot.totalBytes;
        setUploadingFiles((prevUploadingFiles) => {
          return prevUploadingFiles.map((uploadFile) => {
            if (uploadFile.id === id) {
              return { ...uploadFile, progress: progress };
            }

            return uploadFile;
          });
        });
      },
      () => {
        setUploadingFiles((prevUploadingFiles) => {
          return prevUploadingFiles.map((uploadFile) => {
            if (uploadFile.id === id) {
              return { ...uploadFile, error: true };
            }
            return uploadFile;
          });
        });
      },
      () => {
        setUploadingFiles((prevUploadingFiles) => {
          return prevUploadingFiles.filter((uploadFile) => {
            return uploadFile.id !== id;
          });
        });

        uploadTask.snapshot.ref.getDownloadURL().then((url) => {
          database.files
            .where("userId", "==", currentUser.uid)
            .where("folderId", "==", currentFolder.id)
            .get()
            .then((existingFiles) => {
              const existingFile = existingFiles.docs[0];
              if (existingFile) {
                handleLogout();
              } else {
                database.files.add({
                  studentName: name,
                  url: url,
                  name: file.name,
                  createdAt: database.getCurrentTimestamp(),
                  folderId: currentFolder.id,
                  userId: currentUser.uid,
                });
              }
            });
        });
      }
    );
    toggle();
  }

  return (
    <>
      {status ? (
        <div>
          <CenteredName>
            <Card>
              <Card.Body>
                <div>
                  <Form>
                    <Form.Group id="name">
                      <Form.Label>Enter your full Name</Form.Label>
                      <Form.Control
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        type="text"
                        required
                      />
                    </Form.Group>
                  </Form>
                </div>
              </Card.Body>
            </Card>
          </CenteredName>
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "60px 90px",
              borderWidth: 2,
              borderRadius: 2,
              borderColor: "#909191",
              borderStyle: "dashed",
              backgroundColor: "#fafafa",
              color: "#909191",
              outline: "none",
              transition: "border .24s ease-in-out",
              maxWidth: "100%",
              marginTop: "100px",
              cursor: "pointer",
            }}
          >
            Upload
            <input
              type="file"
              onChange={handleUpload}
              style={{ opacity: 0, left: "-9999px" }}
            />
          </label>
        </div>
      ) : null}

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <h4>Disclaimer yaha pe</h4>
      </div>

      {uploadingFiles.length > 0 &&
        ReactDOM.createPortal(
          <div
            style={{
              position: "absolute",
              bottom: "1rem",
              right: "1rem",
              maxWidth: "250px",
            }}
          >
            {uploadingFiles.map((file) => (
              <Toast
                key={file.id}
                onClose={() => {
                  setUploadingFiles((prevUploadingFiles) => {
                    return prevUploadingFiles.filter((uploadFile) => {
                      return uploadFile.id !== file.id;
                    });
                  });
                }}
              >
                <Toast.Header
                  closeButton={file.error}
                  className="text-truncate w-100 d-block"
                >
                  {file.name}
                </Toast.Header>
                <Toast.Body>
                  <ProgressBar
                    animated={!file.error}
                    variant={file.error ? "danger" : "primary"}
                    now={file.error ? 100 : file.progress * 100}
                    label={
                      file.error
                        ? "Error"
                        : `${Math.round(file.progress * 100)}%`
                    }
                  />
                </Toast.Body>
              </Toast>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
