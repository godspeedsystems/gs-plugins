import { GSContext,  GSDataSource, GSStatus, PlainObject,} from "@godspeedsystems/core";
import * as Excel from "xlsx";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from 'fs';

export default class DataSource extends GSDataSource {
protected async initClient(): Promise<object> {
    return Excel;
}
private getFilePath(): string {
  return this.config.filepath;
}

private async ensureFileExists(): Promise<void> {
  const filePath = this.getFilePath();

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    // If not, create the file
    const sheet = Excel.utils.json_to_sheet([]);
    const workbook = Excel.utils.book_new();
    Excel.utils.book_append_sheet(workbook, sheet, "Sheet1");
    Excel.writeFile(workbook, filePath);

    console.log('File created successfully.');
  }
}

async readData(Excel: typeof import("xlsx")) {
  await this.ensureFileExists(); // Ensure file exists before reading
    const excelFile = path.join(this.config.filepath);
    const workbook = Excel.readFile(excelFile);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = Excel.utils.sheet_to_json(sheet);
    return data;
  }

  async writeData(Excel: typeof import("xlsx"), data: any) {
    const excelFile = path.join(__dirname, this.config.filename);
    const sheet = Excel.utils.json_to_sheet(data);
    const workbook = Excel.utils.book_new();
    Excel.utils.book_append_sheet(workbook, sheet, "Sheet1");
    Excel.writeFile(workbook, excelFile);
  }

  async createData(data: any) {
    await this.ensureFileExists(); // Ensure file exists before reading
    const _data = await this.readData(Excel);
    const newData = { id: uuidv4(), ...data };
    _data.push(newData);
    await this.writeData(Excel, _data);
    return "Data successfully added";
  }

  async searchData() {
    const _data = await this.readData(Excel);
    return _data;
  }

  async updateData(id: string, data: any) {
    const _data = await this.readData(Excel);
    const updateIndex = _data.findIndex((item: any) => item.id === id);
    if (updateIndex !== -1) {
      _data[updateIndex] = { id, ...data };
      await this.writeData(Excel, _data);
      return "Data updated successfully";
    } else {
      return "ID not found";
    }
  }

  async getOneData(id: string) {
    const _data = await this.readData(Excel);
    const index = _data.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      const one = _data[index];
      return one;
    } else {
      return "ID not found";
    }
  }

  async deleteData(id: string) {
    const _data = await this.readData(Excel);
    const deleteIndex = _data.findIndex((item: any) => item.id === id);
    if (deleteIndex !== -1) {
      _data.splice(deleteIndex, 1);
      await this.writeData(Excel, _data);
      return "Data deleted successfully";
    } else {
      return "ID not found";
    }
  }

async execute(ctx: GSContext, args: PlainObject): Promise<any> {
    
    try {
      const {
        meta: { fnNameInWorkflow },
      } = args;
      const method = fnNameInWorkflow.split(".")[2];

      switch (method) {
        case "create":
          return this.createData(args.data);
        case "search":
          return this.searchData();
        case "update":
          return this.updateData(args.id, args.data);
        case "one":
          return this.getOneData(args.id);
        case "delete":
          return this.deleteData(args.id);
        default:
          return "Invalid method";
      }
    } catch (error) {
      throw error;
    }
}
}
const SourceType = 'DS';
const Type = "excel"; // this is the loader file of the plugin, So the final loader file will be `types/${Type.js}`
const CONFIG_FILE_NAME = "excel"; // in case of event source, this also works as event identifier, and in case of datasource works as datasource name
const DEFAULT_CONFIG = {};

export {
  DataSource,
  SourceType,
  Type,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG
}


