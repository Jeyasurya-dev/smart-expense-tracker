import React from 'react';

const Blobs = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    <div className="app-bg absolute inset-0" />
    <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-fuchsia-500/30 rounded-full blur-3xl animate-blob" />
    <div className="absolute top-[20%] right-[-10%] w-[28rem] h-[28rem] bg-indigo-500/30 rounded-full blur-3xl animate-blob-slow" />
    <div className="absolute bottom-[-15%] left-[20%] w-[30rem] h-[30rem] bg-emerald-500/20 rounded-full blur-3xl animate-blob" />
    <div className="absolute bottom-[10%] right-[15%] w-72 h-72 bg-sky-500/20 rounded-full blur-3xl animate-blob-slow" />
  </div>
);

export default Blobs;
