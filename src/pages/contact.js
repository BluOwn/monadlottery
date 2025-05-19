import { useState } from 'react';
import Head from 'next/head';
import { FiMail, FiUser, FiMessageSquare, FiSend } from 'react-icons/fi';
import Layout from '../components/layout/Layout';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import { SOCIAL_LINKS } from '../constants/contractAddresses';

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real application, you would send the form data to your server or a form handling service
    console.log('Form submitted:', data);
    
    toast.success('Message sent successfully! We will get back to you soon.');
    reset();
    setIsSubmitting(false);
  };

  return (
    <>
      <Head>
        <title>Contact - Monad Lottery</title>
        <meta name="description" content="Contact the Monad Lottery team with your questions or feedback." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <Toaster position="top-right" />
        
        <div className="py-20 bg-white dark:bg-dark-900">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-dark-900 dark:text-white mb-4">
                  Contact Us
                </h1>
                <p className="text-lg text-dark-600 dark:text-dark-400">
                  Have questions or feedback about the Monad Lottery? Get in touch with us!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="col-span-1">
                  <div className="card h-full">
                    <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-6">
                      Contact Information
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-dark-800 dark:text-dark-200 mb-2">
                          Email
                        </h3>
                        <a 
                          href="mailto:oprimedeveloper@gmail.com" 
                          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-500 dark:hover:text-primary-400"
                        >
                          <FiMail />
                          <span>oprimedeveloper@gmail.com</span>
                        </a>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium text-dark-800 dark:text-dark-200 mb-2">
                          Social Media
                        </h3>
                        <a 
                          href={SOCIAL_LINKS.TWITTER}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-500 dark:hover:text-primary-400"
                        >
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.03 10.03 0 01-3.127 1.196 4.92 4.92 0 00-8.384 4.482C7.69 8.1 4.067 6.13 1.64 3.16a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                          </svg>
                          <span>@Oprimedev</span>
                        </a>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium text-dark-800 dark:text-dark-200 mb-2">
                          GitHub
                        </h3>
                        <a 
                          href={SOCIAL_LINKS.GITHUB}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-500 dark:hover:text-primary-400"
                        >
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                          </svg>
                          <span>github.com/BluOwn</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-2">
                  <div className="card">
                    <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-6">
                      Send a Message
                    </h2>
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      <div className="form-group">
                        <label htmlFor="name" className="label">
                          Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiUser className="text-dark-400 dark:text-dark-500" />
                          </div>
                          <input
                            id="name"
                            type="text"
                            className="input pl-10"
                            placeholder="Your name"
                            {...register('name', { required: 'Name is required' })}
                          />
                        </div>
                        {errors.name && (
                          <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                        )}
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="email" className="label">
                          Email
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiMail className="text-dark-400 dark:text-dark-500" />
                          </div>
                          <input
                            id="email"
                            type="email"
                            className="input pl-10"
                            placeholder="Your email address"
                            {...register('email', { 
                              required: 'Email is required',
                              pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address',
                              },
                            })}
                          />
                        </div>
                        {errors.email && (
                          <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                        )}
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="message" className="label">
                          Message
                        </label>
                        <div className="relative">
                          <div className="absolute top-3 left-3 pointer-events-none">
                            <FiMessageSquare className="text-dark-400 dark:text-dark-500" />
                          </div>
                          <textarea
                            id="message"
                            rows="5"
                            className="input pl-10"
                            placeholder="Your message"
                            {...register('message', { required: 'Message is required' })}
                          ></textarea>
                        </div>
                        {errors.message && (
                          <p className="text-sm text-red-600 mt-1">{errors.message.message}</p>
                        )}
                      </div>
                      
                      <button
                        type="submit"
                        className="btn-primary py-3 w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <FiSend />
                            Send Message
                          </span>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default ContactPage;