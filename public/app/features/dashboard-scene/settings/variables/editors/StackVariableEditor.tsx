import { useState } from 'react';
import { useEffectOnce } from 'react-use';

import { SelectableValue } from '@grafana/data';
import { t, Trans } from '@grafana/i18n';
import { SceneVariable, SceneVariableState } from '@grafana/scenes';
import { Input } from '@grafana/ui';
import { OptionsPaneItemDescriptor } from 'app/features/dashboard/components/PanelEditor/OptionsPaneItemDescriptor';

import { StackVariable } from '../StackVariable';
import { VariableLegend } from '../components/VariableLegend';
import { VariableSelectField } from '../components/VariableSelectField';


interface StackVariableEditorProps {
  variable: StackVariable;
  onRunQuery: () => void;
}

export function StackVariableEditor({ variable, onRunQuery }: StackVariableEditorProps) {
  const [stackList, setStackList] = useState<Stack[]>([]);
const [selectedStack, setSelectedStack] = useState<string>(variable.useState().selectedStack?.id || '');
  useEffectOnce(() => {
    // fetch stacks
    setStackList([stackMock]);
  });

  const onSelectStack = (value: SelectableValue<string>) => {
    variable.setStack(value.value || '')
    setSelectedStack(value.value || '');
  };

  return (
    <>
      <VariableLegend>
        <Trans i18nKey="dashboard-scene.nope">Stack selection</Trans>
      </VariableLegend>
      <VariableSelectField
        name={t('variables.label.stack', 'Stack')}
        description={t('variables.label-stack-sub', 'Select a datasource stack to use')}
        value={{label: stackList.find((s) => s.uid === selectedStack)?.name, value: selectedStack}}
        options={stackList.map((stack) => ({ label: stack.name, value: stack.uid }))}
        onChange={onSelectStack}
        //.  testId={testId}
        width={25}
      />
    </>
  );
}


export interface Stack {
  uid: string;
  name: string;
  modes: StackMode[];
  template: StackTemplate;
}

interface StackMode {
  name: string;
  definition: Record<string, { uid: string }>;
}
interface StackTemplate {
  [key: string]: {
    group: string;
    name: string;
  };
}

const stackMock: Stack = {
  name: 'LGTM-stack',
  uid: '123543453245645',
  template: {
    lokifromauid: {
      group: 'loki',
      name: 'lokifroma',
    },
    lokifrombuid: {
      group: 'loki',
      name: 'lokifromb',
    },
    tempouid: {
      group: 'tempo',
      name: 'tempo',
    },
    promuid: {
      group: 'prometheus',
      name: 'prometheus',
    },
  },
  modes: [
    {
      name: 'prod',
      definition: {
        lokifromauid: {
          uid: 'P0280BEB2D3524208',
        },
        lokifrombuid: {
          uid: 'P7DC3E4760CFAC4AK',
        },
        tempouid: {
          uid: 'P7DC3E4760CFAC4AK',
        },
        promuid: {
          uid: 'P693D0419BB394192',
        },
      },
    },
    {
      name: 'dev',
      definition: {
        lokifromauid: {
          uid: 'P7DC3E4760CFAC4AK',
        },
        lokifrombuid: {
          uid: 'P693D0419BB394192',
        },
        tempouid: {
          uid: 'bf0cgxsa8lrswe',
        },
        promuid: {
          uid: 'bf0cgxsa8lrswe',
        },
      },
    },
  ],
};


export function getStackVariableOptions(variable: SceneVariable<SceneVariableState>): OptionsPaneItemDescriptor[] {
  return [new OptionsPaneItemDescriptor({
        title: t('dashboard-scene.textbox-variable-form.label-value', 'Value'),
        id: `variable-${variable.state.name}-value`,
        render: () => <Input label="get variable options"/>,
      })] 
  
}
