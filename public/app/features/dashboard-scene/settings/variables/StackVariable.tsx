import { Observable, of } from 'rxjs';

import { t } from '@grafana/i18n';
import {
  MultiOrSingleValueSelect,
  MultiValueVariable,
  MultiValueVariableState,
  SceneComponentProps,
  SceneVariable,
  VariableDependencyConfig,
  VariableGetOptionsArgs,
  VariableValue,
  VariableValueOption,
} from '@grafana/scenes';
import { Resource } from 'app/features/apiserver/types';
import {
  DataSourceStackModeSpec,
  DataSourceStackSpec,
  fetchStacks,
} from 'app/features/datasources/api/stacksApi';

export type StackVariableValue = Record<string, string>;

export interface StackVariableState extends MultiValueVariableState {
  type: 'stack';
  value: string; // mode value

  label: string; // mode name (stg, prod etc.)
  selectedStack: Resource<DataSourceStackSpec> | null;
  stackList: Array<Resource<DataSourceStackSpec>>;
  properties: StackVariableValue; // properties for the current selected mode
}

export class StackVariable extends MultiValueVariable<StackVariableState> {
  protected _variableDependency = new VariableDependencyConfig(this, {
    statePaths: ['value'], //stackList?
  });

  public constructor(initialState: Partial<StackVariableState>) {
    super({
      type: 'stack',
      label: t('variables.stack.label', 'Stack'),
      selectedStack: null,
      name: 'stack',
      value: '',
      stackList: [],
      text: '',
      options: [],
      properties: {},
      ...initialState,
    });
  }

  /**
   * Loads all available stacks from the API
   */
  public async loadStackList(): Promise<void> {
    try {
      this.setState({ loading: true, error: null });
      const stackList = await fetchStacks();
      this.setState({ stackList, loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load stacks';
      this.setState({ error: message, loading: false });
    }
  }

  /**
   * Sets the selected stack by name and fetches its details
   */
  public async setStack(stackName: string): Promise<void> {
    try {
      this.setState({ loading: true, error: null });
      const selectedStack = this.state.stackList.find((stack) => stack.metadata.name === stackName);
      // Clear current value and properties when changing stack
      this.setState({
        selectedStack,
        value: '',
        properties: {},
        loading: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load stack';
      this.setState({ error: message, loading: false });
    }
  }
  public changeValueTo(value: VariableValue, text?: VariableValue, isUserAction?: boolean): void {
    this.setValue(String(value));
    super.changeValueTo(value, text, isUserAction);
  }
  public setValue(value: string): void {
    const stack = this.state.selectedStack;
    let properties: StackVariableValue = {};

    if (stack) {
      const selectedMode = stack.spec.modes.find((mode) => mode.name === value);
      if (selectedMode) {
        properties = getOptionValuesFromMode(stack.spec, selectedMode);
      }
    }

    this.setState({ value, properties });
  }

  public getValueOptions(args: VariableGetOptionsArgs): Observable<VariableValueOption[]> {
    if (!this.state.selectedStack) {
      return of([]);
    }

    const spec = this.state.selectedStack.spec;
    const options = spec.modes.map((mode) => ({
      label: mode.name,
      text: mode.name,
      value: mode.name,
      properties: getOptionValuesFromMode(spec, mode),
    }));

    return of(options);
  }

  public static Component = ({ model }: SceneComponentProps<MultiValueVariable>) => {
    return <MultiOrSingleValueSelect model={model} />;
  };
}

const getOptionValuesFromMode = (spec: DataSourceStackSpec, mode: DataSourceStackModeSpec): StackVariableValue => {
  return Object.keys(spec.template).reduce<StackVariableValue>((optionValue, templateId) => {
    const templateName = spec.template[templateId].name;
    const modeDefinition = mode.definition[templateId];
    if (modeDefinition) {
      optionValue[templateName] = modeDefinition.dataSourceRef;
    }
    return optionValue;
  }, {});
};

// in scenes
export function isStackVariable(variable: SceneVariable): variable is StackVariable {
  return variable.state.type === 'stack';
}
