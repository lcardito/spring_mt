package me.lcardito.spring.util;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;
import java.sql.Timestamp;
import java.time.LocalDateTime;

@Converter(autoApply = true)
public class LocalDateTimePersistenceConverter implements AttributeConverter<LocalDateTime, Timestamp> {

    public Timestamp convertToDatabaseColumn(LocalDateTime entityValue) {
        if (entityValue == null) return null;
        return Timestamp.valueOf(entityValue);
    }

    public LocalDateTime convertToEntityAttribute(Timestamp databaseValue) {
        if (databaseValue == null) return null;
        return databaseValue.toLocalDateTime();
    }
}
