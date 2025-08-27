import { useEffect, useState } from "react";
import noProfilePhoto from "../assets/demo/no_profile_img.jpg";
import Swal from "sweetalert2";

const useSelectedImg = (profilePhoto) => {
  const initialProfilePhoto = profilePhoto ? profilePhoto : noProfilePhoto;
  const [selectedImage, setSelectedImage] = useState(initialProfilePhoto);
  const [delimgButtonFlag, setDelImgButtonFlag] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    setSelectedImage(initialProfilePhoto);
    if (initialProfilePhoto == profilePhoto) {
      setDelImgButtonFlag(true);
    } else {
      setDelImgButtonFlag(false);
    }
  }, [initialProfilePhoto, profilePhoto]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setDelImgButtonFlag(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageDelete = () => {
    Swal.fire({
      title: "هل أنت متأكد من عملية الحذف؟",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "لا",
      confirmButtonColor: "#E76D3B",
      cancelButtonColor: "#3457D5",
      confirmButtonText: "نعم",
    }).then((result) => {
      if (result.isConfirmed) {
        setSelectedImage(noProfilePhoto);
        setDelImgButtonFlag(!delimgButtonFlag);
      }
    });
  };
  const triggerFileInput = () => {
    document.getElementById("fileInput").click();
  };

  return {
    selectedFile,
    setSelectedFile,
    selectedImage,
    delimgButtonFlag,
    handleImageChange,
    handleImageDelete,
    triggerFileInput,
  };
};

export default useSelectedImg;
