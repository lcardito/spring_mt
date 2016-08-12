package com.clearvision.spectrum.liquibase.customtasks;

import liquibase.change.custom.CustomTaskChange;
import liquibase.database.Database;
import liquibase.database.jvm.JdbcConnection;
import liquibase.exception.CustomChangeException;
import liquibase.exception.DatabaseException;
import liquibase.exception.SetupException;
import liquibase.exception.ValidationErrors;
import liquibase.resource.ResourceAccessor;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Component;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonValue;
import java.io.StringReader;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Arrays;
import java.util.List;

//Need to suppress the close connection warning, as if you close the connection it messes up liquibase
@SuppressWarnings({"OBL_UNSATISFIED_OBLIGATION"})
@Component
public class MigrateWidgetConfig implements CustomTaskChange {

	private static final Logger LOGGER = Logger.getLogger(MigrateWidgetConfig.class);

    public static final String SELECT_FROM_WIDGET_LAYOUT   = "SELECT * FROM WidgetLayout";
    public static final String SELECT_WIDGET_CONFIG        = "SELECT config FROM WidgetConfig WHERE user_id = ? AND widgetId = ?";
    public static final String INSERT_INTO_DASHBOARD       = "INSERT INTO Dashboard (user_id, title, structure, refreshInterval) VALUES (?, ?, ?, ?)";
    public static final String INSERT_INTO_WIDGET          = "INSERT INTO Widget (dashboard_id, type, columnNumber, widgetOrder, title, autoRefresh, bgColor, txtColor, config) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    public static final String SELECT_USERS_WITH_NO_LAYOUT = "SELECT * FROM CVUser WHERE id NOT IN (SELECT user_id FROM WidgetLayout)";

    private static final List<String> DEFAULT_WIDGETS = Arrays.asList("jira", "confluence-tasks", "confluence-notifications");

    private JdbcConnection jdbcConnection;

    @Override
    public void execute(Database database) throws CustomChangeException {
        jdbcConnection = (JdbcConnection) database.getConnection();

        try {
            jdbcConnection.setAutoCommit(false);
            migrateExistingLayout();
            createDefaultLayout();

        } catch (DatabaseException | SQLException e) {
        	LOGGER.error("Error during migration of layout", e);
        }

    }

    private void createDefaultLayout() throws DatabaseException, SQLException {
        PreparedStatement selectUserWithNoLayout = jdbcConnection.prepareStatement(SELECT_USERS_WITH_NO_LAYOUT);
        ResultSet userWithNoLayoutRs = selectUserWithNoLayout.executeQuery();

        while (userWithNoLayoutRs.next()) {
            int dashBoardId = createDashboard("(1) Header with two columns", userWithNoLayoutRs.getInt("id"), 0);

            for (int widgetOrder = 0; widgetOrder < DEFAULT_WIDGETS.size(); widgetOrder++) {
                insertWidget(dashBoardId, 0, widgetOrder, null, DEFAULT_WIDGETS.get(widgetOrder),
                    DEFAULT_WIDGETS.get(widgetOrder), "#374049", "#FFFFFF", 0);
            }
        }
    }

    private void migrateExistingLayout() throws DatabaseException, SQLException {
        PreparedStatement selectWidgetLayout = jdbcConnection.prepareStatement(SELECT_FROM_WIDGET_LAYOUT);
        ResultSet widgetLayoutRs = selectWidgetLayout.executeQuery();

        while (widgetLayoutRs.next()) {
            String layout = widgetLayoutRs.getString("layout");
            JsonObject layoutJson = Json.createReader(new StringReader(layout)).readObject();
            int userId = widgetLayoutRs.getInt("user_id");
            int refreshInterval = (layoutJson.containsKey("refreshInterval")) ? layoutJson.getInt("refreshInterval") : 0;

            int dashBoardId = createDashboard(layoutJson.getString("structure"), userId, refreshInterval);
            createLayout(layoutJson, userId, dashBoardId);
        }
    }

    private void createLayout(JsonObject layoutJson, int userId, int dashBoardId) throws DatabaseException, SQLException {
        int columnNumber = 0;
        JsonArray layoutRows = layoutJson.getJsonArray("rows");
        for (JsonValue row : layoutRows) {
            JsonObject currentRow = (JsonObject) (row);
            JsonArray columns = currentRow.getJsonArray("columns");

            for (JsonValue columnJson : columns) {
                JsonObject currentColumn = (JsonObject) columnJson;
                JsonArray widgets = currentColumn.getJsonArray("widgets");

                for (int widgetOrder = 0; widgetOrder < widgets.size(); widgetOrder++) {
                    JsonObject currentWidget = widgets.getJsonObject(widgetOrder);
                    String widgetConfig = getWidgetConfig(userId, currentWidget.getJsonObject("config").getInt("id"));
                    String type = getValueFromConfig(currentWidget, "type");
                    String title = getValueFromConfig(currentWidget, "title");
                    String bgColor = getValueFromConfig(currentWidget, "bgcolor");
                    String txtColor = getValueFromConfig(currentWidget, "txtcolor");
                    int autoRefresh = currentWidget.containsKey("autoRefresh") ? Integer.valueOf(currentWidget.getString("autoRefresh")) : 0;

                    insertWidget(dashBoardId, columnNumber, widgetOrder, widgetConfig, type, title, bgColor, txtColor, autoRefresh);
                }
                columnNumber++;
            }
        }
    }

    private String getValueFromConfig(JsonObject widget, String key){
        String value = null;
        if (widget.keySet().contains(key)){
            value = widget.getString(key);
        }
        return value;
    }

    private void insertWidget(int dashBoardId, int columnNumber, int widgetOrder, String widgetConfig, String type, String title, String bgColor, String txtColor, int autoRefresh) throws DatabaseException, SQLException {
        PreparedStatement insertWidgetStm = jdbcConnection.prepareStatement(INSERT_INTO_WIDGET);
        insertWidgetStm.setInt(1, dashBoardId);
        insertWidgetStm.setString(2, type);
        insertWidgetStm.setInt(3, columnNumber);
        insertWidgetStm.setInt(4, widgetOrder);
        insertWidgetStm.setString(5, title);
        insertWidgetStm.setInt(6, autoRefresh);
        insertWidgetStm.setString(7, bgColor);
        insertWidgetStm.setString(8, txtColor);
        insertWidgetStm.setString(9, sanitizeConfig(widgetConfig));
        insertWidgetStm.executeUpdate();
    }

    private String sanitizeConfig(String config) {
    	if (StringUtils.isEmpty(config)) {
    		return "{}";
    	}
    	try {
    		JsonObject configObject = Json.createReader(new StringReader(config)).readObject();
    		JsonObjectBuilder jsonBuilder = Json.createObjectBuilder();
    		for (String name : configObject.keySet()) {
    			if (!"id".equals(name) && !"widgetId".equals(name)) {
    				jsonBuilder.add(name, configObject.get(name));
    			}
    		}
    		return jsonBuilder.build().toString();
    	} catch (Exception e) {
    		LOGGER.warn("Could not migrate config: \"" + config + "\"", e);
    		return "{}";
    	}
    }

    private int createDashboard(String structure, int userId, int refreshInterval) throws DatabaseException, SQLException {
        PreparedStatement insertInDashboardStm = jdbcConnection.prepareStatement(INSERT_INTO_DASHBOARD, Statement.RETURN_GENERATED_KEYS);
        insertInDashboardStm.setInt(1, userId);
        insertInDashboardStm.setString(2, "Personalised Dashboard");
        insertInDashboardStm.setString(3, structure);
        insertInDashboardStm.setInt(4, refreshInterval);

        insertInDashboardStm.executeUpdate();
        ResultSet dashBoardRs = insertInDashboardStm.getGeneratedKeys();
        dashBoardRs.next();

        return dashBoardRs.getInt(1);
    }

    private String getWidgetConfig(int userId, int widgetId) throws DatabaseException, SQLException {
        PreparedStatement selectWidgetConfig = jdbcConnection.prepareStatement(SELECT_WIDGET_CONFIG);
        selectWidgetConfig.setInt(1, userId);
        selectWidgetConfig.setInt(2, widgetId);
        ResultSet widgetConfigRs = selectWidgetConfig.executeQuery();

        if (!widgetConfigRs.next()) {
            return "";
        }

        return widgetConfigRs.getString("config");
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
