const express = require('express');
const nodemailer = require('nodemailer');
const authMiddleware = require('../authMiddleware');
const router = express.Router();

// Email configuration using Dharani's credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dharanigunasekar2003@gmail.com',
    pass: 'depr iqfd sels zjxl'
  }
});

// Extract name from email address
function extractNameFromEmail(email) {
  const match = email.match(/([a-zA-Z]+)\.?([a-zA-Z]+)?@/);
  if (match) {
    const firstName = match[1].charAt(0).toUpperCase() + match[1].slice(1);
    const lastName = match[2] ? match[2].charAt(0).toUpperCase() + match[2].slice(1) : '';
    return firstName + (lastName ? ' ' + lastName : '');
  }
  return 'Team Member';
}



// Send newsletter email with CDN images
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { html, subject, recipients } = req.body;
    
    if (!html || !recipients) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    
    // Parse recipients
    const emailList = typeof recipients === 'string' 
      ? recipients.split(/[,\n]/).map(email => email.trim()).filter(email => email && email.includes('@'))
      : recipients;
    
    if (emailList.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid email addresses provided' });
    }
    
    let successCount = 0;
    let errors = [];
    
    // Send personalized emails
    for (const email of emailList) {
      try {
        const mailOptions = {
          from: 'Team <dharanigunasekar2003@gmail.com>',
          to: email,
          subject: subject || 'Newsletter',
          html: html
        };
        
        await transporter.sendMail(mailOptions);
        successCount++;
      } catch (emailError) {
        console.error(`Failed to send to ${email}:`, emailError);
        errors.push(`${email}: ${emailError.message}`);
      }
    }
    
    const message = `Newsletter sent successfully to ${successCount}/${emailList.length} recipients`;
    const response = { success: true, message, successCount, totalCount: emailList.length };
    
    if (errors.length > 0) {
      response.errors = errors;
      response.partialSuccess = true;
    }
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to send email' });
  }
});

// Bulk send with text input
router.post('/bulk-send', authMiddleware, async (req, res) => {
  try {
    const { html, subject, recipients } = req.body;
    
    if (!html || !recipients) {
      return res.status(400).json({ success: false, error: 'HTML content and recipients are required' });
    }
    
    // Parse recipients from text input
    const emailList = recipients
      .split(/[,\n]/)
      .map(email => email.trim())
      .filter(email => email && email.includes('@'));
    
    if (emailList.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid emails found' });
    }
    
    let successCount = 0;
    let errors = [];
    
    // Send in batches to avoid overwhelming the email service
    const batchSize = 10;
    for (let i = 0; i < emailList.length; i += batchSize) {
      const batch = emailList.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (email) => {
        try {
          await transporter.sendMail({
            from: 'Team <dharanigunasekar2003@gmail.com>',
            to: email,
            subject: subject || 'Newsletter',
            html: html
          });
          
          successCount++;
        } catch (emailError) {
          errors.push(`${email}: ${emailError.message}`);
        }
      }));
      
      // Add delay between batches
      if (i + batchSize < emailList.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    res.json({
      success: true,
      message: `Bulk send completed: ${successCount}/${emailList.length} emails sent`,
      successCount,
      totalCount: emailList.length,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('Bulk send error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;