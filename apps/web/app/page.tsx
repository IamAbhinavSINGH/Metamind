'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
// import { Scene } from '@/pages/scene'

const LandingPage = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* <Scene /> */}

      
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 pt-32 px-4 sm:px-6 lg:px-8 text-center"
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent animate-pulse">
          Universal AI Hub
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8">
          Access all AI models in one place - Chat, Generate, Create
        </p>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all"
        >
          <a href='/chat?model=auto'>Start Creating Free</a>
        </motion.button>
      </motion.section>

       {/* Features Grid */}
       <motion.div 
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={{
          visible: { transition: { staggerChildren: 0.1 } },
          hidden: {}
        }}
        className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto py-20 px-4"
      >
        {['Chat Models', 'Image Generation', 'Video Synthesis'].map((feature, i) => (
          <motion.div
            key={feature}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            className="bg-gray-800/50 backdrop-blur-lg p-8 rounded-xl border border-gray-700 hover:border-purple-500 transition-all"
          >
            <div className="text-purple-400 text-4xl mb-4">
              <IconForFeature index={i} />
            </div>
            <h3 className="text-2xl font-bold mb-4">{feature}</h3>
            <p className="text-gray-400">Access multiple AI models including {['GPT-4, Claude, Gemini', 'DALL-E, Stable Diffusion', 'Sora, Pika Labs'][i]}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Model Showcase */}
      <div className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="max-w-6xl mx-auto bg-gray-800/30 p-8 rounded-2xl border border-gray-700"
        >
          <h2 className="text-4xl font-bold mb-12 text-center">Supported Models</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['OpenAI', 'DeepSeek', 'Anthropic', 'Gemini', 'Stability AI', 'Midjourney', 'Pika', 'Sora'].map((model) => (
              <motion.div
                key={model}
                whileHover={{ scale: 1.05 }}
                className="p-4 bg-gray-900 rounded-lg text-center border border-gray-700 hover:border-purple-500 transition-all"
              >
                <span className="text-lg font-medium">{model}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
        </div>
    </div>
  )
}

const IconForFeature = ({ index } : { index : number }) => {
  const icons = [
    <svg key="chat" /* Add SVG path for chat icon */ />,
    <svg key="image" /* Add SVG path for image icon */ />,
    <svg key="video" /* Add SVG path for video icon */ />
  ]
  return icons[index]
}

export default LandingPage