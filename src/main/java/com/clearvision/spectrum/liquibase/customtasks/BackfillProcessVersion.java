package com.clearvision.spectrum.liquibase.customtasks;

import liquibase.change.custom.CustomTaskChange;
import liquibase.database.Database;
import liquibase.database.jvm.JdbcConnection;
import liquibase.exception.CustomChangeException;
import liquibase.exception.DatabaseException;
import liquibase.exception.SetupException;
import liquibase.exception.ValidationErrors;
import liquibase.resource.ResourceAccessor;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.io.IOUtils;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

//Need to suppress the close connection warning, as if you close the connection is messes up liquibase
@edu.umd.cs.findbugs.annotations.SuppressFBWarnings({"OBL_UNSATISFIED_OBLIGATION"})
@Component
public class BackfillProcessVersion implements CustomTaskChange {
	private static final Logger LOGGER = Logger.getLogger(BackfillProcessVersion.class);

	@Override
	public void execute(final Database database) throws CustomChangeException {
		final JdbcConnection conn = (JdbcConnection) database.getConnection();
		try {
			conn.setAutoCommit(false);
			String sql = "SELECT id, version, file FROM Process WHERE version IS NULL";
			PreparedStatement queryStmt = conn.prepareStatement(sql);
			ResultSet resultSet = queryStmt.executeQuery();
			while (resultSet.next()) {
				byte[] processFileByte = IOUtils.toByteArray(resultSet.getBinaryStream("file"));
				String newVersionString = DigestUtils.md5Hex(processFileByte);
				final String insertTableSQL = "UPDATE Process SET version = ? WHERE id = ?";
				final PreparedStatement stmt = conn.prepareStatement(insertTableSQL);
				stmt.setString(1, newVersionString);
				stmt.setString(2, resultSet.getString("id"));
				stmt.executeUpdate();
			}
			conn.commit();
		} catch (DatabaseException | SQLException | IOException e) {
			LOGGER.error("Error updating previous process versions to new hashcode", e);
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
