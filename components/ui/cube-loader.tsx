"use client"

export function CubeLoader() {
  return (
    <div className="cube-loader-wrapper">
      <div className="spinner">
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
      </div>
      <style jsx>{`
        .cube-loader-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 200px;
        }

        .spinner {
          width: 44px;
          height: 44px;
          animation: spinner-rotate 2s infinite ease;
          transform-style: preserve-3d;
        }

        .spinner > div {
          background-color: rgba(0, 224, 255, 0.1);
          height: 100%;
          position: absolute;
          width: 100%;
          border: 2px solid #00e0ff;
          box-shadow: 0 0 20px rgba(0, 224, 255, 0.5);
        }

        .spinner div:nth-of-type(1) {
          transform: translateZ(-22px) rotateY(180deg);
        }

        .spinner div:nth-of-type(2) {
          transform: rotateY(-270deg) translateX(50%);
          transform-origin: top right;
        }

        .spinner div:nth-of-type(3) {
          transform: rotateY(270deg) translateX(-50%);
          transform-origin: center left;
        }

        .spinner div:nth-of-type(4) {
          transform: rotateX(90deg) translateY(-50%);
          transform-origin: top center;
        }

        .spinner div:nth-of-type(5) {
          transform: rotateX(-90deg) translateY(50%);
          transform-origin: bottom center;
        }

        .spinner div:nth-of-type(6) {
          transform: translateZ(22px);
        }

        @keyframes spinner-rotate {
          0% {
            transform: rotate(45deg) rotateX(-25deg) rotateY(25deg);
          }

          50% {
            transform: rotate(45deg) rotateX(-385deg) rotateY(25deg);
          }

          100% {
            transform: rotate(45deg) rotateX(-385deg) rotateY(385deg);
          }
        }
      `}</style>
    </div>
  )
}
