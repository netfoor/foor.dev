'use client';

// Determine if the current user is an admin
// You can modify this to check specific user attributes or a list of admin emails
export const isAdmin = (user: any): boolean => {
  if (!user) return false;
  
  // You can implement your admin check here
  // For example, checking if the email matches your email:
  const userEmail = user.attributes?.email || '';
    // Add your email address here to restrict admin access to only your account
  const adminEmails = ['fortino.romero.man@gmail.com']; // Replace with your actual email
  
  return adminEmails.includes(userEmail);
};
