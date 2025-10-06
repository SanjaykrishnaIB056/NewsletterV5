const mongoose = require('mongoose');
const TemplateConfig = require('./models/TemplateConfig');
require('dotenv').config();

async function updateTemplates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find and update the default template
    const defaultTemplate = await TemplateConfig.findOne({ isDefault: true });
    
    if (defaultTemplate) {
      console.log('Updating existing default template...');
      
      // Update with new configuration including SRE and QA sections
      const newConfig = TemplateConfig.getDefaultConfig();
      defaultTemplate.sections = newConfig.sections;
      
      await defaultTemplate.save();
      console.log('Default template updated successfully with new colors!');
      console.log('Updated sections:', JSON.stringify(defaultTemplate.sections, null, 2));
    } else {
      console.log('No default template found, creating new one...');
      
      // Create new default template
      const defaultConfig = TemplateConfig.getDefaultConfig();
      const template = new TemplateConfig(defaultConfig);
      
      await template.save();
      console.log('New default template created successfully!');
    }
    
  } catch (error) {
    console.error('Error updating templates:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updateTemplates();