import { useRef, useState, useEffect } from "react";
import "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import "./App.css";
import { drawHand } from "./utils/draw";
import * as fp from "fingerpose";
import victory from "./assets/victory.png";
import thumbs_up from "./assets/thumbs_up.png";
import up from "./assets/up.jpeg";
import right from "./assets/right.png";
import { dtConfig, config } from "./config/config";
function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [emoji, setEmoji] = useState(null);
  const images = {
    thumbs_up: thumbs_up,
    victory: victory,
    up: up,
    right: right,
  };

  useEffect(() => {
    const runHandpose = async () => {
      const net = await handpose.load(dtConfig);
      console.log("Handpose model loaded.");

      const detectHand = async () => {
        // Check data is available
        if (
          webcamRef.current &&
          webcamRef.current.video.readyState === 4 &&
          canvasRef.current
        ) {
          // Get Video Properties
          const video = webcamRef.current.video;
          const canvas = canvasRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          // Make Detections
          const hand = await net.estimateHands(video);

          ///////// NEW STUFF ADDED GESTURE HANDLING

          if (hand.length > 0) {
            const GE = new fp.GestureEstimator([
              fp.Gestures.VictoryGesture,
              fp.Gestures.ThumbsUpGesture,
            ]);
            const gesture = await GE.estimate(hand[0].landmarks, 4);
            if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
              const confidence = gesture.gestures.map(
                (prediction) => prediction.score
              );
              const maxConfidence = confidence.indexOf(
                Math.max.apply(null, confidence)
              );
              setEmoji(gesture.gestures[maxConfidence].name);
            }
          }

          ///////// NEW STUFF ADDED GESTURE HANDLING

          // Draw mesh
          const ctx = canvas.getContext("2d");
          drawHand(hand, ctx);
        }

        // Tekrar bir sonraki çerçeveye geçmeden önce RAF ile el algılama işlemini tekrar çağır
        requestAnimationFrame(detectHand);
      };

      // İlk el algılama işlemi başlat
      detectHand();
    };

    runHandpose();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <Webcam ref={webcamRef} videoConstraints={config} />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />
        {/* NEW STUFF */}
        {emoji !== null ? (
          <img
            src={images[emoji]}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              right: 0,
              textAlign: "center",
              height: 100,
            }}
          />
        ) : (
          ""
        )}

        {/* NEW STUFF */}
      </header>
    </div>
  );
}

export default App;
