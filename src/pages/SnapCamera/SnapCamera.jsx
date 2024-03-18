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

    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 4096 },
        height: { ideal: 2160 },
        facingMode: "environment",
      },
    });

    const source = await createMediaStreamSource(mediaStream, {
      cameraType: "back",
    });

    await session.setSource(source);

    session.play();
  };

  return (
    <div className="container" style={{ width: "100vw", height: "100vh" }}>
      <canvas ref={canvasRef} className="canvas-container"></canvas>
    </div>
  );
};

export default SnapCamera;
