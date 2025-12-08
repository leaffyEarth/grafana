import { ScopedResourceClient } from 'app/features/apiserver/client';
import { Resource, ResourceList, GroupVersionResource } from 'app/features/apiserver/types';

// Define the DataSourceStack spec type based on the backend Go types
export interface DataSourceStackTemplateItem {
  group: string;
  name: string;
}

export interface DataSourceStackModeItem {
  dataSourceRef: string;
}

export interface DataSourceStackModeSpec {
  name: string;
  uid: string;
  definition: Record<string, DataSourceStackModeItem>;
}

export interface DataSourceStackSpec {
  template: Record<string, DataSourceStackTemplateItem>;
  modes: DataSourceStackModeSpec[];
}

// GroupVersionResource for datasourcestacks
const datasourceStacksGVR: GroupVersionResource = {
  group: 'collections.grafana.app',
  version: 'v1alpha1',
  resource: 'datasourcestacks',
};

// Singleton client instance
const datasourceStacksClient = new ScopedResourceClient<DataSourceStackSpec>(datasourceStacksGVR);

/**
 * Fetches all datasource stacks from the API
 */
export async function fetchStacks(): Promise<Resource<DataSourceStackSpec>[]> {
  const response: ResourceList<DataSourceStackSpec> = await datasourceStacksClient.list();
  return response.items;
}

/**
 * Fetches a single datasource stack by name
 */
export async function fetchStack(name: string): Promise<Resource<DataSourceStackSpec>> {
  return datasourceStacksClient.get(name);
}

/**
 * Creates a new datasource stack
 */
export async function createStack(
  name: string,
  spec: DataSourceStackSpec
): Promise<Resource<DataSourceStackSpec>> {
  return datasourceStacksClient.create({
    metadata: { name },
    spec,
  });
}

/**
 * Updates an existing datasource stack
 */
export async function updateStack(
  existingStack: Resource<DataSourceStackSpec>,
  spec: DataSourceStackSpec
): Promise<Resource<DataSourceStackSpec>> {
  return datasourceStacksClient.update({
    ...existingStack,
    spec,
  });
}

/**
 * Deletes a datasource stack by name
 */
export async function deleteStack(name: string): Promise<void> {
  await datasourceStacksClient.delete(name, false);
}

/**
 * Returns the underlying client for advanced operations
 */
export function getStacksClient(): ScopedResourceClient<DataSourceStackSpec> {
  return datasourceStacksClient;
}

