import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import Map from '../pages/map/Map';

const MapButton = () => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <button
        onClick={handleClickOpen}
        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors duration-200"
      >
        add your adress
      </button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            height: '80vh',
            borderRadius: '12px',
          },
        }}
      >
        <div className="h-full w-full">
          <Map />
          <div className="absolute top-2 right-2">
            <button
              onClick={handleClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-1 px-3 rounded-full shadow-sm transition-colors duration-200"
            >
              ×
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default MapButton;