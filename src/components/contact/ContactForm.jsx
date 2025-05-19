import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiMail, FiUser, FiMessageSquare, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ContactForm = () => {
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
  );
};

export default ContactForm;