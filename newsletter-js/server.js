const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
// server.js
console.log("Node.js server is running!");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dharanigunasekar2003@gmail.com',
        pass: 'depr iqfd sels zjxl'
    }
});


function extractNameFromEmail(email) {
    const match = email.match(/([a-zA-Z]+)\.?([a-zA-Z]+)?@/);
    if (match) {
        const firstName = match[1].charAt(0).toUpperCase() + match[1].slice(1);
        const lastName = match[2] ? match[2].charAt(0).toUpperCase() + match[2].slice(1) : '';
        return firstName + (lastName ? ' ' + lastName : '');
    }
    return 'Team Member';
}

function getNewsletterHTML(recipientName, imageAttachments = []) {
    const imageSection = imageAttachments.length > 0 ? `
        <div class="section">
            <h3>📸 Featured Images</h3>
            ${imageAttachments.map(img => `<img src="cid:${img.cid}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 5px;" alt="Newsletter Image">`).join('')}
        </div>` : '';
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
        .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; }
        .content { padding: 20px; }
        .section { margin-bottom: 25px; }
        .section h3 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px; }
        .section img { display: block; margin: 0 auto; max-width: 100%; height: auto; }
        .footer { background: #ecf0f1; padding: 15px; text-align: center; color: #7f8c8d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🚀 Turbify Logo</div>
            <h2>Monthly Newsletter | April 2025</h2>
        </div>
        
        <div class="content">
            <div class="section">
                <p>👋 Hello <strong>${recipientName}</strong>,</p>
                <p>Welcome to the April 2025 edition of the Turbify Newsletter! Here's a round-up of the latest updates, achievements, and stories from across our teams.</p>
            </div>

            <div class="section">
                <h3>📊 Business Team Updates</h3>
                <ul>
                    <li>Onboarded 5 new enterprise clients this month</li>
                    <li>Rolled out the new dynamic pricing model across key markets</li>
                    <li>Collaborated with Marketing for a successful Q2 campaign launch</li>
                </ul>
            </div>

            <div class="section">
                <h3>🏆 Awards & Performer of the Month</h3>
                <p>👏 <strong>Congratulations to Priya Desai (QA Team)</strong><br>
                Recognized as Performer of the Month for her dedication, speed in automation efforts, and mentorship. Well deserved!</p>
            </div>

            <div class="section">
                <h3>🌟 Monthly Spotlight</h3>
                <div style="text-align: center;">
                    <p><strong>Meet Sarah Johnson</strong></p>
                    <p><strong>Role:</strong> Senior Developer<br>
                    <strong>Tenure:</strong> 2 years<br>
                    <strong>Key Projects:</strong> API Gateway, Cloud Migration</p>
                </div>
            </div>

            <div class="section">
                <h3>🎉 New Joiners & Birthdays – April 2025</h3>
                <h4>👋 Welcome to the Team!</h4>
                <ul>
                    <li>Anita Mehra – Software Engineer, Platform Team</li>
                    <li>Sahil Reddy – QA Analyst, Enterprise QA</li>
                    <li>Ritika Shah – Product Manager, LocalWorks</li>
                </ul>
            </div>
            ${imageSection}
        </div>

        <div class="footer">
            <p>Let's keep the momentum going — here's to another successful month at Turbify! 🚀</p>
        </div>
    </div>
</body>
</html>`;
}

app.post('/api/newsletter/send', upload.array('images'), async (req, res) => {
    try {
        const { emails } = req.body;
        const emailList = typeof emails === 'string' ? emails.split(',') : emails;
        
        const attachments = req.files ? req.files.map((file, index) => ({
            filename: file.originalname,
            path: file.path,
            cid: `image${index}`
        })) : [];
        
        for (const email of emailList) {
            const recipientName = extractNameFromEmail(email.trim());
            const htmlContent = getNewsletterHTML(recipientName, attachments);
            
            await transporter.sendMail({
                from: 'dharanigunasekar2003@gmail.com',
                to: email.trim(),
                subject: 'Turbify Monthly Newsletter - April 2025',
                html: htmlContent,
                attachments: attachments
            });
        }
        
        if (req.files) {
            req.files.forEach(file => fs.unlinkSync(file.path));
        }
        
        res.json({ message: `Newsletter sent successfully to ${emailList.length} recipients` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3002, () => {
    console.log('Newsletter server running on http://localhost:3002');
});