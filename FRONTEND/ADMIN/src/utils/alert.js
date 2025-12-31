import Swal from 'sweetalert2';

export const showSuccessAlert = (message, title = 'Success') => {
  return Swal.fire({
    icon: 'success',
    title,
    text: message,
    confirmButtonColor: '#1976d2',
  });
};

export const showErrorAlert = (message, title = 'Error') => {
  return Swal.fire({
    icon: 'error',
    title,
    text: message,
    confirmButtonColor: '#d32f2f',
  });
};

export const showWarningAlert = (message, title = 'Warning') => {
  return Swal.fire({
    icon: 'warning',
    title,
    text: message,
    confirmButtonColor: '#ed6c02',
  });
};

export const showConfirmAlert = (message, title = 'Are you sure?') => {
  return Swal.fire({
    title,
    text: message,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#1976d2',
    cancelButtonColor: '#d32f2f',
    confirmButtonText: 'Yes',
    cancelButtonText: 'No',
  });
};

export const showToast = (message, icon = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  return Toast.fire({
    icon,
    title: message,
  });
};
