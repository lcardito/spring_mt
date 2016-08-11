package com.clearvision.spectrum.model;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * This annotation can be applied to a model member variable that needs to be filterable.
 * <p>
 * It's used so that one or more model member variable are included in our search mechanism - i.e. at the DAO level, the
 * filter string will be applied to the model members containing the filterable annotation.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface Filterable {
}
