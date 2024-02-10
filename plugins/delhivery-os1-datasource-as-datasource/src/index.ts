import {DataSource} from '@godspeedsystems/plugins-axios-as-datasource';
export default DataSource;

const SourceType = 'DS';
const Type = "delhivery-os1-datasource"; // this is the loader file of the plugin, So the final loader file will be `types/${Type.js}`
const CONFIG_FILE_NAME = "delhivery-os1-datasource"; // in case of event source, this also works as event identifier, and in case of datasource works as datasource name
const DEFAULT_CONFIG = {};

export {
  DataSource,
  SourceType,
  Type,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG
}
