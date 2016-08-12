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
import java.sql.Statement;
import java.sql.Timestamp;

//Need to suppress the close connection warning, as if you close the connection it messes up liquibase
@edu.umd.cs.findbugs.annotations.SuppressFBWarnings({"OBL_UNSATISFIED_OBLIGATION"})
@Component
public class MigrateProcessData implements CustomTaskChange {
	private static final Logger LOGGER = Logger.getLogger(MigrateProcessData.class);

	@Override
	public void execute(final Database database) throws CustomChangeException {
		final JdbcConnection conn = (JdbcConnection) database.getConnection();
		try {

			conn.setAutoCommit(false);

			String selectProcessTitlesSQL = "SELECT DISTINCT title " +
			                                "FROM (SELECT id, title FROM OldProcess ORDER BY id ASC) AS titles";

			PreparedStatement selectProcessTitlesQueryStmt = conn.prepareStatement(selectProcessTitlesSQL);
			ResultSet selectProcessTitlesResultSet = selectProcessTitlesQueryStmt.executeQuery();

			while (selectProcessTitlesResultSet.next()) {

				String processTitle = selectProcessTitlesResultSet.getString("title");
				String processDescription = "";
				Timestamp processCreateDate = null;
				Timestamp processUpdateDate = null;

				final String selectProcessDescriptionSQL =
					"SELECT description FROM OldProcess WHERE title = ? " +
					"AND sequence IN (SELECT MAX(sequence) FROM OldProcess WHERE title = ?)";
				final PreparedStatement selectProcessDescriptionStmt =
						conn.prepareStatement(selectProcessDescriptionSQL);
				selectProcessDescriptionStmt.setString(1, processTitle);
				selectProcessDescriptionStmt.setString(2, processTitle);
				ResultSet selectProcessDescriptionResultSet = selectProcessDescriptionStmt.executeQuery();

				while (selectProcessDescriptionResultSet.next()) {
					processDescription = selectProcessDescriptionResultSet.getString("description");
				}

				final String selectProcessDatesSQL =
						"SELECT MIN(createDate) AS createDate, MAX(updateDate) AS updateDate " +
						"FROM OldProcess WHERE title = ?";
				final PreparedStatement selectProcessDatesStmt = conn.prepareStatement(selectProcessDatesSQL);
				selectProcessDatesStmt.setString(1, processTitle);
				ResultSet selectProcessDatesResultSet = selectProcessDatesStmt.executeQuery();

				while (selectProcessDatesResultSet.next()) {
					processCreateDate = selectProcessDatesResultSet.getTimestamp("createDate");
					processUpdateDate = selectProcessDatesResultSet.getTimestamp("updateDate");
				}

				final String insertIntoNewProcessTableSQL =
						"INSERT INTO Process (title, description, createDate, updateDate) VALUES (?, ?, ?, ?)";
				final PreparedStatement insertIntoNewProcessTableStmt =
						conn.prepareStatement(insertIntoNewProcessTableSQL, Statement.RETURN_GENERATED_KEYS);
				insertIntoNewProcessTableStmt.setString(1, processTitle);
				insertIntoNewProcessTableStmt.setString(2, processDescription);
				insertIntoNewProcessTableStmt.setTimestamp(3, processCreateDate);
				insertIntoNewProcessTableStmt.setTimestamp(4, processUpdateDate);
				insertIntoNewProcessTableStmt.executeUpdate();
				ResultSet insertIntoNewProcessTableResultSet = insertIntoNewProcessTableStmt.getGeneratedKeys();

				while (insertIntoNewProcessTableResultSet.next()) {

					int processId = insertIntoNewProcessTableResultSet.getInt(1);

					String selectProcessVersionDataSQL =
							"SELECT name, versionComment, description, createDate, updateDate, sequence, version, file " +
							"FROM OldProcess WHERE title = ? ORDER BY id ASC";

					PreparedStatement selectProcessVersionDataQueryStmt = conn.prepareStatement(selectProcessVersionDataSQL);
					selectProcessVersionDataQueryStmt.setString(1, processTitle);
					ResultSet selectProcessVersionDataResultSet = selectProcessVersionDataQueryStmt.executeQuery();

					while (selectProcessVersionDataResultSet.next()) {

						final String insertIntoNewProcessVersionTableSQL =
								"INSERT INTO ProcessVersion " +
								"(process_id, fileName, comment, description, createDate, updateDate, sequence, versionKey, file)" +
								"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
						final PreparedStatement insertIntoNewProcessVersionTableStmt =
								conn.prepareStatement(insertIntoNewProcessVersionTableSQL);
						insertIntoNewProcessVersionTableStmt.setInt(1, processId);
						insertIntoNewProcessVersionTableStmt.setString(2, selectProcessVersionDataResultSet.getString("name"));
						insertIntoNewProcessVersionTableStmt.setString(3, selectProcessVersionDataResultSet.getString("versionComment"));
						insertIntoNewProcessVersionTableStmt.setString(4, selectProcessVersionDataResultSet.getString("description"));
						insertIntoNewProcessVersionTableStmt.setTimestamp(5, selectProcessVersionDataResultSet.getTimestamp("createDate"));
						insertIntoNewProcessVersionTableStmt.setTimestamp(6, selectProcessVersionDataResultSet.getTimestamp("updateDate"));
						insertIntoNewProcessVersionTableStmt.setInt(7, selectProcessVersionDataResultSet.getInt("sequence"));
						insertIntoNewProcessVersionTableStmt.setString(8, selectProcessVersionDataResultSet.getString("version"));
						insertIntoNewProcessVersionTableStmt.setBytes(9, selectProcessVersionDataResultSet.getBytes("file"));
						insertIntoNewProcessVersionTableStmt.executeUpdate();

					}
				}

			}

			conn.commit();

		} catch (DatabaseException | SQLException e) {
			LOGGER.error("Error migrating process data", e);
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
