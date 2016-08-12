package com.clearvision.spectrum.liquibase.customtasks;

import liquibase.change.custom.CustomTaskChange;
import liquibase.database.Database;
import liquibase.database.jvm.JdbcConnection;
import liquibase.exception.CustomChangeException;
import liquibase.exception.DatabaseException;
import liquibase.exception.SetupException;
import liquibase.exception.ValidationErrors;
import liquibase.resource.ResourceAccessor;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Component;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.SimpleDateFormat;

//Need to suppress the close connection warning, as if you close the connection it messes up liquibase
@edu.umd.cs.findbugs.annotations.SuppressFBWarnings({"OBL_UNSATISFIED_OBLIGATION"})
@Component
public class BackfillProcessVersionComment implements CustomTaskChange {
	private static final Logger LOGGER = Logger.getLogger(BackfillProcessVersionComment.class);

	SimpleDateFormat dateFormatter = new SimpleDateFormat("MMM d, YYYY h:mm:ss a");

	@Override
	public void execute(final Database database) throws CustomChangeException {
		final JdbcConnection conn = (JdbcConnection) database.getConnection();
		try {
			conn.setAutoCommit(false);
			String sql = "SELECT id, createDate FROM Process WHERE versionComment IS NULL";
			PreparedStatement queryStmt = conn.prepareStatement(sql);
			ResultSet resultSet = queryStmt.executeQuery();
			while (resultSet.next()) {
				final String insertTableSQL = "UPDATE Process SET versionComment = ? WHERE id = ?";
				final PreparedStatement stmt = conn.prepareStatement(insertTableSQL);
				stmt.setString(1, dateFormatter.format(resultSet.getTimestamp("createDate")));
				stmt.setString(2, resultSet.getString("id"));
				stmt.executeUpdate();
			}
			conn.commit();
		} catch (DatabaseException | SQLException e) {
			LOGGER.error("Error updating previous process version comments to create date", e);
		}
	}

	@Override
	public String getConfirmationMessage() {
		return null;
	}

	@Override
	public void setUp() throws SetupException {

	}

	@Override
	public void setFileOpener(ResourceAccessor resourceAccessor) {

	}

	@Override
	public ValidationErrors validate(Database database) {
		return null;
	}

}
