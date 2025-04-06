'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere } from '@react-three/drei'

export const Scene = () => (
  <Canvas className="absolute top-0 left-0 w-full h-full">
    <ambientLight intensity={0.5} />
    <pointLight position={[10, 10, 10]} />
    <Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
      <meshStandardMaterial color="#4f46e5" transparent opacity={0.2} />
    </Sphere>
    <OrbitControls enableZoom={false} autoRotate />
  </Canvas>
)