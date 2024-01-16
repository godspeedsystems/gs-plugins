const { model, Schema } = require('mongoose');
// import { ITemplate } from '../../functions/types/models/templates';

const TemplateConfigSchema = new Schema(
  {
    content: String,
    subject: String,
    name: String,
    module: String,
    type: {
      type: String,
      enum: ['Transaction', 'Reminder'],
    },
    mode: {
      type: String,
      enum: ['Email', 'SMS'],
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
    },
    code: String,
    from: String,
    to: [String],
  },
  { timestamps: true },
);

const Templates = model('templates', TemplateConfigSchema, 'templates');
module.exports = {
    type: 'Templates',
    model: Templates
};