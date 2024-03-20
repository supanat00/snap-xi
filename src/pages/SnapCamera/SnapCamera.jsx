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

import Info from "../../assets/info.png";
import costume from "../../assets/costume.png";
import HandGes from "../../assets/HandGes.png";
import play from "../../assets/play.png";
import summon from "../../assets/summon.png";
import dance from "../../assets/ToDance.png";
import punch from "../../assets/ToPunch.png";
import twirl from "../../assets/twirl.png";

let mediaStream;

const SnapCamera = () => {
  const [showInfo, setShowInfo] = useState(false);

  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

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
        facingMode: "environment",
      },
    });

    const source = await createMediaStreamSource(mediaStream, {
      cameraType: "back",
    });

    await session.setSource(source);
    await session.setFPSLimit(60);

    // Set the render size of the CameraKit session to the size of the browser window.
    await session.source.setRenderSize(window.innerWidth, window.innerHeight);

    await session.play("live");
  };

  return (
    <div className="camera" style={{ position: "relative" }}>
      {/* สร้างปุ่ม */}
      <button
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          padding: 0,
          border: "none",
          background: "none",
          margin: "10px", // เพิ่มระยะห่างจากขอบจอ
          width: "50px",
          height: "50px",
        }}
        onClick={toggleInfo}
      >
        {/* ใส่รูปภาพแทนไอคอน */}
        <img src={Info} alt="Info" style={{ width: "60px", height: "60px" }} />
      </button>
      <video ref={canvasRef}></video>

      {/* หน้าต่างคำแนะนำ */}
      {showInfo && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",

            border: "none",
            background: "none",
            zIndex: "999",
          }}
        >
          <img src={HandGes} alt="Info" style={{ width: "500px" }} />
          <button onClick={toggleInfo}>ปิด</button>
        </div>
      )}
    </div>
  );
};

export default SnapCamera;
