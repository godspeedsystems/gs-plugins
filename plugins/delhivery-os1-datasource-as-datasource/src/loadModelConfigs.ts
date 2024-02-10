import { yamlLoader } from '@godspeedsystems/core';
import { PlainObject } from '@godspeedsystems/core';
const mappings = yamlLoader(`${process.cwd()}/dist/mappings`).os1;
export default function loadOS1Config() {
	let model: PlainObject = yamlLoader(`${process.cwd()}/dist/datasources/os1/model/entity-types`);
	model = expandNestedValues(model);
	Object.keys(model).forEach((entityType) => {
		prepareEntityModels(entityType, model[entityType]);
	});
    return model;
}

function prepareEntityModels(et:string, em: PlainObject) {
	enrichEntityTypeSchemas(em);
	enrichTemplateDefinitions(et, em);
	generateStateMachineConfig(em);
}

function enrichEntityTypeSchemas(em: PlainObject) {
	const schema = em.schema;
	schema.callback = mappings.callback;
	if (schema.states) {
		schema.isStateMachineEnabled = true;
	}
	const states = em.states;
	let events: string[] = [];
	Object.keys(states).forEach((state) => {
		const substates: PlainObject[] = states[state];
		substates.forEach((substateConfig) => {
			const substateName = Object.keys(substateConfig)[0];
			if (substateConfig[substateName]) {
				const substateEvents = Object.keys(substateConfig[substateName]);
				events = events.concat(substateEvents);
			};
		});
	});
	schema.events = events;
}
/**
 * Check the templates folder, with category subfolders and their subcat files
 * Transform that to template config for calling OS1 api to create or modify templates
 */
function enrichTemplateDefinitions(et: string, em: PlainObject) {
	Object.keys(em.templates)
	.forEach((cat) => {
		const subcatsConfigs = em.templates[cat];
		Object.keys(subcatsConfigs)
		.forEach((subcat) => {
			const subcatConfig = subcatsConfigs[subcat];
			const enrichParams = {
				name: cat + '-' + subcat,
				subCategory: subcat,
				callback: mappings.callback
			};
			Object.assign(subcatConfig, enrichParams);
		});
	});
}

/**
 * Input is the config of entity-type's states, substates
 *  & events in {entity-type}/states.yaml of the project
 * Transform it to comply to OS1 state-machine PUT call
 */
function generateStateMachineConfig(em: PlainObject) {

	const states = em.states;
	const transformedStates: PlainObject[] = [];
	Object.keys(states).forEach((state) => {
		const substates: PlainObject[] = states[state];
		const stateConfig: PlainObject = {
			name: state,
			defaultSubState: Object.keys(substates[0])[0],
			subStates: [] as PlainObject[]
		};
		substates.forEach((substateConfig) => {
			const substateName = Object.keys(substateConfig)[0];
			const transformedConfig = {
				name: substateName,
				transitions: [] as PlainObject[]
			};
			Object.keys(substateConfig[substateName] || {})
			.forEach((eventCode: string) => {
				transformedConfig.transitions.push({
					eventCode,
					destination: substateConfig[substateName][eventCode]
				})
				
			});
			stateConfig.subStates.push(transformedConfig);
		});
		transformedStates.push(stateConfig);
	});
	em.states = {
		states: transformedStates,
		callback: mappings.callback.url
	};
}

function expandNestedValues(flatObject: PlainObject): PlainObject {
	const keys = Object.keys(flatObject);
	const o: PlainObject = {};
	for (let key of keys) {
		const nestedKeys = key.split('.');
		let no = o;
		for (let i = 0; i < nestedKeys.length; i++) {
			const nk = nestedKeys[i];
			
			if (i < nestedKeys.length - 1) {
				no[nk] = no[nk] || {};
				no = no[nk];
			} else {
				no[nk] = flatObject[key];
			}
			
		}
	}
	return o;
}
