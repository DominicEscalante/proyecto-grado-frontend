import React from 'react';

export const MountainBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden flex flex-col justify-end z-0">
      <svg
        viewBox="0 0 1440 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto min-h-[300px] max-h-[480px] object-cover"
        preserveAspectRatio="none"
      >
        {/* Capa 1: Cordillera lejana con tono verde suave (#aad576) con transparencia */}
        <path
          d="M0 260 C200 190, 420 300, 620 220 C820 140, 1040 240, 1240 180 C1360 145, 1410 170, 1440 190 L1440 600 L0 600 Z"
          fill="#aad576"
          fillOpacity="0.12"
        />

        {/* Capa 2: Relieve intermedio (#73a942) */}
        <path
          d="M0 310 C180 250, 380 340, 560 270 C760 200, 960 300, 1140 240 C1300 190, 1390 230, 1440 250 L1440 600 L0 600 Z"
          fill="#73a942"
          fillOpacity="0.22"
        />

        {/* Capa 3: Relieve andino central (#538d22) */}
        <path
          d="M0 370 C160 310, 340 400, 520 330 C720 260, 900 360, 1080 300 C1240 240, 1360 290, 1440 310 L1440 600 L0 600 Z"
          fill="#538d22"
          fillOpacity="0.35"
        />

        {/* Capa 4: Montanas frontales (#245501) */}
        <path
          d="M0 430 C150 370, 310 460, 480 390 C660 320, 840 420, 1020 360 C1200 300, 1340 360, 1440 380 L1440 600 L0 600 Z"
          fill="#245501"
          fillOpacity="0.55"
        />

        {/* Capa 5: Base en sombra profunda (#1a4301 / #143601) */}
        <path
          d="M0 490 C140 440, 300 520, 460 460 C640 400, 800 480, 980 430 C1160 380, 1320 440, 1440 450 L1440 600 L0 600 Z"
          fill="#1a4301"
          fillOpacity="0.85"
        />
      </svg>
    </div>
  );
};
