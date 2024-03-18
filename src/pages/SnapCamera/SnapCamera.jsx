import React, { useEffect, useRef, useState } from "react";
// Import the necessary Camera Kit modules.
import {
  bootstrapCameraKit,
  CameraKitSession,
  createMediaStreamSource,
  Lens,
} from "@snap/camera-kit";

// Import Styles
import "../../index.css";
import "./SnapCamera.css";
let mediaStream;

const SnapCamera = () => {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  const liveRenderTarget = document.getElementById("canvas");
  const videoContainer = document.getElementById("video-container");
  const videoTarget = document.getElementById("video");
  const startRecordingButton = document.getElementById("start");
  const stopRecordingButton = document.getElementById("stop");
  const downloadButton = document.getElementById("download");

  const canvasRef = useRef(null);
  const apiToken =
    "eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzEwNzM2MTQzLCJzdWIiOiI5YTIwZDg0My1mMzMyLTRhMDEtOTA5OC0yZDk3OWRiZmNmNTB-U1RBR0lOR34wNjUzYmVmYi1lMmFlLTQ1Y2ItYmE4NC04ZjZiNzYyNzEyZWUifQ.I12hk9toGRbKuCHKHCosWvF4QQQvohb_wxNOCVFxbl8";
  const lensGroupId = "d63b3d4c-e03c-43ee-9477-e3970943eac7";

  useEffect(() => {
    const init = async () => {
      const cameraKit = await bootstrapCameraKit({ apiToken: apiToken });

      const session = await cameraKit.createSession();

      // Use the ref to get the canvas element
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.replaceWith(session.output.live);
      }
      const { lenses } = await cameraKit.lenses.repository.loadLensGroups([
        lensGroupId,
      ]);
      session.applyLens(lenses[0]);
      await setCameraKitSource(session);
    };

    init();
  }, []);

  const setCameraKitSource = async (session) => {
    if (mediaStream) {
      session.pause();
      mediaStream.getVideoTracks()[0].stop();
    }

    const source = await createMediaStreamSource(mediaStream, {
      cameraType: "back",
    });

    await session.setSource(source);
    // await session.setFPSLimit(60);

    // Set the render size of the CameraKit session to the size of the browser window.
    await session.source.setRenderSize(window.innerWidth, window.innerHeight);

    await session.play("live");
  };

  const bindRecorder = async () => {
    startRecordingButton.addEventListener("click", () => {
      startRecordingButton.disabled = true;
      stopRecordingButton.disabled = false;
      downloadButton.disabled = true;
      videoContainer.style.display = "none";

      const mediaStream = liveRenderTarget.captureStream(30);

      const recorder = new MediaRecorder(mediaStream);
      recorder.addEventListener("dataavailable", (event) => {
        if (!event.data.size) {
          console.warn("No recorded data available");
          return;
        }

        const blob = new Blob([event.data]);

        const url = window.URL.createObjectURL(blob);
        setDownloadUrl(url);
        downloadButton.disabled = false;

        videoTarget.src = url;
        videoContainer.style.display = "block";
      });

      recorder.start();
      setMediaRecorder(recorder);
    });

    stopRecordingButton.addEventListener("click", () => {
      startRecordingButton.disabled = false;
      stopRecordingButton.disabled = true;

      mediaRecorder?.stop();
    });

    downloadButton.addEventListener("click", () => {
      const link = document.createElement("a");

      link.setAttribute("style", "display: none");
      link.href = downloadUrl;
      link.download = "camera-kit-web-recording.webm";
      link.click();
      link.remove();
    });
  };

  useEffect(() => {
    bindRecorder();
  }, []);

  return (
    <div className="camera">
      <video ref={canvasRef}></video>
    </div>
  );
};

export default SnapCamera;
