import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import type { ReactNode } from 'react'

export type DataTableColumn<Row> = {
  id: string
  label: string
  align?: 'left' | 'center' | 'right'
  renderCell: (row: Row) => ReactNode
}

type DataTableProps<Row> = {
  ariaLabel: string
  columns: readonly DataTableColumn<Row>[]
  rows: readonly Row[]
  getRowId: (row: Row) => string
}

export function DataTable<Row>({
  ariaLabel,
  columns,
  rows,
  getRowId,
}: DataTableProps<Row>) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table aria-label={ariaLabel}>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                align={column.align}
                key={column.id}
                scope="col"
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow hover key={getRowId(row)}>
              {columns.map((column) => (
                <TableCell align={column.align} key={column.id}>
                  {column.renderCell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
