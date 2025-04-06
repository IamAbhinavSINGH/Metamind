"use client"

import { useRef, useMemo } from "react"
import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import { Stars, Float, Text3D, Center, useFont } from "@react-three/drei"

// Fixed ParticleField component
const ParticleField = () => {
  const count = 2000
  const particlesRef = useRef<THREE.Points>(null)

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      time: Math.random() * 100,
      factor: 20 + Math.random() * 100,
      speed: 0.01 + Math.random() / 200,
      x: Math.random() * 2000 - 1000,
      y: Math.random() * 2000 - 1000,
      z: Math.random() * 2000 - 1000
    }))
  }, [count])

  const [positions, sizes] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    particles.forEach((particle, i) => {
      positions[i * 3] = particle.x
      positions[i * 3 + 1] = particle.y
      positions[i * 3 + 2] = particle.z
      sizes[i] = Math.random() * 2
    })

    return [positions, sizes]
  }, [count, particles])

  useFrame((state) => {
    if (!particlesRef.current?.geometry?.attributes?.position) return
    
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
    const { clock } = state

    particles.forEach((particle, i) => {
      const i3 = i * 3
      const t = clock.getElapsedTime() * particle.speed
      
      positions[i3] = particle.x + Math.sin(t) * particle.factor
      positions[i3 + 1] = particle.y + Math.cos(t) * particle.factor
      positions[i3 + 2] = particle.z + Math.cos(t) * particle.factor
    })

    particlesRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={positions.length / 3}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
          count={sizes.length}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={1.5}
        sizeAttenuation
        color="#ffffff"
        transparent
        opacity={0.8}
      />
    </points>
  )
}

// Fixed FloatingLogo component
const FloatingLogo = () => {
    const font = useFont('https://drei.pmnd.rs/fonts/helvetiker_regular.typeface.json');

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1} position={[-1, 0, -7]}>
      <Center>
        <Text3D
          font={font!.data}
          size={3}
          height={0.2}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={5}
        >
            Metamind
          <meshStandardMaterial color="#ffffff" emissive="#111111" />
        </Text3D>
      </Center>
    </Float>
  )
}

// Main Scene component
const Scene = () => {
    return (
        <div className="fixed top-0 left-0 w-full h-screen -z-10">
            <Canvas className="w-full h-full" camera={{ position: [0, 0, 50], fov: 75 }}>
                <color attach="background" args={["#000000"]} />
                <fog attach="fog" args={["#000000", 50, 200]} />
                <ambientLight intensity={0.2} />
                <directionalLight position={[10, 10, 10]} intensity={0.5} />
                <ParticleField />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                {/* <FloatingLogo /> */}
            </Canvas>
        </div>
    );
}

export default Scene