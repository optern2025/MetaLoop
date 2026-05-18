import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Stars, Torus, Sphere, Environment } from '@react-three/drei'
import * as THREE from 'three'

/* ─── Scroll-synced camera ─── */
function ScrollCamera({ scrollProgress }) {
  const { camera } = useThree()
  const targetY = useRef(0)

  useFrame(() => {
    // Map scroll 0→1 to camera Y from +2 → -58 (large vertical travel)
    targetY.current = 2 - scrollProgress.current * 60
    camera.position.y += (targetY.current - camera.position.y) * 0.08
  })

  return null
}

/* ─── Subtle Grid Floor (follows camera) ─── */
function NeonGrid() {
  const ref = useRef()
  const { camera } = useThree()
  useFrame((s) => {
    ref.current.position.y = camera.position.y - 4
    ref.current.position.z = ((performance.now() / 1000) * 0.4) % 1
  })
  return (
    <group ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
      {/*<gridHelper args={[80, 80, '#1a1a4a', '#0d0d2a']} />*/}
    </group>
  )
}

/* ─── Sleek VR Headset ─── */
function VRHeadset({ position = [0, 0, 0], scale = 1, lensColor = '#00f5ff', speed = 1, offset = 0 }) {
  const g = useRef()
  useFrame((s) => {
    const t = (performance.now() / 1000) * speed + offset
    g.current.rotation.y = Math.sin(t * 0.4) * 0.3
    g.current.rotation.x = Math.sin(t * 0.25) * 0.1
    g.current.position.y = position[1] + Math.sin(t * 0.6) * 0.35
  })

  return (
    <Float speed={speed} rotationIntensity={0.2} floatIntensity={0.4}>
      <group ref={g} position={position} scale={scale}>
        {/* Main body — smooth curved visor */}
        <mesh scale={[1.4, 0.7, 0.65]}>
          <sphereGeometry args={[1, 48, 48]} />
          <meshStandardMaterial color="#1a1a2e" emissive={lensColor} emissiveIntensity={0.08} metalness={0.7} roughness={0.25} />
        </mesh>

        {/* Front visor panel */}
        <mesh position={[0, 0, 0.58]} scale={[1.25, 0.6, 0.15]}>
          <sphereGeometry args={[1, 48, 32]} />
          <meshStandardMaterial color="#0a0a18" emissive={lensColor} emissiveIntensity={0.05} metalness={0.9} roughness={0.1} />
        </mesh>

        {/* LED visor strip glow */}
        <mesh position={[0, 0.05, 0.66]} scale={[1.05, 0.1, 0.04]}>
          <sphereGeometry args={[1, 32, 8]} />
          <meshStandardMaterial color={lensColor} emissive={lensColor} emissiveIntensity={3} transparent opacity={0.7} />
        </mesh>

        {/* Left lens */}
        <mesh position={[-0.35, -0.02, 0.68]}>
          <circleGeometry args={[0.2, 32]} />
          <meshStandardMaterial color={lensColor} emissive={lensColor} emissiveIntensity={3} transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
        {/* Right lens */}
        <mesh position={[0.35, -0.02, 0.68]}>
          <circleGeometry args={[0.2, 32]} />
          <meshStandardMaterial color={lensColor} emissive={lensColor} emissiveIntensity={3} transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>

        {/* Lens rings */}
        <Torus args={[0.21, 0.018, 16, 32]} position={[-0.35, -0.02, 0.69]}>
          <meshStandardMaterial color={lensColor} emissive={lensColor} emissiveIntensity={1.5} />
        </Torus>
        <Torus args={[0.21, 0.018, 16, 32]} position={[0.35, -0.02, 0.69]}>
          <meshStandardMaterial color={lensColor} emissive={lensColor} emissiveIntensity={1.5} />
        </Torus>

        {/* Edge highlight lines */}
        <mesh position={[0, 0.45, 0]} scale={[0.25, 0.04, 0.6]}>
          <boxGeometry />
          <meshStandardMaterial color="#2a2a44" emissive={lensColor} emissiveIntensity={0.2} />
        </mesh>

        {/* Side straps */}
        <mesh position={[-1.1, 0.05, -0.1]} scale={[0.07, 0.22, 0.3]}>
          <boxGeometry />
          <meshStandardMaterial color="#1e1e36" emissive={lensColor} emissiveIntensity={0.15} />
        </mesh>
        <mesh position={[1.1, 0.05, -0.1]} scale={[0.07, 0.22, 0.3]}>
          <boxGeometry />
          <meshStandardMaterial color="#1e1e36" emissive={lensColor} emissiveIntensity={0.15} />
        </mesh>

        {/* Rear head cup */}
        <mesh position={[0, 0, -0.55]} scale={[0.5, 0.33, 0.28]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#1e1e36" emissive={lensColor} emissiveIntensity={0.1} />
        </mesh>

        {/* Camera dots on front */}
        {[[-0.55, 0.15], [-0.18, 0.2], [0.18, 0.2], [0.55, 0.15]].map(([x, y], i) => (
          <Sphere key={i} args={[0.025, 8, 8]} position={[x, y, 0.66]}>
            <meshStandardMaterial color="#333" emissive="#555" emissiveIntensity={0.3} />
          </Sphere>
        ))}

        {/* Power LED */}
        <Sphere args={[0.025, 8, 8]} position={[0.4, 0.35, -0.1]}>
          <meshStandardMaterial color={lensColor} emissive={lensColor} emissiveIntensity={4} />
        </Sphere>

        {/* Ambient glow aura */}
        <Sphere args={[1.2, 16, 16]} scale={[1.5, 0.8, 0.7]}>
          <meshStandardMaterial color={lensColor} emissive={lensColor} emissiveIntensity={0.2} transparent opacity={0.08} side={THREE.BackSide} />
        </Sphere>
      </group>
    </Float>
  )
}

/* ─── VR Touch Controller ─── */
function VRController({ position = [0, 0, 0], scale = 1, color = '#00f5ff', speed = 1, offset = 0, mirror = false }) {
  const g = useRef()
  const dir = mirror ? -1 : 1
  useFrame((s) => {
    const t = (performance.now() / 1000) * speed + offset
    g.current.rotation.z = dir * (0.25 + Math.sin(t * 0.4) * 0.15)
    g.current.rotation.y = Math.sin(t * 0.3) * 0.4
    g.current.position.y = position[1] + Math.sin(t * 0.65) * 0.3
  })
  return (
    <Float speed={speed} rotationIntensity={0.3} floatIntensity={0.4}>
      <group ref={g} position={position} scale={scale}>
        {/* Tracking ring */}
        <Torus args={[0.38, 0.025, 12, 48, Math.PI * 1.6]} position={[0, 0.45, 0]} rotation={[0.3, dir * 0.3, 0]}>
          <meshStandardMaterial color="#c0c0d0" emissive={color} emissiveIntensity={0.3} metalness={0.5} roughness={0.3} />
        </Torus>
        {/* Handle body */}
        <mesh position={[0, 0, 0]}>
          <capsuleGeometry args={[0.12, 0.5, 16, 16]} />
          <meshStandardMaterial color="#d0d0e0" emissive={color} emissiveIntensity={0.1} metalness={0.3} roughness={0.35} />
        </mesh>
        {/* Top face plate */}
        <mesh position={[0, 0.3, 0]} scale={[0.3, 0.06, 0.3]}>
          <sphereGeometry args={[1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#bbbccc" metalness={0.4} roughness={0.25} />
        </mesh>
        {/* Thumbstick */}
        <mesh position={[0.03 * dir, 0.35, -0.04]}>
          <cylinderGeometry args={[0.05, 0.05, 0.06, 12]} />
          <meshStandardMaterial color="#666" metalness={0.8} roughness={0.15} />
        </mesh>
        {/* Buttons */}
        <Sphere args={[0.035, 10, 10]} position={[-0.06 * dir, 0.34, 0.06]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
        </Sphere>
        <Sphere args={[0.035, 10, 10]} position={[0.05 * dir, 0.34, 0.1]}>
          <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={2} />
        </Sphere>
        {/* Trigger */}
        <mesh position={[0, 0.05, 0.14]} rotation={[0.6, 0, 0]} scale={[0.08, 0.12, 0.03]}>
          <boxGeometry />
          <meshStandardMaterial color="#aaa" metalness={0.4} roughness={0.3} />
        </mesh>
        {/* Controller glow */}
        <Sphere args={[0.55, 12, 12]} position={[0, 0.3, 0]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} transparent opacity={0.07} side={THREE.BackSide} />
        </Sphere>
      </group>
    </Float>
  )
}

/* ─── Gaming Console (PS5 style) ─── */
function Console({ position = [0, 0, 0], scale = 1, color = '#7b2ffa', speed = 1, offset = 0 }) {
  const g = useRef()
  useFrame((s) => {
    const t = (performance.now() / 1000) * speed + offset
    g.current.rotation.y = Math.sin(t * 0.2) * 0.3
    g.current.position.y = position[1] + Math.sin(t * 0.35) * 0.25
  })
  return (
    <Float speed={speed * 0.7} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={g} position={position} scale={scale}>
        {/* Left wing */}
        <mesh position={[-0.22, 0, 0]} scale={[0.4, 1.4, 0.6]}>
          <sphereGeometry args={[1, 32, 32, 0, Math.PI]} />
          <meshStandardMaterial color="#d0d0e0" emissive={color} emissiveIntensity={0.08} metalness={0.3} roughness={0.25} />
        </mesh>
        {/* Right wing */}
        <mesh position={[0.22, 0, 0]} scale={[0.4, 1.4, 0.6]} rotation={[0, Math.PI, 0]}>
          <sphereGeometry args={[1, 32, 32, 0, Math.PI]} />
          <meshStandardMaterial color="#d0d0e0" emissive={color} emissiveIntensity={0.08} metalness={0.3} roughness={0.25} />
        </mesh>
        {/* Dark center core */}
        <mesh scale={[0.14, 1.35, 0.55]}>
          <boxGeometry />
          <meshStandardMaterial color="#0a0a1e" emissive={color} emissiveIntensity={0.1} metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Center glow line */}
        <mesh position={[0, 0, 0.35]}>
          <boxGeometry args={[0.03, 2, 0.01]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} />
        </mesh>
        {/* Power LED */}
        <Sphere args={[0.03, 8, 8]} position={[0, 0.8, 0.4]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={5} />
        </Sphere>
        {/* Console glow */}
        <Sphere args={[1.5, 12, 12]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.1} transparent opacity={0.05} side={THREE.BackSide} />
        </Sphere>
      </group>
    </Float>
  )
}

/* ─── Particles (spread across full vertical range) ─── */
function Particles() {
  const count = 800
  const ref = useRef()
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i += 3) {
      arr[i] = (Math.random() - 0.5) * 35      // x spread
      arr[i + 1] = (Math.random() - 0.5) * 80     // y spread (massive vertical)
      arr[i + 2] = (Math.random() - 0.5) * 25     // z spread
    }
    return arr
  }, [])
  useFrame((s) => { ref.current.rotation.y = (performance.now() / 1000) * 0.005 })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#00f5ff" transparent opacity={0.4} sizeAttenuation />
    </points>
  )
}

/* ─── Scrolling Point Lights (follow camera) ─── */
function ScrollLights() {
  const ref = useRef()
  const { camera } = useThree()
  useFrame(() => {
    ref.current.position.y = camera.position.y
  })
  return (
    <group ref={ref}>
      <pointLight position={[5, 4, 5]} intensity={1.5} color="#00f5ff" distance={25} />
      <pointLight position={[-5, 3, -3]} intensity={1} color="#ff00ff" distance={25} />
      <pointLight position={[0, -2, 4]} intensity={0.6} color="#7b2ffa" distance={20} />
      <pointLight position={[3, -5, 2]} intensity={0.8} color="#39ff14" distance={20} />
      <pointLight position={[-4, 6, -2]} intensity={0.7} color="#ffd700" distance={20} />
    </group>
  )
}

/* ═══ MAIN EXPORT ═══ */
export default function VRArena() {
  const scrollRef = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      scrollRef.current = maxScroll > 0 ? window.scrollY / maxScroll : 0
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <Canvas camera={{ position: [0, 2, 8], fov: 75 }} className="landing-canvas" style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
      <color attach="background" args={['#050510']} />
      <fog attach="fog" args={['#050510', 6, 30]} />

      {/* Scroll-synced camera */}
      <ScrollCamera scrollProgress={scrollRef} />

      {/* Global lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} color="#e0e0ff" />
      <directionalLight position={[-3, 5, 3]} intensity={0.6} color="#ff00ff" />
      <ScrollLights />

      <Stars radius={70} depth={60} count={2500} factor={3} saturation={0.5} fade speed={0.3} />
      <NeonGrid />

      {/* ═══════════════════════════════════════════
           SECTION 1: HERO (y ≈ 2 to -2)
         ═══════════════════════════════════════════ */}
      <VRHeadset position={[-10, 1.5, 1]} scale={1.1} lensColor="#00f5ff" speed={0.7} />
      <VRHeadset position={[10, 0.5, 0]} scale={0.9} lensColor="#ff00ff" speed={0.6} offset={2} />
      <VRController position={[-9, -0.8, 2]} scale={0.9} color="#ff00ff" speed={0.7} />
      <VRController position={[9, -0.5, 1.5]} scale={0.9} color="#00f5ff" speed={0.7} offset={1} mirror />

      {/* ═══════════════════════════════════════════
           SECTION 2: ORGANIZERS (y ≈ -5 to -10)
         ═══════════════════════════════════════════ */}
      <VRHeadset position={[-11, -6, 0]} scale={0.75} lensColor="#ff00ff" speed={0.5} offset={3} />
      <VRHeadset position={[11, -8, -1]} scale={0.7} lensColor="#7b2ffa" speed={0.6} offset={6} />
      <VRController position={[10, -7, 1]} scale={0.7} color="#39ff14" speed={0.5} offset={4} />
      <Console position={[-10, -9, -1]} scale={0.65} color="#7b2ffa" speed={0.35} offset={2} />

      {/* ═══════════════════════════════════════════
           SECTION 3: ABOUT (y ≈ -12 to -18)
         ═══════════════════════════════════════════ */}
      <VRHeadset position={[10, -13, 0]} scale={0.8} lensColor="#00f5ff" speed={0.5} offset={1} />
      <VRHeadset position={[-10, -16, -1]} scale={0.65} lensColor="#ffd700" speed={0.45} offset={8} />
      <VRController position={[-11, -14, 1]} scale={0.75} color="#ff00ff" speed={0.6} offset={7} mirror />
      <VRController position={[11, -17, 0]} scale={0.65} color="#00f5ff" speed={0.55} offset={3} />
      <Console position={[10, -15, -2]} scale={0.6} color="#00f5ff" speed={0.4} offset={5} />

      {/* ═══════════════════════════════════════════
           SECTION 4: SCHEDULE (y ≈ -20 to -26)
         ═══════════════════════════════════════════ */}
      <VRHeadset position={[-10, -21, 0]} scale={0.75} lensColor="#39ff14" speed={0.5} offset={4} />
      <VRHeadset position={[11, -24, -1]} scale={0.65} lensColor="#ff00ff" speed={0.55} offset={9} />
      <VRController position={[10, -22, 1]} scale={0.8} color="#ffd700" speed={0.5} offset={2} />
      <VRController position={[-11, -25, 0]} scale={0.65} color="#7b2ffa" speed={0.6} offset={6} mirror />
      <Console position={[-10, -23, -2]} scale={0.7} color="#ff00ff" speed={0.35} offset={8} />

      {/* ═══════════════════════════════════════════
           SECTION 5: TRACKS (y ≈ -28 to -32)
         ═══════════════════════════════════════════ */}
      <VRHeadset position={[10, -29, 0]} scale={0.8} lensColor="#7b2ffa" speed={0.6} offset={2} />
      <VRController position={[-11, -30, 1]} scale={0.75} color="#00f5ff" speed={0.5} offset={5} />
      <VRController position={[11, -31, -1]} scale={0.6} color="#39ff14" speed={0.55} offset={10} mirror />
      <Console position={[10, -30, -2]} scale={0.65} color="#ffd700" speed={0.4} offset={3} />

      {/* ═══════════════════════════════════════════
           SECTION 6: PRIZES (y ≈ -34 to -38)
         ═══════════════════════════════════════════ */}
      <VRHeadset position={[-10, -35, 0]} scale={0.75} lensColor="#ffd700" speed={0.5} offset={5} />
      <VRHeadset position={[10, -37, -1]} scale={0.65} lensColor="#00f5ff" speed={0.55} offset={11} />
      <VRController position={[11, -36, 1]} scale={0.8} color="#ff00ff" speed={0.6} offset={1} />
      <VRController position={[-11, -38, 0]} scale={0.7} color="#39ff14" speed={0.5} offset={7} mirror />
      <Console position={[-10, -36, -2]} scale={0.7} color="#7b2ffa" speed={0.35} offset={9} />

      {/* ═══════════════════════════════════════════
           SECTION 7: ELIGIBILITY & RULES (y ≈ -40 to -44)
         ═══════════════════════════════════════════ */}
      <VRHeadset position={[10, -41, 0]} scale={0.7} lensColor="#ff00ff" speed={0.5} offset={6} />
      <VRHeadset position={[-10, -43, -1]} scale={0.65} lensColor="#39ff14" speed={0.45} offset={12} />
      <VRController position={[-11, -42, 1]} scale={0.75} color="#ffd700" speed={0.55} offset={8} />
      <Console position={[11, -42, -2]} scale={0.65} color="#00f5ff" speed={0.4} offset={4} />

      {/* ═══════════════════════════════════════════
           SECTION 8: JUDGING (y ≈ -46 to -50)
         ═══════════════════════════════════════════ */}
      <VRHeadset position={[-10, -47, 0]} scale={0.8} lensColor="#00f5ff" speed={0.6} offset={3} />
      <VRHeadset position={[11, -49, -1]} scale={0.65} lensColor="#ffd700" speed={0.5} offset={7} />
      <VRController position={[10, -48, 1]} scale={0.75} color="#7b2ffa" speed={0.55} offset={2} />
      <VRController position={[-11, -50, 0]} scale={0.65} color="#ff00ff" speed={0.5} offset={9} mirror />
      <Console position={[-10, -48, -2]} scale={0.65} color="#39ff14" speed={0.35} offset={6} />

      {/* ═══════════════════════════════════════════
           SECTION 9: FAQ (y ≈ -52 to -56)
         ═══════════════════════════════════════════ */}
      <VRHeadset position={[10, -53, 0]} scale={0.75} lensColor="#7b2ffa" speed={0.5} offset={10} />
      <VRHeadset position={[-10, -55, -1]} scale={0.7} lensColor="#ff00ff" speed={0.55} offset={4} />
      <VRController position={[-11, -54, 1]} scale={0.8} color="#00f5ff" speed={0.6} offset={1} />
      <VRController position={[11, -56, 0]} scale={0.7} color="#ffd700" speed={0.5} offset={8} mirror />
      <Console position={[10, -54, -2]} scale={0.7} color="#ff00ff" speed={0.4} offset={11} />

      {/* ═══════════════════════════════════════════
           SECTION 10: FOOTER (y ≈ -58 to -60)
         ═══════════════════════════════════════════ */}
      <VRHeadset position={[-10, -59, 0]} scale={0.7} lensColor="#00f5ff" speed={0.5} offset={5} />
      <VRController position={[-11, -59, 1]} scale={0.65} color="#39ff14" speed={0.55} offset={3} />
      <VRController position={[11, -60, 0]} scale={0.65} color="#ff00ff" speed={0.5} offset={7} mirror />

      <Particles />
    </Canvas>
  )
}

export function DashboardBg() {
  return (
    <div className="page-bg-canvas">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <color attach="background" args={['#050510']} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[3, 5, 3]} intensity={0.8} color="#e0e0ff" />
        <pointLight position={[5, 5, 5]} intensity={0.5} color="#00f5ff" />
        <Stars radius={30} depth={30} count={600} factor={2} fade speed={0.3} />
        <Particles />
        <VRHeadset position={[-3, 1, -3]} scale={0.3} lensColor="#ff00ff" speed={0.4} offset={2} />
        <VRHeadset position={[3, -1, -3]} scale={0.25} lensColor="#00f5ff" speed={0.5} offset={5} />
      </Canvas>
    </div>
  )
}
