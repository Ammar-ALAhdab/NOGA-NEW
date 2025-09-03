import React, { useRef, useState, useEffect } from 'react';
import ButtonComponent from '../buttons/ButtonComponent';

function CameraCapture({ onCapture }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [capturedImage, setCapturedImage] = useState(null);

    useEffect(() => {
        // طلب إذن الكاميرا وتشغيل الفيديو
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch(err => {
                console.error("Error accessing camera: ", err);
            });

        // تنظيف التدفق عند إيقاف المكون
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video && canvas) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // تحويل الصورة إلى بيانات URL
            const imageData = canvas.toDataURL('image/png');
            if (onCapture) {
                onCapture(imageData)
            }
            setCapturedImage(imageData);

        }
    };

    return (
        <div className='relative w-full flex justify-center items-center flex-col'>
            {/* <h2>فتح الكاميرا والتقاط صورة</h2> */}
            <video hidden={capturedImage} ref={videoRef} autoPlay playsInline className='relative w-1/2 rounded-xl' />
            {capturedImage &&
                <img src={capturedImage} alt="Captured" className='relative w-1/2 rounded-xl' />
            }
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div className='relative w-full flex justify-center items-center p-5'>
                {
                    capturedImage ?
                        <ButtonComponent onClick={() => setCapturedImage(null)} variant={'reject'} textButton='الغاء' />
                        :
                        <ButtonComponent onClick={capturePhoto} textButton='التقاط الصورة' />
                }
            </div>
        </div>
    );
}

export default CameraCapture;
