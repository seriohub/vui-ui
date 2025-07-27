'use client';

import React, { useMemo } from 'react';
import { List, Text } from '@mantine/core';
import type { MRT_ColumnDef } from 'mantine-react-table';

import { GenericMRTTableLayout } from '@/components/Features/Velero/GenericMRTTableLayout';

export const DiagnosticMRT = ({
                                uiURL,
                                apiURL,
                                apiArch,
                                origins,
                                k8sHealth,
                                stateManager,
                              }: any) => {
  const data = [
    {
      label: 'Get UI URL',
      value: uiURL !== undefined ? uiURL : '',
      status: stateManager.getVariable('getUiURL') ? 'ok' : 'error',
    },
    {
      label: 'Get API URL',
      value: apiURL !== undefined ? `${apiURL}/` : '',
      status: stateManager.getVariable('getApiURL') ? 'ok' : 'error',
    },
    {
      label: 'API available',
      value: '',
      status: stateManager.getVariable('checkApiReachable') ? 'ok' : 'error',
    },
    {
      label: 'Get API architecture',
      value: `${apiArch?.arch} ${apiArch?.platform || ''}`,
      status: stateManager.getVariable('getArchitecture') ? 'ok' : 'error',
    },
    {
      label: 'Get Origins',
      value: origins ? origins?.join(', ') : '',
      status: stateManager.getVariable('getOrigins') ? 'ok' : 'error',
    },
    {
      label: 'Validate Origins',
      status: stateManager.getVariable('validateOrigins') ? 'ok' : 'error',
      warning: [origins?.length > 0 && origins?.includes('*') ? 'Warning: ORIGINS contains "*"' : ''],
      error: [
        origins?.length === 0 || (origins?.length > 0 && !origins?.includes(uiURL))
          ? `Error: Origins must contain ${uiURL}`
          : '',
      ],
      value: [
        !origins?.includes('*') && origins?.length > 0 && !origins?.includes(uiURL)
          ? "If you have problems you can try to use '*'"
          : '',
      ].filter((msg) => msg !== ''),
    },

    {
      label: 'Get cluster data',
      status: stateManager.getVariable('getClusterHealth') ? 'ok' : 'error',
      value: [
        `Online: ${k8sHealth?.cluster_online ? 'true' : 'false'}`,
        `Nodes: ${k8sHealth?.nodes?.total}`,
        `Nodes not ready: ${k8sHealth?.nodes?.in_error}`,
      ],
    },
  ];

  if (stateManager.getVariable('getWatchdogInfo')) {
    data.push({
      label: 'Check Watchdog',
      status: stateManager.getVariable('getWatchdogInfo') ? 'ok' : 'error',
      value: '',
    })
  }

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'label',
        header: 'Component',
      },
      {
        accessorKey: 'value',
        header: 'Value',
        Cell: ({ row }) => <>
          {Array.isArray(row.original.value) && row.original.value.length > 0 && (
            <List>
              {row.original.value.map((item: any) => (
                <List.Item key={item}>
                  <Text size="sm">{item}</Text>
                </List.Item>
              ))}
            </List>
          )}
          {!Array.isArray(row.original.value) && (
            <Text size="sm">
              {row.original.value}
            </Text>
          )}
        </>,
      },
      {
        accessorKey: 'status',
        Cell: ({ row }) => <>{row.original.status?.toString()}</>,
        header: 'Status',
      },
      {
        accessorKey: 'warning',
        header: 'Warning',
        Cell: ({ row }) => <>{row.original.warning?.join(', ')}</>,
      },
      {
        accessorKey: 'error',
        header: 'Error',
        Cell: ({ row }: any) => <>{row.original.error?.join(', ')}</>,
      },
    ],
    [],
  );

  return (
    <GenericMRTTableLayout
      name='diagnostic'
      items={data || []}
      columns={columns}
      initialState={{
        density: 'xs',
      }}
      enableRowActions={false}
      enableGlobalFilter={false}
      enableTopToolbar={false}
      enablePagination={false}
    />
  );
};
