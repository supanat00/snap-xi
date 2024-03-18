import React, { useEffect, useRef } from "react";
import {
  bootstrapCameraKit,
  CameraKitSession,
  createMediaStreamSource,
  Transform2D,
  Lens,
} from "@snap/camera-kit";
import "./SnapCamera.css";
let mediaStream;

const SnapCamera = () => {
  const canvasRef = useRef(null);
  const apiToken =
    "eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzEwNzM2MTQzLCJzdWIiOiI5YTIwZDg0My1mMzMyLTRhMDEtOTA5OC0yZDk3OWRiZmNmNTB-U1RBR0lOR34wNjUzYmVmYi1lMmFlLTQ1Y2ItYmE4NC04ZjZiNzYyNzEyZWUifQ.I12hk9toGRbKuCHKHCosWvF4QQQvohb_wxNOCVFxbl8";
  const lensGroupId = "d63b3d4c-e03c-43ee-9477-e3970943eac7";
  const cameraSelectRef = useRef(null);
  const lensSelectRef = useRef(null);

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
      await attachCamerasToSelect(session);
      console.log("attachCamerasToSelect is called");
      await attachLensesToSelect(lenses, session);
      console.log("attachLensesToSelect is called");
    };

    init();
  }, []);

  const setCameraKitSource = async (session, deviceId) => {
    if (mediaStream) {
      session.pause();
      mediaStream.getVideoTracks()[0].stop();
    }

    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId },
    });

    const source = createMediaStreamSource(mediaStream, { cameraType: "back" });

    await session.setSource(source);

    // source.setTransform(Transform2D.MirrorX);

    session.play();
  };

  const attachCamerasToSelect = async (session) => {
    cameraSelectRef.current.innerHTML = "";
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(({ kind }) => kind === "videoinput");

    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.text = camera.label;
      cameraSelectRef.current.appendChild(option);
    });

    cameraSelectRef.current.addEventListener("change", (event) => {
      const deviceId = event.target.selectedOptions[2].value;
      setCameraKitSource(session, deviceId);
    });
  };

  const attachLensesToSelect = async (lenses, session) => {
    lensSelectRef.current.innerHTML = "";
    lenses.forEach((lens) => {
      const option = document.createElement("option");
      option.value = lens.id;
      option.text = lens.name;
      lensSelectRef.current.appendChild(option);
    });

    lensSelectRef.current.addEventListener("change", (event) => {
      const lensId = event.target.selectedOptions[0].value;
      const lens = lenses.find((lens) => lens.id === lensId);
      if (lens) session.applyLens(lens);
    });
  };

  return (
    <div className="container">
      <canvas
        ref={canvasRef}
        id="canvas-container"
        width="1920"
        height="1080"
      ></canvas>
      <div className="footer">
        {/* <select ref={cameraSelectRef} className="styled-select"></select> */}
        <select ref={lensSelectRef} className="styled-select"></select>
      </div>
    </div>
  );
};

export default SnapCamera;
