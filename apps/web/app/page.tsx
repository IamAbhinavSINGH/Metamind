"use client"

import { useRef, useEffect, useState } from "react"
import Scene from "@/pages/scene"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { MessageSquare, Image, Video, Brain, Zap, Lock } from "lucide-react"

const LandingPage = () => {
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const featuresInView = useInView(featuresRef, { amount: 0.1 })
  
  const howItWorksRef = useRef(null)
  const howItWorksInView = useInView(howItWorksRef, { amount: 0.1 })
  
  const testimonialsRef = useRef(null)
  const testimonialsInView = useInView(testimonialsRef, { amount: 0.1 })
  
  const pricingRef = useRef(null)
  const pricingInView = useInView(pricingRef, { amount: 0.1 })

  const targetRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])

  // Mouse parallax effect for hero section
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e : any) => {
      setMousePosition({
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className="relative h-screen bg-transparent text-white" ref={targetRef}>
      <Scene />

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ opacity, scale }}
        className="relative w-full z-10 h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 text-center"
      >
        <motion.div
          style={{
            x: mousePosition.x * 20,
            y: mousePosition.y * 20,
          }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl font-bold mb-6 text-white"
          >
            <span className="block">Metamind</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto"
          >
            The universal AI hub that brings all your favorite AI models together in one powerful platform. Chat,
            create, and innovate without switching between apps.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a href="/chat?model=auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black px-8 py-4 rounded-full text-lg font-semibold transition-all cursor-pointer"
            >
             Start Creating free 
            </motion.button>
            </a>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border border-white bg-transparent px-8 py-4 rounded-full text-lg font-semibold transition-all"
            >
              <a href="#how-it-works">Learn More</a>
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 5V19M12 19L5 12M12 19L19 12"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Features Grid */}
      <motion.section id="features" ref={featuresRef} className="py-24 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">One Platform, Unlimited Possibilities</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Access the world's most powerful AI models through a single, intuitive interface.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
              hidden: {},
            }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <MessageSquare className="w-8 h-8" />,
                title: "Chat Models",
                description: "Access GPT-4, Claude, Gemini, and more through a unified chat interface.",
                color: "from-blue-500 to-blue-700",
              },
              {
                icon: <Image className="w-8 h-8" />,
                title: "Image Generation",
                description: "Create stunning visuals with DALL-E, Stable Diffusion, and Midjourney.",
                color: "from-green-500 to-green-700",
              },
              {
                icon: <Video className="w-8 h-8" />,
                title: "Video Synthesis",
                description: "Generate videos with Sora, Pika Labs, and other cutting-edge AI models.",
                color: "from-red-500 to-red-700",
              },
              {
                icon: <Brain className="w-8 h-8" />,
                title: "Multi-Model Comparison",
                description: "Compare responses from different models side by side to find the best solution.",
                color: "from-purple-500 to-purple-700",
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Unified History",
                description: "Access all your conversations and creations in one searchable place.",
                color: "from-yellow-500 to-yellow-700",
              },
              {
                icon: <Lock className="w-8 h-8" />,
                title: "Secure & Private",
                description: "Your data is encrypted and never shared with third parties.",
                color: "from-indigo-500 to-indigo-700",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
                }}
                className="bg-gray-900 p-8 rounded-xl border border-gray-800 hover:border-gray-700 transition-all group"
              >
                <div className={`p-4 rounded-lg bg-gradient-to-br ${feature.color} mb-6 inline-block`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-white transition-colors">{feature.title}</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section id="how-it-works" ref={howItWorksRef} className="py-24 px-4 bg-gray-950 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">How Metamind Works</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">A seamless experience from start to finish</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform -translate-y-1/2 z-0"></div>

            {[
              {
                step: "01",
                title: "Sign Up",
                description: "Create your account in seconds and get immediate access to all features.",
                delay: 0.1,
              },
              {
                step: "02",
                title: "Choose Your Model",
                description: "Select from dozens of AI models based on your specific needs.",
                delay: 0.2,
              },
              {
                step: "03",
                title: "Create & Chat",
                description: "Generate text, images, videos, or have conversations with your chosen AI.",
                delay: 0.3,
              },
              {
                step: "04",
                title: "Save & Share",
                description: "Save your creations and share them with others in just a few clicks.",
                delay: 0.4,
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: item.delay }}
                className="bg-gray-900 p-8 rounded-xl border border-gray-800 relative z-10"
              >
                <div className="bg-black w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto border-2 border-white">
                  <span className="text-xl font-bold">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold mb-4 text-center">{item.title}</h3>
                <p className="text-gray-400 text-center">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Model Showcase */}
      <section className="py-24 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Supported Models</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Access the world's most powerful AI models through a single platform
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6"
          >
            {[
              { name: "OpenAI GPT-4", category: "Chat" },
              { name: "Anthropic Claude", category: "Chat" },
              { name: "Google Gemini", category: "Chat" },
              { name: "Meta Llama", category: "Chat" },
              { name: "DALL-E 3", category: "Image" },
              { name: "Midjourney", category: "Image" },
              { name: "Stable Diffusion", category: "Image" },
              { name: "Leonardo AI", category: "Image" },
              { name: "OpenAI Sora", category: "Video" },
              { name: "Runway Gen-2", category: "Video" },
              { name: "Pika Labs", category: "Video" },
              { name: "Synthesia", category: "Video" },
            ].map((model) => (
              <motion.div
                key={model.name}
                whileHover={{ scale: 1.05, backgroundColor: "#1a1a1a" }}
                className="p-6 bg-gray-900 rounded-lg text-center border border-gray-800 transition-all group"
              >
                <div className="text-sm text-gray-500 mb-2">{model.category}</div>
                <span className="text-lg font-medium group-hover:text-white transition-colors">{model.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <motion.section ref={testimonialsRef} className="py-24 px-4 bg-gray-950 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">What Our Users Say</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Join thousands of satisfied users who have streamlined their AI workflow
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={testimonialsInView ? "visible" : "hidden"}
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
              hidden: {},
            }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                quote:
                  "Metamind has completely transformed my workflow. I used to switch between 5 different AI tools, now I just use one.",
                author: "Sarah J.",
                role: "Digital Artist",
              },
              {
                quote:
                  "The ability to compare responses from different models side by side has been invaluable for my research work.",
                author: "Dr. Michael Chen",
                role: "AI Researcher",
              },
              {
                quote:
                  "As a content creator, having all my AI tools in one place has saved me countless hours and streamlined my creative process.",
                author: "Alex Rodriguez",
                role: "Content Creator",
              },
            ].map((testimonial, i) => (
              <motion.div
                key={testimonial.author}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
                }}
                className="bg-gray-900 p-8 rounded-xl border border-gray-800"
              >
                <svg className="w-10 h-10 text-gray-600 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-lg mb-6 text-gray-300">{testimonial.quote}</p>
                <div>
                  <p className="font-bold">{testimonial.author}</p>
                  <p className="text-gray-500">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Pricing */}
      <motion.section ref={pricingRef} className="py-24 px-4 relative z-10" id="pricing">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={pricingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">Choose the plan that works best for you</p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={pricingInView ? "visible" : "hidden"}
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
              hidden: {},
            }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                name: "Free",
                price: "$0",
                period: "forever",
                description: "Perfect for trying out Metamind",
                features: [
                  "Access to basic models",
                  "10 chat messages per day",
                  "5 image generations per day",
                  "Basic history",
                ],
                cta: "Get Started",
                highlighted: false,
              },
              {
                name: "Pro",
                price: "$19",
                period: "per month",
                description: "For individuals who need more power",
                features: [
                  "Access to all models",
                  "Unlimited chat messages",
                  "100 image generations per day",
                  "10 video generations per day",
                  "Advanced history and organization",
                  "Priority support",
                ],
                cta: "Start Free Trial",
                highlighted: true,
              },
              {
                name: "Team",
                price: "$49",
                period: "per month",
                description: "For teams and businesses",
                features: [
                  "Everything in Pro",
                  "5 team members",
                  "Unlimited generations",
                  "Team workspace",
                  "Advanced analytics",
                  "API access",
                  "24/7 support",
                ],
                cta: "Contact Sales",
                highlighted: false,
              },
            ].map((plan, i) => (
              <motion.div
                key={plan.name}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
                }}
                className={`p-8 rounded-xl border ${plan.highlighted ? "border-white bg-gray-900" : "border-gray-800 bg-gray-950"} relative`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-black px-4 py-1 rounded-full text-sm font-bold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-400">/{plan.period}</span>
                </div>
                <p className="text-gray-400 mb-6">{plan.description}</p>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-3 rounded-lg font-semibold ${plan.highlighted ? "bg-white text-black" : "bg-gray-800 text-white"}`}
                >
                  {plan.cta}
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA */}
      <section className="py-24 px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto bg-gradient-to-r from-gray-900 to-black p-12 rounded-2xl border border-gray-800 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your AI Workflow?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join thousands of users who have streamlined their AI experience with Metamind.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-black px-8 py-4 rounded-full text-lg font-semibold transition-all"
          >
            <a href="/chat?model=auto">Get Started for Free</a>
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-lg font-bold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-gray-400 hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Tutorials
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Events
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-2xl font-bold">Metamind</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.022A9.606 9.606 0 0112 6.82c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </a>
            </div>
          </div>
          <div className="text-center mt-8 text-gray-500 text-sm">
            © {new Date().getFullYear()} Metamind. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

