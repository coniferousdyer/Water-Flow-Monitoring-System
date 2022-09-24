import { useState } from "react";
import styles from "../styles/components/StatusTable.module.css";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

const StyledTableHeading = styled(TableCell)(() => ({
  [`&.MuiTableCell-root`]: {
    fontWeight: "bold",
  },
}));

const StyledTableCell = styled(TableCell)(({ statuscolor }) => ({
  [`&.MuiTableCell-root`]: {
    color: statuscolor,
    fontWeight: "bold",
  },
}));

const StatusTable = ({ statusData }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Color corresponding to the status code of the update.
  const statusColor = ["black", "green", "blue", "orange", "red"];

  // Number of latest updates to be displayed.
  const numberOfEntries = 50;

  // Handles page change in the table.
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handles change in rows per page.
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Paper elevation={5} className={styles["status-table-container"]}>
      <Toolbar>
        <Typography
          sx={{ flex: "1 1 100%" }}
          color="inherit"
          style={{ fontWeight: "bold" }}
          variant="subtitle1"
          component="div"
        >
          Last {numberOfEntries} Thingspeak/OneM2M Update Statuses
        </Typography>
      </Toolbar>
      <TableContainer>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <StyledTableHeading>Time</StyledTableHeading>
              <StyledTableHeading>oM2M Status</StyledTableHeading>
              <StyledTableHeading>Thingspeak Status</StyledTableHeading>
            </TableRow>
          </TableHead>
          <TableBody>
            {statusData.oneM2M
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((status, index) => {
                return (
                  <TableRow key={page * rowsPerPage + index}>
                    <TableCell>
                      {statusData.times[page * rowsPerPage + index]}
                    </TableCell>
                    <StyledTableCell
                      statuscolor={
                        statusColor[
                          parseInt(
                            statusData.oneM2M[page * rowsPerPage + index] / 100
                          ) - 1
                        ]
                      }
                    >
                      {statusData.oneM2M[page * rowsPerPage + index]}
                    </StyledTableCell>
                    <StyledTableCell
                      statuscolor={
                        statusColor[
                          parseInt(
                            statusData.thingSpeak[page * rowsPerPage + index] /
                              100
                          ) - 1
                        ]
                      }
                    >
                      {statusData.thingSpeak[page * rowsPerPage + index]}
                    </StyledTableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={numberOfEntries}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default StatusTable;
