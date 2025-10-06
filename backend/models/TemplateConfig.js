const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  headingOnly: { type: Boolean, default: false }, // Show only as heading without content editor
  color: { type: String, default: '#f97316' }, // Orange color
  order: { type: Number, default: 0 },
  content: { type: String, default: '' }, // Quill HTML content
  children: [this] // Self-referencing for nested sections
}, { _id: false });

const templateConfigSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  isDefault: { type: Boolean, default: false },
  sections: [sectionSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Default template configuration
templateConfigSchema.statics.getDefaultConfig = function() {
  return {
    name: 'Engineering Team Template',
    description: 'Default template with Engineering Team structure',
    isDefault: true,
    sections: [
      {
        id: 'engineering-team',
        title: 'Engineering Team',
        enabled: true,
        headingOnly: false,
        color: '#1f2937',
        order: 1,
        content: '',
        children: [
          {
            id: 'product-development',
            title: 'Product Development',
            enabled: true,
            headingOnly: false,
            color: '#3b82f6',
            order: 1,
            content: '',
            children: [
              {
                id: 'platform',
                title: 'Platform',
                enabled: true,
                headingOnly: false,
                color: '#3b82f6',
                order: 1,
                content: ''
              },
              {
                id: 'presales',
                title: 'Presales',
                enabled: true,
                headingOnly: false,
                color: '#3b82f6',
                order: 2,
                content: ''
              },
              {
                id: 'local-works',
                title: 'Local Works',
                enabled: true,
                headingOnly: false,
                color: '#3b82f6',
                order: 3,
                content: ''
              },
              {
                id: 'stores',
                title: 'Stores',
                enabled: true,
                headingOnly: false,
                color: '#3b82f6',
                order: 4,
                content: ''
              }
            ]
          },
          {
            id: 'sre',
            title: 'SRE',
            enabled: true,
            headingOnly: false,
            color: '#10b981',
            order: 2,
            content: '',
            children: []
          },
          {
            id: 'qa',
            title: 'QA',
            enabled: true,
            headingOnly: false,
            color: '#f59e0b',
            order: 3,
            content: '',
            children: []
          }
        ]
      }
    ]
  };
};

module.exports = mongoose.model('TemplateConfig', templateConfigSchema);