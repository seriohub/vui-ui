'use client';

import React from "react";
import { ActionIcon, Center, Divider, Flex, Indicator, Title, Tooltip, } from '@mantine/core';
import { IconFilterOff, IconRefresh, IconSettingsX, } from '@tabler/icons-react';
import {
  MantineReactTable,
  MRT_GlobalFilterTextInput,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  useMantineReactTable,
} from 'mantine-react-table';

import { usePersistentTableState } from '@/hooks/usePersistentTableState';

export function GenericMRTTableLayout({
                                        name,
                                        title,
                                        setReload,
                                        initialState = {},
                                        renderRowActions,
                                        items,
                                        fetching,
                                        columns,
                                        renderRowActionMenuItems,
                                        customActions,
                                        showLoading = true,
                                        mantinePaperPropsContent = { style: { height: "100%" } },
                                        mantineTableContainerPropsContent = { style: { height: "calc(100% - 112px)" } },
                                        enableRowActions = true,
                                        enablePagination = true,
                                        enableTopToolbar = true,
                                        enableBottomToolbar = true,
                                        enableGrouping = true,
                                        enableRefreshButton = true,
                                      }:
                                      any
) {

  // set a default initial states if missing
  if (!('showGlobalFilter' in initialState)) {
    initialState.showGlobalFilter = true;
  }
  if (!('density' in initialState)) {
    initialState.density = 'md';
  }
  if (!('columnPinning' in initialState)) {
    initialState.columnPinning = { right: ['mrt-row-actions'] };
  }

  // persistent data layout
  const {
    columnVisibility,
    setColumnVisibility,
    columnFilters,
    setColumnFilters,
    sorting,
    setSorting,
    pagination,
    setPagination,
    columnOrder,
    setColumnOrder,
    density,
    setDensity,
    globalFilter,
    setGlobalFilter,
    grouping,
    setGrouping,
    columnSizing,
    setColumnSizing,
    columnPinning,
    setColumnPinning,
    resetTableState,
  } = usePersistentTableState(`${name}-table`, initialState);

  const table = useMantineReactTable({
    columns,
    data: items,
    layoutMode: 'grid',

    enableSorting: true,
    enableColumnOrdering: true,
    enableDensityToggle: true,
    enableRowActions: enableRowActions,
    positionActionsColumn: 'last',
    enablePagination: enablePagination,
    enableColumnResizing: true,
    enableTopToolbar: enableTopToolbar,
    enableBottomToolbar: enableBottomToolbar,
    enableColumnPinning: true,
    enableRowVirtualization: true,

    initialState: initialState,

    state: {
      grouping,
      columnVisibility,
      columnFilters,
      sorting,
      pagination,
      columnOrder,
      density,
      globalFilter,
      isLoading: showLoading && fetching && items?.length === 0,
      showProgressBars: fetching,
      columnSizing,
      columnPinning
    },

    mantineTableContainerProps: { ...mantineTableContainerPropsContent },

    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnOrderChange: setColumnOrder,
    onDensityChange: setDensity,
    onGlobalFilterChange: setGlobalFilter,
    onGroupingChange: setGrouping,
    onColumnSizingChange: setColumnSizing,
    onColumnPinningChange: setColumnPinning,

    positionGlobalFilter: 'none',
    positionToolbarAlertBanner: 'bottom',
    enableGlobalFilter: true,
    enableFilterMatchHighlighting: true,
    enableGlobalFilterModes: true,
    enableGrouping: enableGrouping,

    renderRowActions,
    renderRowActionMenuItems,

    renderTopToolbarCustomActions: ({ table }) => (
      <>
        <Flex gap='xs'>
          {title && (<Center><Title order={4} mr={10}>{title}</Title></Center>)}
          {enableRefreshButton && (
            <Tooltip label="Refresh">
              <ActionIcon
                h={38}
                w={38}
                variant="default"
                className="react-table-custom-action"
                onClick={() => setReload((prev: number) => prev + 1)}
              >
                <IconRefresh/>
              </ActionIcon>
            </Tooltip>
          )}
          <Divider orientation="vertical"/>
          <MRT_GlobalFilterTextInput table={table} style={{ width: '400px' }}/>
          <Tooltip label="Clear All Filter">
            <Indicator inline label={(globalFilter?.length > 0 ? 1 : 0) + table.getState().columnFilters.length}
                       size={16}
                       disabled={(!globalFilter?.length && table.getState().columnFilters.length == 0)}>
              <ActionIcon
                h={38}
                variant="default"
                className="react-table-custom-action"
                onClick={() => {
                  setGlobalFilter('')
                  setColumnFilters([])
                }}
                disabled={!globalFilter?.length && table.getState().columnFilters.length === 0}
              >
                <IconFilterOff/>
              </ActionIcon>
            </Indicator>
          </Tooltip>
          <Divider orientation="vertical"/>
          {customActions}
        </Flex>
      </>
    ),

    renderToolbarInternalActions: ({ table }) => (
      <Flex gap="xs" align="center">
        <Tooltip label="Reset table view">
          <ActionIcon variant="subtle"
                      className="react-table-custom-action"
                      onClick={() => {
                        resetTableState();
                        table.resetColumnOrder(true);
                        /*setTimeout(() => {
                          const reordered = table
                            .getAllLeafColumns()
                            .map((col) => col.id)
                            .filter((id) => id !== 'mrt-row-actions');
                          table.setColumnOrder([...reordered, 'mrt-row-actions']);
                        }, 10);*/
                      }}>
            <IconSettingsX/>
          </ActionIcon>
        </Tooltip>
        <MRT_ToggleFiltersButton table={table}/>
        <MRT_ShowHideColumnsButton table={table}/>
        <MRT_ToggleDensePaddingButton table={table}/>
        <MRT_ToggleFullScreenButton table={table}/>
      </Flex>
    ),

    defaultColumn: {
      minSize: 50,
      // maxSize: 1000,
      size: 200
    },

    mantineTableProps: {
      striped: true,
    },

    mantineSearchTextInputProps: {
      placeholder: `Search ${items.length} rows`,
      // style: { minWidth: '800px' },
      // variant: 'filled',
    },

    mantineTableHeadCellProps: {
      style: {
        '--header-mrt_row_expand-size': '100',
        '--header-mrt_row_actions-size': '200',
      },
    },

    mantinePaperProps: {
      ...mantinePaperPropsContent
    },

    mantineTableBodyCellProps: {
      style: {
        '--col-mrt_row_expand-size': '100',
        '--col-mrt_row_actions-size': '200',
      },
    },
  });

  return <MantineReactTable table={table}/>
}
