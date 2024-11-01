import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import SpectrogramPlugin from 'wavesurfer.js/dist/plugins/spectrogram';

function SpectrogramComponent({ audioUrl }) {
  const spectrogramRef = useRef(null);
  const waveSurferRef = useRef(null);

  useEffect(() => {
    if (waveSurferRef.current) {
      // Destroy the existing instance safely
      waveSurferRef.current.destroy();
      waveSurferRef.current = null;
    }

    waveSurferRef.current = WaveSurfer.create({
      container: spectrogramRef.current,
      height: 0, // Adjust height if necessary
      plugins: [
        SpectrogramPlugin.create({
          container: spectrogramRef.current,
        }),
      ],
    });

    waveSurferRef.current.load(audioUrl);

    return () => {
      if (waveSurferRef.current) {
        waveSurferRef.current.destroy();
        waveSurferRef.current = null;
      }
    };
  }, [audioUrl]);

  return <div ref={spectrogramRef} style={{ width: '100%', height: 'auto' }} />;
}

export default SpectrogramComponent;
