import React, { useEffect, useState, useRef, useCallback } from 'react';

function WebSocketImageViewer({
  wsUrl,
  width = '100%',
  maxFps = 30,
  showStats = false,
  imageQuality = 0.8,
  area_points ,
  onChange = () => { }
}) {
  console.log(area_points);
  
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const ws = useRef(null);
  const imageRef = useRef(new Image());
  const frameQueueRef = useRef([]);
  const lastFrameTimeRef = useRef(0);
  const statsRef = useRef({ fps: 0, frameCount: 0, queueSize: 0, lastUpdate: Date.now() });
  const animationRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isTabActive, setIsTabActive] = useState(true);

  // State for snapshot and region selection
  const [snapshot, setSnapshot] = useState(null);
  const [snapshotDimensions, setSnapshotDimensions] = useState({ width: 0, height: 0 });
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [regionA, setRegionA] = useState(null);
  const [regionB, setRegionB] = useState(null);
  const [selectionStep, setSelectionStep] = useState(0);
  const [tempPoints, setTempPoints] = useState([]);
  const drawingCanvasRef = useRef(null);
  const snapshotImageRef = useRef(null);

  // Detect if tab is active

  function validateAreaPoints(area_points) {
    // تحقق أن area_points هو كائن (object) وليس null أو مصفوفة
    if (typeof area_points !== 'object' || area_points === null || Array.isArray(area_points)) {
        return false;
    }

    // تحقق وجود المفاتيح area1 و area2
    for (const key of ['area1', 'area2']) {
        if (!(key in area_points)) {
            return false;
        }

        const arr = area_points[key];
        // تحقق أن القيمة هي مصفوفة وبها 4 عناصر
        if (!Array.isArray(arr) || arr.length !== 4) {
            return false;
        }

        // تحقق من كل عنصر في المصفوفة
        for (const item of arr) {
            if (typeof item !== 'object' || item === null || Array.isArray(item)) {
                return false;
            }
            if (!('x' in item) || !('y' in item)) {
                return false;
            }
            if (typeof item.x !== 'number' || typeof item.y !== 'number') {
                return false;
            }
        }
    }

    return true;
}
useEffect(() => {
  if (validateAreaPoints(area_points)) {
    setRegionA(area_points["area1"])
    setRegionB(area_points["area2"])
  }
  console.log(area_points);
  
} , [])

  useEffect(() => {
    
    const handleVisibilityChange = () => {
      setIsTabActive(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', () => setIsTabActive(true));
    window.addEventListener('blur', () => setIsTabActive(false));

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', () => setIsTabActive(true));
      window.removeEventListener('blur', () => setIsTabActive(false));
    };
  }, []);
console.log(containerSize);

  // Update container size
  const updateContainerSize = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = Math.floor(containerWidth * 9 / 16);
      setContainerSize({ width: containerWidth, height: containerHeight });

      if (canvasRef.current) {
        canvasRef.current.width = containerWidth;
        canvasRef.current.height = containerHeight;
        console.log(canvasRef.current.width);
        console.log(canvasRef.current.height);
      }

      if (drawingCanvasRef.current) {
        drawingCanvasRef.current.width = containerWidth;
        drawingCanvasRef.current.height = containerHeight;
        console.log(drawingCanvasRef.current.width);
        console.log(drawingCanvasRef.current.height);
      }
      
    }
  }, []);

  // Monitor container size changes
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      updateContainerSize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
      updateContainerSize();
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateContainerSize]);

  // Cleanup
  const cleanup = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    frameQueueRef.current.forEach(frame => URL.revokeObjectURL(frame));
    frameQueueRef.current = [];

    setIsConnected(false);
  }, []);

  // Take snapshot function
  const takeSnapshot = useCallback(() => {
    if (canvasRef.current) {
      const dataURL = canvasRef.current.toDataURL('image/jpeg', imageQuality);
      setSnapshot(dataURL);
      setSnapshotDimensions({
        width: canvasRef.current.width,
        height: canvasRef.current.height
      });

      // Reset selection when taking a new snapshot
      setSelectedRegion(null);
      // setRegionA(null);
      // setRegionB(null);
      setSelectionStep(0);
      setTempPoints([]);
    }
  }, [imageQuality]);

  // Get mouse position relative to canvas as percentage
  const getMousePos = useCallback((canvas, e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Convert to percentage of canvas dimensions
    const xPercent = (x / canvas.width) * 100;
    const yPercent = (y / canvas.height) * 100;

    return {
      x: xPercent,
      y: yPercent,
      pixelX: x,
      pixelY: y
    };
  }, []);

  // Convert percentage coordinates to pixel coordinates for drawing
  const percentToPixels = useCallback((point, canvas) => {
    return {
      x: (point.x / 100) * canvas.width,
      y: (point.y / 100) * canvas.height
    };
  }, []);

  // Handle mouse events for region selection
  const handleMouseDown = useCallback((e) => {
    if (!snapshot || selectionStep === 0) return;

    const canvas = drawingCanvasRef.current;
    if (!canvas) return;

    const mousePos = getMousePos(canvas, e);

    if (tempPoints.length < 4) {
      setTempPoints([...tempPoints, { x: mousePos.x, y: mousePos.y }]);
    }
  }, [snapshot, selectionStep, tempPoints, getMousePos]);
  useEffect(() => {
    if(regionA instanceof Array && regionB instanceof Array ){
      if(regionA.length == 4 && regionB.length == 4){
        onChange(
          {
            area1 : regionA,
            area2 : regionB
          }
        )
      }
    }
  } , [regionA , regionB])
  // Complete region selection
  useEffect(() => {
    if (tempPoints.length === 4) {
      if (selectionStep === 1) {
        setRegionA([...tempPoints]);
        setTempPoints([]);
        setSelectionStep(0);
        setIsSelecting(false);
      } else if (selectionStep === 2) {
        setRegionB([...tempPoints]);
        setTempPoints([]);
        setSelectionStep(0);
        setIsSelecting(false);
      }
    }
  }, [tempPoints, selectionStep]);

  // Draw regions on the drawing canvas
  const drawRegions = useCallback(() => {
    if (!drawingCanvasRef.current) return;

    const ctx = drawingCanvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);

    // Draw region A
    if (regionA && regionA.length === 4) {
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const firstPoint = percentToPixels(regionA[0], drawingCanvasRef.current);
      ctx.moveTo(firstPoint.x, firstPoint.y);

      for (let i = 1; i < 4; i++) {
        const point = percentToPixels(regionA[i], drawingCanvasRef.current);
        ctx.lineTo(point.x, point.y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
      ctx.fill();

      // Label region A
      ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.font = '14px Arial';
      ctx.fillText('المنطقة A', firstPoint.x + 5, firstPoint.y - 5);
    }

    // Draw region B
    if (regionB && regionB.length === 4) {
      ctx.strokeStyle = 'rgba(0, 0, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const firstPoint = percentToPixels(regionB[0], drawingCanvasRef.current);
      ctx.moveTo(firstPoint.x, firstPoint.y);

      for (let i = 1; i < 4; i++) {
        const point = percentToPixels(regionB[i], drawingCanvasRef.current);
        ctx.lineTo(point.x, point.y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = 'rgba(0, 0, 255, 0.2)';
      ctx.fill();

      // Label region B
      ctx.fillStyle = 'rgba(0, 0, 255, 0.8)';
      ctx.font = '14px Arial';
      ctx.fillText('المنطقة B', firstPoint.x + 5, firstPoint.y - 5);
    }

    // Draw temporary points during selection
    if (tempPoints.length > 0) {
      ctx.strokeStyle = selectionStep === 1 ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 0, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      // Draw the incomplete polygon
      if (tempPoints.length > 1) {
        ctx.beginPath();
        const firstPoint = percentToPixels(tempPoints[0], drawingCanvasRef.current);
        ctx.moveTo(firstPoint.x, firstPoint.y);

        for (let i = 1; i < tempPoints.length; i++) {
          const point = percentToPixels(tempPoints[i], drawingCanvasRef.current);
          ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
      }

      // Draw the points
      tempPoints.forEach((point, index) => {
        const pixelPoint = percentToPixels(point, drawingCanvasRef.current);
        ctx.beginPath();
        ctx.arc(pixelPoint.x, pixelPoint.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = selectionStep === 1 ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 0, 255, 0.8)';
        ctx.fill();
        ctx.stroke();

        // Number the points
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText((index + 1).toString(), pixelPoint.x - 3, pixelPoint.y + 3);
      });

      ctx.setLineDash([]);

      // Draw instructions
      if (tempPoints.length < 4) {
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText(`Click point ${tempPoints.length + 1} of 4`, 10, 30);
      }
    }
  }, [regionA, regionB, tempPoints, selectionStep, percentToPixels]);

  // Draw regions whenever they change
  useEffect(() => {
    drawRegions();
  }, [drawRegions]);

  // Start region selection
  const startRegionSelection = (region) => {
    if (!snapshot) return;

    if (region === 'A') {
      setSelectionStep(1);
      setTempPoints([]);
      setIsSelecting(true);
    } else if (region === 'B') {
      setSelectionStep(2);
      setTempPoints([]);
      setIsSelecting(true);
    }
  };

  // Clear regions
  const clearRegions = () => {
    setRegionA(null);
    setRegionB(null);
    setTempPoints([]);
    setSelectionStep(0);
    setIsSelecting(false);

    if (drawingCanvasRef.current) {
      const ctx = drawingCanvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
    }
  };

  // Render frame
  const renderFrame = useCallback(() => {
    if (!isTabActive) {
      animationRef.current = requestAnimationFrame(renderFrame);
      return;
    }

    const now = Date.now();
    const canvas = canvasRef.current;

    if (!canvas) {
      animationRef.current = requestAnimationFrame(renderFrame);
      return;
    }

    const ctx = canvas.getContext('2d');
    const queue = frameQueueRef.current;

    // Calculate FPS
    if (showStats) {
      statsRef.current.frameCount++;
      if (now - statsRef.current.lastUpdate >= 1000) {
        statsRef.current.fps = statsRef.current.frameCount;
        statsRef.current.frameCount = 0;
        statsRef.current.lastUpdate = now;
      }
      statsRef.current.queueSize = queue.length;
    }

    const minFrameTime = 1000 / maxFps;
    const shouldRender = queue.length > 0 &&
      (now - lastFrameTimeRef.current >= minFrameTime);

    if (shouldRender) {
      const frame = queue.shift();

      if (imageRef.current.src) {
        URL.revokeObjectURL(imageRef.current.src);
      }

      imageRef.current.onload = function () {
        this.decode().then(() => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
          lastFrameTimeRef.current = now;
        }).catch(console.error);
      };

      imageRef.current.onerror = () => console.error("Failed to load image frame");
      imageRef.current.src = frame;
    }

    animationRef.current = requestAnimationFrame(renderFrame);
  }, [maxFps, showStats, isTabActive]);

  // WebSocket connection
  useEffect(() => {
    if (!wsUrl) return;

    let heartbeatInterval;

    ws.current = new WebSocket(wsUrl);
    ws.current.binaryType = 'blob';

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);

      heartbeatInterval = setInterval(() => {
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({ type: 'heartbeat' }));
        }
      }, 30000);

      if (!animationRef.current) {
        animationRef.current = requestAnimationFrame(renderFrame);
      }
    };

    ws.current.onmessage = (event) => {
      if (typeof event.data === 'string' && event.data.includes('heartbeat')) {
        return;
      }

      const blob = event.data;
      const url = URL.createObjectURL(blob);

      if (frameQueueRef.current.length >= 5) {
        const oldFrame = frameQueueRef.current.shift();
        URL.revokeObjectURL(oldFrame);
      }
      frameQueueRef.current.push(url);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      if (heartbeatInterval) clearInterval(heartbeatInterval);
    };

    return () => {
      cleanup();
      if (heartbeatInterval) clearInterval(heartbeatInterval);
    };
  }, [wsUrl, renderFrame, cleanup]);

  return (
    <div className="relative rounded-xl overflow-hidden bg-gray-800 p-4" style={{ width }}>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Video stream panel */}
        <div className="flex-1">
          <h3 className="text-white mb-2 text-center">البث المباشر</h3>
          <div
            ref={containerRef}
            className='relative rounded-xl overflow-hidden'
            style={{ width: '100%', height: containerSize.height }}
          >
            <canvas
              ref={canvasRef}
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#222',
                display: 'block'
              }}
            />

            {showStats && (
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '5px',
                fontSize: '12px',
                fontFamily: 'monospace',
                zIndex: 10
              }}>
                FPS: {statsRef.current.fps} | Queue: {statsRef.current.queueSize} | {isTabActive ? 'Active' : 'Inactive'}
              </div>
            )}

            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              backgroundColor: isConnected ? 'rgba(0, 200, 0, 0.7)' : 'rgba(200, 0, 0, 0.7)',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '5px',
              fontSize: '12px',
              zIndex: 10
            }}>
              {isConnected ? 'متصل' : 'غير متصل'}
            </div>

            {!isConnected && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'white',
                fontSize: '16px',
                textAlign: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                padding: '10px 20px',
                borderRadius: '5px'
              }}>
                انتظار الاتصال....
              </div>
            )}
          </div>

          <div className="flex justify-center mt-2 space-x-2">
            <button
              onClick={takeSnapshot}
              disabled={!isConnected}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              اخذ لقطة للشاشة
            </button>
          </div>
        </div>

        {/* Snapshot and region selection panel */}
        <div className="flex-1">
          <h3 className="text-white mb-2 text-center">لقطة شاشة و تعريف المناطق</h3>

          {snapshot ? (
            <div className="relative rounded-xl overflow-hidden bg-gray-900" style={{ height: containerSize.height }}>
              <img
                ref={snapshotImageRef}
                src={snapshot}
                alt="Snapshot"
                className="w-full h-full object-contain"
              />

              {/* Drawing canvas for snapshot */}
              <canvas
                ref={drawingCanvasRef}
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  width: '100%',
                  height: '100%',
                  pointerEvents: isSelecting ? 'auto' : 'none'
                }}
                onMouseDown={handleMouseDown}
              />

              <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white p-2 rounded-md text-sm">
                {selectionStep === 1 && "اختر اربعة نقاط لتعريف المنطقة A"}
                {selectionStep === 2 && "اختر اربعة نقاط لتعريف المنطقة B"}
                {!isSelecting && regionA && regionB && "المناطق معرفة"}
                {!isSelecting && !regionA && !regionB && "لا توجد مناطق معرفة"}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-xl bg-gray-900" style={{ height: containerSize.height }}>
              <p className="text-gray-400">خذ لقطة حتى تتمكن من تعريف المناطق</p>
            </div>
          )}

          <div className="flex flex-wrap justify-center mt-2 space-x-2">
            <button
              onClick={() => startRegionSelection('A')}
              disabled={!snapshot || isSelecting}
              className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed mt-2"
            >
              {regionA ? 'اعادة تعريف المنطقة A' : 'تعريف المنظقة A'}
            </button>

            <button
              onClick={() => startRegionSelection('B')}
              disabled={!snapshot || isSelecting}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed mt-2"
            >
              {regionB ? 'اعادة تعريف المنطقة B' : 'تعريف المنطقة B'}
            </button>

            <button
              onClick={clearRegions}
              disabled={!regionA && !regionB}
              className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed mt-2"
            >
              حذف المناطق
            </button>
          </div>

          {(regionA || regionB) && (
            <div className="mt-4 p-3 bg-gray-900 rounded-md">
              <h4 className="text-white text-center mb-2">المناطق المعرفة (Percentage Coordinates)</h4>
              <div className="relative flex gap-4 justify-end">


                {regionB && (
                  <div className='relative flex flex-col items-end '>
                    <p className="text-blue-400 ">المنطقة B:</p>
                    <div className="text-gray-300 text-sm  flex flex-col items-end ">
                      {regionB.map((point, index) => (
                        <div key={index}>
                          النقطة {index + 1}: ({point.x.toFixed(2)}%, {point.y.toFixed(2)}%)
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {regionA && (
                  <div className="mb-2  flex flex-col items-end">
                    <p className="text-red-400">المنطقة A:</p>
                    <div className="text-gray-300 text-sm flex flex-col items-end ">
                      {regionA.map((point, index) => (
                        <div key={index}>
                          النقطة {index + 1}: ({point.x.toFixed(2)}%, {point.y.toFixed(2)}%)
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(WebSocketImageViewer);