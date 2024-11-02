import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import SpectrogramPlugin from 'wavesurfer.js/dist/plugins/spectrogram';
import axios from 'axios';

function SpectrogramComponent({ audioUrl, trackName, label }) {
  const spectrogramRef = useRef(null);
  const waveSurferRef = useRef(null);

  const sendSpectrogramToBackend = async (dataUrl) => {
    try {
      console.log({ label });
      const response = await axios.post('http://localhost:8000/upload-spectrogram', {
        image: dataUrl,
        trackName,
        label,
      });
    } catch (error) {
      console.error('Error uploading spectrogram:', error);
    }
  };

  useEffect(() => {
    if (waveSurferRef.current) {
      waveSurferRef.current.destroy();
      waveSurferRef.current = null;
    }

    waveSurferRef.current = WaveSurfer.create({
      container: spectrogramRef.current,
      height: 0,
      plugins: [
        SpectrogramPlugin.create({ container: spectrogramRef.current }),
      ],
    });

    waveSurferRef.current.on('ready', () => {
      const canvas = spectrogramRef.current.querySelector('canvas');
      if (canvas) {
        setTimeout(() => {
          const dataUrl = canvas.toDataURL('image/png');
          sendSpectrogramToBackend(dataUrl, trackName, label);
        }, 1000);
      }
    });

    waveSurferRef.current.load(audioUrl);

    return () => {
      if (waveSurferRef.current) {
        waveSurferRef.current.destroy();
        waveSurferRef.current = null;
      }
    };
  }, [audioUrl]);

  return <div ref={spectrogramRef} style={{ width: '100%', height: '64px' }} />;
}

export default SpectrogramComponent;
