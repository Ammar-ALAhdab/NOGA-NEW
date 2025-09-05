import React, { useEffect, useState, useRef, useCallback } from 'react';

function WebSocketImageViewer({ 
  wsUrl, 
  width = '100%', 
  maxFps = 30,
  showStats = false,
  imageQuality = 0.8
}) {
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

  // اكتشاف إذا كانت الـ tab نشطة أو لا
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

  // تحديث حجم الحاوية
  const updateContainerSize = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = Math.floor(containerWidth * 1 / 2);
      setContainerSize({ width: containerWidth, height: containerHeight });
      
      if (canvasRef.current) {
        canvasRef.current.width = containerWidth;
        canvasRef.current.height = containerHeight;
      }
    }
  }, []);

  // مراقبة تغيير حجم الحاوية
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

  // تنظيف الذاكرة
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

  // دورة التصيير المحسنة
  const renderFrame = useCallback(() => {
    // إذا كانت الـ tab غير نشطة، نقلل من معدل التحديث
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
    
    // حساب الـ FPS
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
      
      // استخدام decode() لتحسين أداء تحميل الصور
      imageRef.current.onload = function() {
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

  // WebSocket connection with heartbeat
  useEffect(() => {
    if (!wsUrl) return;
    
    let heartbeatInterval;

    ws.current = new WebSocket(wsUrl);
    ws.current.binaryType = 'blob';
    
    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
      // إرسال نبضات قلبية للحفاظ على الاتصال نشطًا
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
      // تجاهل رسائل القلب إذا كانت موجودة
      if (typeof event.data === 'string' && event.data.includes('heartbeat')) {
        return;
      }
      
      const blob = event.data;
      const url = URL.createObjectURL(blob);
      
      // تقليل حجم الطابور وتحسين إدارة الذاكرة
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
    <div 
      ref={containerRef}
      className='relative rounded-xl overflow-hidden' 
      style={{ width }}
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
          بانتظار الاتصال...
        </div>
      )}
    </div>
  );
}

export default React.memo(WebSocketImageViewer);