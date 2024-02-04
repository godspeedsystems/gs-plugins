import { EntityTypeApi, EntityTypeCreateSchema } from "./api";
require('dotenv').config()
const api = new EntityTypeApi();
const tenantId = process.env.X_COREOS_TID || "";
const token = process.env.X_COREOS_ACCESS || "";
const appId = process.env.X_COREOS_APPID || "";
// api.getEntityTypes("d",tenantId,token,appId,token)
// .then((res) => console.log(res.data.data.entityTypes))
// .catch((e) => console.error(e.response.data))

const entityData: EntityTypeCreateSchema = {name: {plural: "operators", singular: "operator"}} ;

// api.addEntityType("d",tenantId,token,appId,token, entityData )
api.getEntityTypes("",tenantId, token,appId,token,)
api.addEntityType("d",tenantId,token,appId,token, entityData,)
.then((res) => console.log(res.data.data))
.catch((e) => console.error(e.response.data))