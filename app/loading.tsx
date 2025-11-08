import { BackgroundAnimation } from "@/components/background-animation"
import { CubeLoader } from "@/components/ui/cube-loader"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-[#0a0015] to-background flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 blur-sm opacity-50">
        <BackgroundAnimation />
      </div>

      <div className="relative z-10">
        <CubeLoader />
      </div>
    </div>
  )
}
