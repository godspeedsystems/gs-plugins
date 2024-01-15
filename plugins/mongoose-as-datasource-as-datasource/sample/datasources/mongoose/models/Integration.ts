const { model, Schema, Document } =require('mongoose');

const IntegrationConfigSchema = new Schema(
  {
    partnerName: {
      type: String,
      required: true,
    },
    productType: {
      type: String,
      required: true,
    },
    code: String
  },
  { timestamps: true }
);


const IntegrationModel = model('integration-master', IntegrationConfigSchema, 'integration-master');
module.exports = {
    type: 'IntegrationModel',
    model: IntegrationModel
};