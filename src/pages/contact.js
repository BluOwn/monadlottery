"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, User, MessageSquare, Send, Twitter, Github } from "lucide-react"
import Layout from "../components/layout/Layout"
import { useForm } from "react-hook-form"
import { toast, Toaster } from "react-hot-toast"

// Assuming these constants are defined elsewhere in your project
const SOCIAL_LINKS = {
  TWITTER: "https://twitter.com/Oprimedev",
  GITHUB: "https://github.com/BluOwn",
}

const ContactClientPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // In a real application, you would send the form data to your server or a form handling service
    console.log("Form submitted:", data)

    toast.success("Message sent successfully! We will get back to you soon.")
    reset()
    setIsSubmitting(false)
  }

  // Fade-in animation for sections
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <Layout>
      <Toaster position="top-right" />

      <div className="py-20 bg-gradient-to-b from-gray-950 to-black">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h1 className="text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 inline-block">
                Contact Us
              </h1>
              <div className="w-20 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto mt-2 mb-6 rounded-full"></div>
              <p className="text-lg text-gray-300">
                Have questions or feedback about the Monad Lottery? Get in touch with us!
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="col-span-1"
              >
                <div className="bg-gray-900 p-6 rounded-xl shadow-sm h-full">
                  <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <div className="bg-purple-900/30 p-2 rounded-full mr-3">
                      <Mail className="w-5 h-5 text-purple-400" />
                    </div>
                    Contact Information
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-200 mb-2">Email</h3>
                      <a
                        href="mailto:oprimedeveloper@gmail.com"
                        className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <Mail className="h-5 w-5" />
                        <span>oprimedeveloper@gmail.com</span>
                      </a>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-200 mb-2">Social Media</h3>
                      <a
                        href={SOCIAL_LINKS.TWITTER}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <Twitter className="h-5 w-5" />
                        <span>@Oprimedev</span>
                      </a>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-200 mb-2">GitHub</h3>
                      <a
                        href={SOCIAL_LINKS.GITHUB}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <Github className="h-5 w-5" />
                        <span>github.com/BluOwn</span>
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="col-span-2"
              >
                <div className="bg-gray-900 p-6 rounded-xl shadow-sm">
                  <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <div className="bg-purple-900/30 p-2 rounded-full mr-3">
                      <MessageSquare className="w-5 h-5 text-purple-400" />
                    </div>
                    Send a Message
                  </h2>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="form-group">
                      <label htmlFor="name" className="block text-gray-300 mb-2">
                        Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="text-gray-500" />
                        </div>
                        <input
                          id="name"
                          type="text"
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-10 pr-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Your name"
                          {...register("name", { required: "Name is required" })}
                        />
                      </div>
                      {errors.name && <p className="text-sm text-red-400 mt-1">{errors.name.message}</p>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="email" className="block text-gray-300 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="text-gray-500" />
                        </div>
                        <input
                          id="email"
                          type="email"
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-10 pr-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Your email address"
                          {...register("email", {
                            required: "Email is required",
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: "Invalid email address",
                            },
                          })}
                        />
                      </div>
                      {errors.email && <p className="text-sm text-red-400 mt-1">{errors.email.message}</p>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="message" className="block text-gray-300 mb-2">
                        Message
                      </label>
                      <div className="relative">
                        <div className="absolute top-3 left-3 pointer-events-none">
                          <MessageSquare className="text-gray-500" />
                        </div>
                        <textarea
                          id="message"
                          rows="5"
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-10 pr-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Your message"
                          {...register("message", { required: "Message is required" })}
                        ></textarea>
                      </div>
                      {errors.message && <p className="text-sm text-red-400 mt-1">{errors.message.message}</p>}
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Send className="h-5 w-5" />
                          Send Message
                        </span>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ContactClientPage
