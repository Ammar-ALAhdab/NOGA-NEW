import Swal from "sweetalert2";

// we can use this variants of toasts :
//
//    Toast.fire({
//     icon: 'success',
//     title: 'Success',
//   })
//    Toast.fire({
//     icon: 'error',
//     title: 'Error',
//   })
//    Toast.fire({
//     icon: 'warning',
//     title: 'Warning',
//   })
//    Toast.fire({
//     icon: 'info',
//     title: 'Info',
//   })
//    Toast.fire({
//     icon: 'question',
//     title: 'Question',
//   })
//

function useToast() {
  const Toast = Swal.mixin({
    toast: true,
    position: "top",
    width: "450px",
    iconColor: "white",
    customClass: {
      container: " container",
      popup: "colored-toast",
    },
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });

  return Toast;
}

export default useToast;
